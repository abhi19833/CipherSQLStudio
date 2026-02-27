import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../api/client";

function AssignmentListPage() {
  const [assignmentList, setAssignmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function fetchAssignments() {
      try {
        const response = await apiClient.get("/assignments");

        if (!isCancelled) {
          setAssignmentList(response.data.assignments || []);
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error.response?.data?.message || "Failed to load assignments.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchAssignments();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <main className="page page--list">
      <header className="hero">
        <h1 className="hero__title">CipherSQLStudio</h1>
        <p className="hero__subtitle">Practice SQL on real assignment data.</p>
      </header>

      {isLoading && <p className="status">Loading assignments...</p>}
      {loadError && <p className="status status--error">{loadError}</p>}

      <section className="cards">
        {assignmentList.map((assignment) => (
          <article key={assignment.id} className="assignment-card">
            <div className="assignment-card__meta">{assignment.difficulty}</div>
            <h2 className="assignment-card__title">{assignment.title}</h2>
            <p className="assignment-card__desc">{assignment.description}</p>
            <Link className="button" to={`/assignments/${assignment.id}`}>
              Attempt
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AssignmentListPage;
