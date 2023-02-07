import configurationHelper from '../../common/services/configurationHelper';
import { useEffect, useState } from 'react';
import recentShipmentsApi from './RecentShipmentsApi';
import DashboardTable from '../../common/components/DashboardTable';
import StatusLabel from '../../common/components/StatusLabel';
import { formatTitleCase } from '../../common/utility';

const RecentShipments = (props) => {
  const { configElement } = props;
  const [config, setConfig] = useState();
  const [shipments, setShipments] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const c = configurationHelper(configElement);
    if (c === undefined || config) {
      return;
    }
    setConfig(c);
  }, [configElement, config]);

  useEffect(() => {
    (async () => {
      if (!config) {
        return;
      }
      const { accountid, channelid, maxentries } = config;
      await recentShipmentsApi(channelid, accountid, maxentries)
        .then((shipments) => {
          setShipments(shipments);
          setLoaded(true);
        })
        .catch((reason) => console.error(reason));
    })();
  }, [config]);

  const iteraiteShipments = (shipments) => {
    if (shipments.length <= 0) {
      return (
        <tr>
          <td colSpan={columns.length}>
            {loaded ? (
              <div className="alert alert-info">No shipments found</div>
            ) : (
              <div className="loading-animation loading-animation-md"></div>
            )}
          </td>
        </tr>
      );
    }
    return shipments.map((shipment) => {
      return (
        <tr key={shipment.shipmentId}>
          <td>{shipment.orderId}</td>
          <td>{shipment.sentTo}</td>
          <td>
            <StatusLabel
              type={shipment.status === 'delivered' ? 'success' : 'pending'}
            >
              {formatTitleCase(shipment.status)}
            </StatusLabel>
          </td>
          <td>{shipment.trackingNumber}</td>
        </tr>
      );
    });
  };

  const columns = ['Reference', 'Sent To', 'Status', 'Tracking'];

  return (
    <DashboardTable columns={columns}>
      {iteraiteShipments(shipments)}
    </DashboardTable>
  );
};

export default RecentShipments;
