function SampleDataViewer({ tables }) {
  if (!tables?.length) {
    return <p className="status">No sample data found.</p>;
  }

  return (
    <div className="sample-data">
      {tables.map((tableInfo) => {
        const sampleColumns = tableInfo.sampleRows[0] ? Object.keys(tableInfo.sampleRows[0]) : [];

        return (
          <section key={tableInfo.name} className="sample-data__table-card">
            <h3 className="sample-data__table-title">{tableInfo.name}</h3>

            <div className="sample-data__block">
              <strong>Schema</strong>
              <ul className="sample-data__schema-list">
                {tableInfo.schema.map((column) => (
                  <li key={`${tableInfo.name}-${column.column_name}`}>
                    {column.column_name} ({column.data_type})
                  </li>
                ))}
              </ul>
            </div>

            <div className="sample-data__block">
              <strong>Rows (max 10)</strong>
              <div className="table-scroll">
                <table className="result-table">
                  <thead>
                    <tr>
                      {sampleColumns.map((columnName) => (
                        <th key={columnName}>{columnName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableInfo.sampleRows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {sampleColumns.map((columnName) => (
                          <td key={`${rowIndex}-${columnName}`}>{String(row[columnName])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default SampleDataViewer;
