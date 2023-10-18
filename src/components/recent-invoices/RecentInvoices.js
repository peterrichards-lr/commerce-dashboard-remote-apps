import { useEffect, useState } from 'react';
import { propsStrToObj } from '../../common/utility';
import { Liferay } from '../../common/services/liferay/liferay';
import recentInvoicesApi from './RecentInvoicesApi';
import DashboardTable from '../../common/components/DashboardTable';
import FormatCurrency from '../../common/components/FormatCurrency';
import StatusLabel from '../../common/components/StatusLabel';
import FormatDate from '../../common/components/FormatDate';
import RowAction from '../../common/components/RowAction';

const RecentInvoices = (props) => {
  const languageId = Liferay.ThemeDisplay.getLanguageId();
  const [invoices, setInvoices] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { maxEntries, filterByAccount } = propsStrToObj(props);
      const accountId = Liferay?.CommerceContext?.account?.accountId || 0;
      await recentInvoicesApi(accountId, maxEntries, filterByAccount)
        .then((response) => {
          const { items, pageSize, totalCount } = response;
          if (items === undefined || !(items instanceof Array)) {
            console.warn('Items is not an array');
            return;
          }
          if (pageSize < totalCount) {
            console.warn(
              `The returned set of items is not the full set: returned ${pageSize}, set size ${totalCount}`
            );
          }
          if (items.length !== pageSize) {
            console.debug(
              `There are fewer items than requested: requested: returned ${items.length}, requested ${pageSize}`
            );
          }
          const invoices = items.map((i) => ({
            invoiceId: i.id,
            invoiceDate: i.dateCreated,
            accountId: i.r_invoice_accountEntryId,
            orderId: i.r_invoice_commerceOrderId,
            paymentStatus: i.paymentStatus.name,
            currency: i.currency,
            total: i.total,
            isPaid: i.paymentStatus.name
              ? i.paymentStatus.name.toLowerCase() === 'paid'
              : false,
          }));
          setInvoices(invoices);
          setLoaded(true);
        })
        .catch((reason) => console.error(reason));
    })();
  }, [props]);

  const iteraiteInvoices = (invoices) => {
    if (invoices.length <= 0) {
      return (
        <tr>
          <td colSpan={columns.length}>
            {loaded ? (
              <div className="alert alert-info">No invoices found</div>
            ) : (
              <div className="loading-animation loading-animation-md"></div>
            )}
          </td>
        </tr>
      );
    }
    return invoices.map((invoice) => {
      var statusType;
      switch (invoice.paymentStatus.toLowerCase()) {
        case 'paid':
          statusType = 'success';
          break;
        case 'overdue':
          statusType = 'failure';
          break;
        default:
          statusType = 'pending';
          break;
      }
      return (
        <tr key={invoice.invoiceId}>
          <td>{invoice.invoiceId}</td>
          <td>
            <FormatDate value={invoice.invoiceDate} format={'DD MMM YYYY'} />
          </td>
          <td>{invoice.orderId}</td>
          <td>
            <StatusLabel type={statusType}>{invoice.paymentStatus}</StatusLabel>
          </td>
          <td>
            <FormatCurrency
              languageIsoCode={languageId}
              currencyIsoCode={invoice.currency}
              amount={invoice.total}
            />
          </td>
          <td>
            <RowAction> {invoice.isPaid ? 'View' : 'Pay'}</RowAction>
          </td>
        </tr>
      );
    });
  };

  const columns = [
    'Invoice ID',
    'Date',
    'Created ID',
    'Status',
    'Amount',
    'Action',
  ];

  return (
    <DashboardTable columns={columns}>
      {iteraiteInvoices(invoices)}
    </DashboardTable>
  );
};

export default RecentInvoices;
