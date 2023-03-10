import { getFetch } from '../../common/services/liferay/api';
import { PAGE_PARAM, PAGE_SIZE_PARAM } from '../../common/const';
import { buildUrlPath } from '../../common/utility';

const PLACED_ORDERS_API_PATH_TEMPLATE =
  '/o/headless-commerce-delivery-order/v1.0/channels/[channelId]/accounts/[accountId]/placed-orders';

const recentOrdersApi = (channelId, accountId, maxEntries) => {
  console.debug(`Param channelId=${channelId}`);
  console.debug(`Param accountId=${accountId}`);
  console.debug(`Param maxEntries=${maxEntries}`);

  if (channelId <= 0 || accountId <= 0) {
    throw new Error('Parameters were invalid');
  }

  maxEntries = maxEntries && typeof maxEntries === 'number' ? maxEntries : 7;

  console.debug(`Using maxEntries=${maxEntries}`);

  const recentOrdersApiPath = buildUrlPath(PLACED_ORDERS_API_PATH_TEMPLATE, {
    channelId,
    accountId,
  });

  const searchParams = new URLSearchParams();
  searchParams.append(PAGE_PARAM, 1);
  searchParams.append(PAGE_SIZE_PARAM, maxEntries);

  return getFetch(recentOrdersApiPath, searchParams);
};

export default recentOrdersApi;
