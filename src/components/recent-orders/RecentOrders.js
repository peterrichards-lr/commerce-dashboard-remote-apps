import { useEffect, useState } from 'react';
import { propsStrToObj } from '../../common/utility';
import { Liferay } from '../../common/services/liferay/liferay';
import recentOrdersApi from './RecentOrdersApi';
import DashboardTable from '../../common/components/DashboardTable';
import StatusLabel from '../../common/components/StatusLabel';
import FormatCurrency from '../../common/components/FormatCurrency';
import FormatDate from '../../common/components/FormatDate';

const RecentOrders = (props) => {
  const languageId = Liferay.ThemeDisplay.getLanguageId();
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { maxEntries } = propsStrToObj(props);
      const accountId = Liferay?.CommerceContext?.account?.accountId || 0;
      const channelId = Liferay?.CommerceContext?.commerceChannelId || 0;
      await recentOrdersApi(channelId, accountId, maxEntries)
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
        .catch((reason) => console.error(reason));
    })();
  }, [props]);

  const iteraiteOrders = (orders) => {
    if (orders.length <= 0) {
      return (
        <tr>
          <td colSpan={columns.length}>
            {loaded ? (
              <div className="alert alert-info">No orders found</div>
            ) : (
              <div className="loading-animation loading-animation-md"></div>
            )}
          </td>
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
