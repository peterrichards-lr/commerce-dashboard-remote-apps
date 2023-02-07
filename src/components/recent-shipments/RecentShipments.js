import configurationHelper from '../../common/services/configurationHelper';
import { useEffect, useState } from 'react';
import recentShipmentsApi from './RecentShipmentsApi';
import DashboardTable from '../../common/components/DashboardTable';
import StatusLabel from '../../common/components/StatusLabel';
import { formatTitleCase } from '../../common/utility';

const RecentShipments = (props) => {
  const { config } = props;
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    (async () => {
      const { accountid, channelid, maxentries } = configurationHelper(config);
      await recentShipmentsApi(channelid, accountid, maxentries)
        .then((shipments) => {
          setShipments(shipments);
        })
        .catch((reason) => console.error(reason));
    })();
  }, [config]);

  const iteraiteShipments = (shipments) => {
    return shipments.map((shipment) => {
      return (
        <tr key={shipment.shipmentId}>
          <td>{shipment.orderId}</td>
          <td>{shipment.sentTo}</td>
          <td>
            <StatusLabel type={shipment.status === 'delivered' ? 'success' : 'pending'}>
              {formatTitleCase(shipment.status)}
            </StatusLabel>
          </td>
          <td>{shipment.trackingNumber}</td>
        </tr>
      );
    });
  };

  const columns = [
    'Reference',
    'Sent To',
    'Status',
    'Tracking',
  ];

  return (
    <DashboardTable columns={columns}>{iteraiteShipments(shipments)}</DashboardTable>
  );
};

export default RecentShipments;
