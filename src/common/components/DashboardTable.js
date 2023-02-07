const DashboardTable = ({ columns, children }) => {
  var colId = 1;
  return (
    <table className="table table-hover">
      <thead>
        <tr>
          {columns.map((c) => {
            return <th key={colId++} scope="col">{c}</th>;
          })}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

export default DashboardTable;
