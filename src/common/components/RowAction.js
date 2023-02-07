const RowAction = ({ children }) => {
  return (
    <div className="btn-group">
      <div className="btn-group-item">
        <button className="btn btn-secondary" type="submit">
          {children}
        </button>
      </div>
    </div>
  );
};

export default RowAction;
