import Editor from "@monaco-editor/react";

function SqlEditorPanel({ query, setQuery, onExecute, running }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <h2>SQL Editor</h2>
        <button className="button" onClick={onExecute} disabled={running}>
          {running ? "Executing..." : "Execute Query"}
        </button>
      </div>

      <Editor
        height="320px"
        defaultLanguage="sql"
        value={query}
        onChange={(nextValue) => setQuery(nextValue || "")}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14
        }}
      />
    </section>
  );
}

export default SqlEditorPanel;
