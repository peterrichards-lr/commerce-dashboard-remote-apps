import { buildObjectAPISearchParams, buildSort } from '../../common/utility';
import { getFetch } from '../../common/services/liferay/api';
import MissingCommerceContextError from '../../common/MissingCommerceContextError';

const INVOICES_API_PATH = '/o/c/invoices/';
const ACCOUNT_ID_FIELD = 'r_invoice_accountEntryId';
const INVOICE_ID_FIELD = 'id';

const recentInvoicesApi = async (accountId, maxEntries, filterByAccount, logging) => {
  if (logging) console.debug(`Param accountId=${accountId}`);
  if (logging) console.debug(`Param maxEntries=${maxEntries}`);
  if (logging) console.debug(`Param filterByAccount=${filterByAccount}`);

  const actualMaxEntries =
    maxEntries && typeof maxEntries === 'number' ? maxEntries : 7;
  filterByAccount =
    typeof filterByAccount === 'undefined' ? false : filterByAccount;

  if (filterByAccount && accountId <= 0) {
    throw new MissingCommerceContextError('The account identifier is invalid');
  }

  if (logging) console.debug(`Using accountId=${accountId}`);
  if (logging) console.debug(`Using maxEntries=${actualMaxEntries}`);
  if (logging) console.debug(`Using filterByAccount=${filterByAccount}`);

  const filter = filterByAccount
    ? `${ACCOUNT_ID_FIELD} eq '${accountId}'`
    : undefined;
  const sort = buildSort(INVOICE_ID_FIELD, false);
  const searchParams = buildObjectAPISearchParams(
    filter,
    1,
    actualMaxEntries,
    sort
  );

  return getFetch(INVOICES_API_PATH, searchParams);
};

export default recentInvoicesApi;
