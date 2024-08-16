import { getFetch } from '../../common/services/liferay/api';
import { PAGE_PARAM, PAGE_SIZE_PARAM } from '../../common/const';
import { buildUrlPath } from '../../common/utility';
import MissingCommerceContextError from '../../common/MissingCommerceContextError';

const PLACED_ORDERS_API_PATH_TEMPLATE =
  '/o/headless-commerce-delivery-order/v1.0/channels/[channelId]/accounts/[accountId]/placed-orders';

const recentOrdersApi = async (channelId, accountId, maxEntries, logging) => {
  if (logging) console.debug(`Param channelId=${channelId}`);
  if (logging) console.debug(`Param accountId=${accountId}`);
  if (logging) console.debug(`Param maxEntries=${maxEntries}`);

  if (channelId <= 0 || accountId <= 0) {
    throw new MissingCommerceContextError('Parameters were invalid');
  }

  maxEntries = maxEntries && typeof maxEntries === 'number' ? maxEntries : 7;

  if (logging) console.debug(`Using maxEntries=${maxEntries}`);

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
