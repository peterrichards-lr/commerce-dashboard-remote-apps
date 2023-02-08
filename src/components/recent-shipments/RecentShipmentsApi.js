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

const recentShipmentsApi = async (channelId, accountId, maxEntries) => {
  console.debug(`Param channelId=${channelId}`);
  console.debug(`Param accountId=${accountId}`);
  console.debug(`Param maxEntries=${maxEntries}`);

  if (channelId <= 0 || accountId <= 0) {
    throw new Error('Parameters were invalid');
  }

  maxEntries = maxEntries && typeof maxEntries === 'number' ? maxEntries : 7;

  console.debug(`Using maxEntries=${maxEntries}`);

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

  const orders = await postFetch(GRAPHQL_PATH, placedOrdersGraphQLQuery).then(
    (placedOrdersRespone) => {
      const { items } = parseGraphQlQueryResponse(
        'channelAccountPlacedOrders',
        placedOrdersRespone
      );
      console.debug(`Found ${items.length} placed orders(s)`);
      return items;
    }
  );

  if (orders && Array.isArray(orders) && orders.length > 0) {
    const orderIds = orders.map((o) => o.id);
    const shippingAddresses = await Promise.all(
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

    const shipmentsArray = await Promise.all(
      orderIds.map(async (orderId) => {
        const orderItemsGraphQlQuery = buildGraphQlQuery(
          'placedOrderPlacedOrderItems',
          'items { id }',
          {
            placedOrderId: orderId
          }
        );

        const placedOrderItemsResponse = await postFetch(GRAPHQL_PATH, orderItemsGraphQlQuery);
        const { items } = parseGraphQlQueryResponse(
          'placedOrderPlacedOrderItems',
          placedOrderItemsResponse
        );

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
          console.debug(`Found ${shipmentCount} shipment(s)`);
          return shipments.map((shipment) => ({
            id: shipment.id,
            trackingNumber: shipment.trackingNumber,
          }));
        }
        return [];
      })
    );

    const orderShipments = orderIds.map((orderId, i) => {
      const shippingAddress = shippingAddresses[i];
      const address = formatAddress(shippingAddress);
      const shipments = shipmentsArray[i];
      var shipmentInfoBase = {
        orderId,
        sentTo: address,
        status: 'delivered',
      };
      console.debug(`Returning ${shipments.length} shipments for ${orderId}`);
      return shipments.map((shipment) => ({
        ...shipmentInfoBase,
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
      }));
    });

    return orderShipments ? orderShipments.flat(1).slice(0, maxEntries) : [];
  }
  return [];
};

export default recentShipmentsApi;
