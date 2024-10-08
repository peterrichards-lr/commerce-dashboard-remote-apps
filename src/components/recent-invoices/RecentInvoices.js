import { useEffect, useState } from 'react';
import { propsStrToObj } from '../../common/utility';
import { Liferay } from '../../common/services/liferay/liferay';
import recentInvoicesApi from './RecentInvoicesApi';
import DashboardTable from '../../common/components/DashboardTable';
import FormatCurrency from '../../common/components/FormatCurrency';
import StatusLabel from '../../common/components/StatusLabel';
import FormatDate from '../../common/components/FormatDate';
import RowAction from '../../common/components/RowAction';
import MessageDisplayContext from '../../common/MessageDisplayContext';

const RecentInvoices = (props) => {
  const languageId = Liferay.ThemeDisplay.getLanguageId();
  const [invoices, setInvoices] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [messageDisplayContext, setMessageDisplayContext] = useState(
    new MessageDisplayContext()
  );

  useEffect(() => {
    (async () => {
      const { maxEntries, filterByAccount, logging } = propsStrToObj(props);
      const accountId = Liferay?.CommerceContext?.account?.accountId || 0;
      recentInvoicesApi(accountId, maxEntries, filterByAccount, logging)
        .then((response) => {
          const { items, pageSize, totalCount } = response;
          if (items === undefined || !(items instanceof Array)) {
            if (logging) console.warn('Items is not an array');
            return;
          }
          if (pageSize < totalCount) {
            if (logging)
              console.warn(
                `The returned set of items is not the full set: returned ${pageSize}, set size ${totalCount}`
              );
          }
          if (items.length !== pageSize) {
            if (logging)
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
        .catch((reason) => {
          if (reason?.name === 'MissingCommerceContextError') {
            setMessageDisplayContext(
              new MessageDisplayContext('alert-info', 'No account selected')
            );
          } else {
            console.error(reason);
            setMessageDisplayContext(
              new MessageDisplayContext(
                'alert-danger',
                'An error has occurred. Refer to the Console for more information.'
              )
            );
          }
          setErrored(true);
        });
    })();
  }, [props]);

  const infomationElement = () => {
    if (errored) {
      return (
        <div className={'alert ' + messageDisplayContext.cssClass}>
          {messageDisplayContext.message}
        </div>
      );
    } else if (loaded) {
      return <div className="alert alert-info">No invoices found</div>;
    }
    return <div className="loading-animation loading-animation-md"></div>;
  };

  const iteraiteInvoices = (invoices) => {
    if (invoices.length <= 0) {
      return (
        <tr>
          <td colSpan={columns.length}>{infomationElement()}</td>
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
