import { getFetch } from '../../common/services/liferay/api';
import { PAGE_PARAM, PAGE_SIZE_PARAM } from '../../common/const';
import { buildUrlPath, formatAddress } from '../../common/utility';

const PLACED_ORDERS_API_PATH_TEMPLATE =
  '/o/headless-commerce-delivery-order/v1.0/channels/[channelId]/accounts/[accountId]/placed-orders';
const PLACED_ORDER_ADDRESS_API_PATH_TEMPLATE =
  '/o/headless-commerce-delivery-order/v1.0/placed-orders/[orderId]/placed-order-shipping-address';
const PLACED_ORDER_ITEMS_API_PATH_TEMPLATE =
  '/o/headless-commerce-delivery-order/v1.0/placed-orders/[orderId]/placed-order-items';
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

  const placedOrdersApiPath = buildUrlPath(PLACED_ORDERS_API_PATH_TEMPLATE, {
    channelId,
    accountId,
  });

  const searchParams = new URLSearchParams();
  searchParams.append(PAGE_PARAM, 1);
  searchParams.append(PAGE_SIZE_PARAM, maxEntries);

  const orders = await getFetch(placedOrdersApiPath, searchParams).then(
    (placedOrdersRespone) => {
      const { items, totalCount } = placedOrdersRespone;
      console.debug(`Found ${totalCount} placed orders(s)`);
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
        const placeOrderItemsApiPath = buildUrlPath(
          PLACED_ORDER_ITEMS_API_PATH_TEMPLATE,
          {
            orderId,
          }
        );

        const placedOrderItemsResponse = await getFetch(placeOrderItemsApiPath);
        const { items, totalCount } = placedOrderItemsResponse;
        console.debug(
          `Found ${totalCount} placed orders(s) for order ${orderId}`
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
