import {
    buildObjectAPISearchParams,
    buildSort,
  } from '../../common/utility';
  import { getFetch } from '../../common/services/liferay/api';
  
  const INVOICES_API_PATH = '/o/c/invoices/';
  const ACCOUNT_ID_FIELD = 'r_invoice_accountEntryId';
  const INVOICE_ID_FIELD = 'id';
  
  const recentInvoicesApi = (accountId, maxEntries, filterByAccount) => {
    console.debug(`Param accountId=${accountId}`);
    console.debug(`Param maxEntries=${maxEntries}`);
    console.debug(`Param filterByAccount=${filterByAccount}`);

    const actualMaxEntries = maxEntries && typeof maxEntries === 'number' ? maxEntries : 7;
    filterByAccount = typeof filterByAccount === 'undefined' ? false : filterByAccount;

    if (filterByAccount && accountId <= 0) {
      throw new Error('The account identifier is invalid');
    }
  
    console.debug(`Using accountId=${accountId}`);
    console.debug(`Using maxEntries=${actualMaxEntries}`);
    console.debug(`Using filterByAccount=${filterByAccount}`);

    const filter = filterByAccount ? `${ACCOUNT_ID_FIELD} eq '${accountId}'` : undefined;
    const sort = buildSort(INVOICE_ID_FIELD, false);
    const searchParams = buildObjectAPISearchParams(filter, 1, actualMaxEntries, sort);
  
    return getFetch(INVOICES_API_PATH, searchParams);
  };
  
  export default recentInvoicesApi;
  