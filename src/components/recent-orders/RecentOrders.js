import { useEffect, useState } from 'react';
import { propsStrToObj } from '../../common/utility';
import { Liferay } from '../../common/services/liferay/liferay';
import recentOrdersApi from './RecentOrdersApi';
import DashboardTable from '../../common/components/DashboardTable';
import StatusLabel from '../../common/components/StatusLabel';
import FormatCurrency from '../../common/components/FormatCurrency';
import FormatDate from '../../common/components/FormatDate';
import MessageDisplayContext from '../../common/MessageDisplayContext';

const RecentOrders = (props) => {
  const languageId = Liferay.ThemeDisplay.getLanguageId();
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [messageDisplayContext, setMessageDisplayContext] = useState(
    new MessageDisplayContext()
  );

  useEffect(() => {
    (async () => {
      const { maxEntries, logging } = propsStrToObj(props);
      const accountId = Liferay?.CommerceContext?.account?.accountId || 0;
      const channelId = Liferay?.CommerceContext?.commerceChannelId || 0;
      recentOrdersApi(channelId, accountId, maxEntries, logging)
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
          const orders = items.map((o) => ({
            orderId: o.id,
            createdDate: o.dateCreated,
            accountName: o.account,
            status: o.orderStatusInfo.label_i18n,
            finalPrice: o.summary.total,
            isComplete: o.orderStatusInfo.label === 'completed',
          }));
          setOrders(orders);
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
      return <div className="alert alert-info">No orders found</div>;
    }
    return <div className="loading-animation loading-animation-md"></div>;
  };

  const iteraiteOrders = (orders) => {
    if (orders.length <= 0) {
      return (
        <tr>
          <td colSpan={columns.length}>{infomationElement()}</td>
        </tr>
      );
    }
    return orders.map((order) => {
      return (
        <tr key={order.orderId}>
          <td>{order.orderId}</td>
          <td>{order.accountName}</td>
          <td>
            <FormatDate value={order.dateCreated} format={'DD MMM YYYY'} />
          </td>
          <td>
            <StatusLabel type={order.isComplete ? 'success' : 'pending'}>
              {order.status}
            </StatusLabel>
          </td>
          <td>
            <FormatCurrency
              languageIsoCode={languageId}
              amount={order.finalPrice}
            />
          </td>
        </tr>
      );
    });
  };

  const columns = [
    'Order Id',
    'Account Name',
    'Created Date',
    'Status',
    'Final Price',
  ];

  return (
    <DashboardTable columns={columns}>{iteraiteOrders(orders)}</DashboardTable>
  );
};

export default RecentOrders;
