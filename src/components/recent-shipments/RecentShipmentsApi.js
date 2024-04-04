import { useInsertionEffect } from 'react';
import { getFetch, postFetch } from '../../common/services/liferay/api';
import {
  buildUrlPath,
  formatAddress,
  buildGraphQlQuery,
  parseGraphQlQueryResponse,
} from '../../common/utility';

const GRAPHQL_PATH = '/o/graphql';
const PLACED_ORDER_ADDRESS_API_PATH_TEMPLATE =
  '/o/headless-commerce-delivery-order/v1.0/placed-orders/[orderId]/placed-order-shipping-address';
const PLACED_ORDER_ITEM_SHIPMENTS =
  '/o/headless-commerce-delivery-order/v1.0/placed-order-items/[orderItemId]/placed-order-item-shipments';

const recentShipmentsApi = async (
  channelId,
  accountId,
  maxEntries,
  logging
) => {
  try {
    if (logging) console.debug(`Param channelId=${channelId}`);
    if (logging) console.debug(`Param accountId=${accountId}`);
    if (logging) console.debug(`Param maxEntries=${maxEntries}`);

    if (channelId <= 0 || accountId <= 0) {
      throw new Error('Parameters were invalid');
    }

    maxEntries = maxEntries && typeof maxEntries === 'number' ? maxEntries : 7;

    if (logging) console.debug(`Using maxEntries=${maxEntries}`);

    const placedOrdersGraphQLQuery = buildGraphQlQuery(
      'channelAccountPlacedOrders',
      'items { id }',
      {
        accountId,
        channelId,
        page: 1,
        pageSize: maxEntries,
      }
    );

    var orders;
    try {
      orders = await postFetch(GRAPHQL_PATH, placedOrdersGraphQLQuery).then(
        (placedOrdersRespone) => {
          const { items } = parseGraphQlQueryResponse(
            'channelAccountPlacedOrders',
            placedOrdersRespone
          );
          if (logging) console.debug(`Found ${items.length} placed orders(s)`);
          return items;
        }
      );
    } catch (e) {
      if (logging)
        console.error(`Unable to retrieve placed orders for ${accountId}`);
    }

    if (orders && Array.isArray(orders) && orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      var shippingAddresses;
      try {
        shippingAddresses = await Promise.allSettled(
          orderIds.map((orderId) => {
            const placedOrderAddressApiPath = buildUrlPath(
              PLACED_ORDER_ADDRESS_API_PATH_TEMPLATE,
              {
                orderId,
              }
            );
            return getFetch(placedOrderAddressApiPath);
          })
        );
      } catch (e) {
        if (logging)
          console.error(`Unable to retreive shipping address for ${orderIds}`);
      }

      if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
        var shipmentsArray;
        try {
          shipmentsArray = await Promise.allSettled(
            orderIds.map(async (orderId) => {
              const orderItemsGraphQlQuery = buildGraphQlQuery(
                'placedOrderPlacedOrderItems',
                'items { id }',
                {
                  placedOrderId: orderId,
                }
              );

              const placedOrderItemsResponse = await postFetch(
                GRAPHQL_PATH,
                orderItemsGraphQlQuery
              );
              const { items } = parseGraphQlQueryResponse(
                'placedOrderPlacedOrderItems',
                placedOrderItemsResponse
              );

              if (logging)
                console.debug(
                  `Found ${items.length} placed order item(s) for order ${orderId}`
                );
              if (items && Array.isArray(items) && items.length > 0) {
                const orderItemIds = items.map((oi) => oi.id);
                const shipmentResponses = await Promise.all(
                  orderItemIds.map((orderItemId) => {
                    const placeOrderItemShipments = buildUrlPath(
                      PLACED_ORDER_ITEM_SHIPMENTS,
                      {
                        orderItemId,
                      }
                    );
                    return getFetch(placeOrderItemShipments);
                  })
                );
                const shipments = shipmentResponses
                  .map((shipmentResponse) => shipmentResponse.items)
                  .flat(1);
                const shipmentCount = shipments.length;
                if (logging)
                  console.debug(`Found ${shipmentCount} shipment(s)`);
                return shipments.map((shipment) => ({
                  id: shipment.id,
                  trackingNumber: shipment.trackingNumber,
                }));
              }
              return [];
            })
          );
        } catch (e) {
          if (logging)
            console.error(`Unable to retreive order item(s) for ${orderIds}`);
        }
      }

      if (logging) console.debug('All shippingAddresses', shippingAddresses);
      if (logging) console.debug('All shipmentsArray', shipmentsArray);

      const orderShipments = orderIds.map((orderId, i) => {
        const shippingAddress =
          shippingAddresses &&
          Array.isArray(shippingAddresses) &&
          shippingAddresses.length >= i &&
          shippingAddresses[i] &&
          shippingAddresses[i].value &&
          shippingAddresses[i].value.id
            ? shippingAddresses[i].value
            : undefined;

        if (logging)
          console.debug(`shippingAddress for ${orderId}`, shippingAddress);

        const address = formatAddress(shippingAddress);

        const shipment =
          shipmentsArray &&
          Array.isArray(shipmentsArray) &&
          shipmentsArray.length >= i &&
          shipmentsArray[i] &&
          shipmentsArray[i].value &&
          Array.isArray(shipmentsArray[i].value) &&
          shipmentsArray[i].value.length > 0
            ? shipmentsArray[i].value[0]
            : undefined;

        if (logging) console.debug(`shipment for ${orderId}`, shipment);

        var shipmentInfoBase = {
          orderId,
          sentTo: address,
          status: 'delivered',
        };

        var orderObj;
        if (shipment) {
          orderObj = {
            ...shipmentInfoBase,
            shipmentId: shipment?.id,
            trackingNumber: shipment?.trackingNumber,
          };
        }
        if (logging) console.debug('orderObj', orderObj);
        return orderObj;
      });

      const rtnVal = orderShipments
        ? orderShipments
            .filter((e) => e !== undefined)
            .flat(1)
            .slice(0, maxEntries)
        : [];
      if (logging) console.debug('orderShipments', rtnVal);
      return rtnVal;
    }
  } catch (e) {
    if (logging) console.log(`Critical failure: ${e.message}`);
  }
  return [];
};

export default recentShipmentsApi;
