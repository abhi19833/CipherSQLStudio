import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../api/client";
import ResultsPanel from "../components/ResultsPanel";
import SampleDataViewer from "../components/SampleDataViewer";
import SqlEditorPanel from "../components/SqlEditorPanel";

const DEMO_USER_ID = "demo-user";

function AssignmentAttemptPage() {
  const { id } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [tablePreviews, setTablePreviews] = useState([]);
  const [queryText, setQueryText] = useState("SELECT * FROM customers");
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState("");
  const [hintText, setHintText] = useState("");
  const [recentAttempts, setRecentAttempts] = useState([]);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isRunningQuery, setIsRunningQuery] = useState(false);
  const [isHintLoading, setIsHintLoading] = useState(false);

  async function fetchRecentAttempts(assignmentId) {
    try {
      const response = await apiClient.get("/query/attempts", {
        params: {
          assignmentId: Number(assignmentId),
          userId: DEMO_USER_ID
        }
      });

      setRecentAttempts(response.data.attempts || []);
    } catch {
      setRecentAttempts([]);
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadPageData() {
      try {
        const response = await apiClient.get(`/assignments/${id}`);

        if (isCancelled) return;

        setAssignment(response.data.assignment);
        setTablePreviews(response.data.tables || []);
        await fetchRecentAttempts(id);
      } catch (error) {
        if (!isCancelled) {
          setQueryError(error.response?.data?.message || "Failed to load assignment.");
        }
      } finally {
        if (!isCancelled) {
          setIsPageLoading(false);
        }
      }
    }

    loadPageData();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  async function runQuery() {
    setIsRunningQuery(true);
    setHintText("");

    try {
      const response = await apiClient.post("/query/execute", {
        assignmentId: Number(id),
        query: queryText,
        userId: DEMO_USER_ID
      });

      setQueryResult(response.data);
      setQueryError("");
      await fetchRecentAttempts(id);
    } catch (error) {
      setQueryResult(null);
      setQueryError(error.response?.data?.message || "Query execution failed.");
      await fetchRecentAttempts(id);
    } finally {
      setIsRunningQuery(false);
    }
  }

  async function requestHint() {
    setIsHintLoading(true);

    try {
      const response = await apiClient.post("/hints", {
        assignmentId: Number(id),
        userQuery: queryText,
        errorMessage: queryError
      });

      setHintText(response.data.hint);
    } catch (error) {
      setHintText(error.response?.data?.message || "Hint service failed.");
    } finally {
      setIsHintLoading(false);
    }
  }

  if (isPageLoading) {
    return (
      <main className="page page--attempt">
        <p className="status">Loading assignment...</p>
      </main>
    );
  }

  return (
    <main className="page page--attempt">
      <header className="attempt-header">
        <Link className="button button--ghost" to="/">
          Back
        </Link>
        <h1>{assignment?.title}</h1>
        <span className="attempt-header__difficulty">{assignment?.difficulty}</span>
      </header>

      <section className="panel">
        <div className="panel__header">
          <h2>Question</h2>
        </div>
        <p>{assignment?.question}</p>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Sample Data</h2>
        </div>
        <SampleDataViewer tables={tablePreviews} />
      </section>

      <SqlEditorPanel query={queryText} setQuery={setQueryText} onExecute={runQuery} running={isRunningQuery} />
      <ResultsPanel data={queryResult} error={queryError} />

      {queryResult?.truncated && (
        <p className="status">Result limited to first 200 rows. Add a tighter LIMIT for full control.</p>
      )}

      <section className="panel">
        <div className="panel__header">
          <h2>Need a Hint?</h2>
          <button className="button" onClick={requestHint} disabled={isHintLoading}>
            {isHintLoading ? "Generating..." : "Get Hint"}
          </button>
        </div>
        <p className="hint-box">{hintText || "Hints will appear here. They are guidance, not full answers."}</p>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Recent Attempts</h2>
        </div>

        {recentAttempts.length === 0 && <p className="status">No attempts yet.</p>}

        <div className="attempt-list">
          {recentAttempts.map((attempt) => (
            <article key={attempt._id} className="attempt-item">
              <div className="attempt-item__top">
                <span className={attempt.status === "success" ? "status" : "status status--error"}>
                  {attempt.status}
                </span>
                <span className="attempt-item__time">{new Date(attempt.createdAt).toLocaleString()}</span>
              </div>
              <code className="attempt-item__query">{attempt.query}</code>
              {attempt.error && <p className="status status--error">{attempt.error}</p>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default AssignmentAttemptPage;
