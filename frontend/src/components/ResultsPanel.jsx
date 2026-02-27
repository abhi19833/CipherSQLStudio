function ResultsPanel({ data, error }) {
  const hasData = Boolean(data);

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Results</h2>
      </div>

      {error && <p className="status status--error">{error}</p>}
      {!error && !hasData && <p className="status">Run a query to view results.</p>}

      {hasData && (
        <>
          <p className="status">Rows: {data.rowCount}</p>
          <div className="table-scroll">
            <table className="result-table">
              <thead>
                <tr>
                  {data.columns.map((columnName) => (
                    <th key={columnName}>{columnName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {data.columns.map((columnName) => (
                      <td key={`${rowIndex}-${columnName}`}>{String(row[columnName])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default ResultsPanel;
