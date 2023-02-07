const StatusLabel = ({ type, children }) => {
  var labelClass = 'label';
  switch (type) {
    case 'success':
      labelClass += ' label-success';
      break;
    case 'pending':
      labelClass += ' label-warning';
      break;
    case 'failure':
      labelClass += ' label-danger';
      break;
    default:
      break;
  }
  return (
    <span className={labelClass}>
      <span className="label-item label-item-expand">{children}</span>
    </span>
  );
};

export default StatusLabel;