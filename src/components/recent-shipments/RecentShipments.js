import configurationHelper from '../../common/services/configurationHelper';
import { useEffect, useState } from 'react';
import { Liferay } from '../../common/services/liferay/liferay';
import recentShipmentsApi from './RecentShipmentsApi';
import DashboardTable from '../../common/components/DashboardTable';
import StatusLabel from '../../common/components/StatusLabel';
import { formatTitleCase } from '../../common/utility';
import MessageDisplayContext from '../../common/MessageDisplayContext';

const RecentShipments = (props) => {
  const { configElement } = props;
  const [config, setConfig] = useState();
  const [shipments, setShipments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [messageDisplayContext, setMessageDisplayContext] = useState(
    new MessageDisplayContext()
  );

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
      const { maxentries, logging } = config;
      const accountId = Liferay?.CommerceContext?.account?.accountId || 0;
      const channelId = Liferay?.CommerceContext?.commerceChannelId || 0;
      recentShipmentsApi(channelId, accountId, maxentries, logging)
        .then((shipments) => {
          setShipments(shipments);
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
  }, [config]);

  const infomationElement = () => {
    if (errored) {
      return (
        <div className={'alert ' + messageDisplayContext.cssClass}>
          {messageDisplayContext.message}
        </div>
      );
    } else if (loaded) {
      return <div className="alert alert-info">No shipments found</div>;
    }
    return <div className="loading-animation loading-animation-md"></div>;
  };

  const iteraiteShipments = (shipments) => {
    if (shipments.length <= 0 || errored) {
      return (
        <tr>
          <td colSpan={columns.length}>{infomationElement()}</td>
        </tr>
      );
    }
    return shipments.map((shipment) => {
      return (
        <tr key={shipment?.shipmentId}>
          <td>{shipment?.orderId}</td>
          <td>{shipment?.sentTo}</td>
          <td>
            <StatusLabel
              type={shipment?.status === 'delivered' ? 'success' : 'pending'}
            >
              {formatTitleCase(shipment?.status)}
            </StatusLabel>
          </td>
          <td>{shipment?.trackingNumber}</td>
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
