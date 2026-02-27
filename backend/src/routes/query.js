import express from "express";
import { pgPool } from "../config/db.js";
import { Attempt } from "../models/Attempt.js";
import { validateSqlQuery } from "../utils/sqlSafety.js";

const router = express.Router();

const MAX_VISIBLE_ROWS = 200;
const MAX_ATTEMPTS_TO_RETURN = 20;
const QUERY_TIMEOUT_MS = 5000;
const DEFAULT_USER_ID = "anonymous";

function toAssignmentId(value) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

async function recordAttempt(details) {
  try {
    await Attempt.create(details);
  } catch {
    // Query execution should not fail just because history logging failed.
  }
}

async function fetchAssignmentMeta(assignmentId) {
  const { rows } = await pgPool.query(
    "SELECT id, table_names FROM assignments WHERE id = $1",
    [assignmentId]
  );

  return rows[0] || null;
}

async function executeWithTimeout(sqlText) {
  const client = await pgPool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`SET LOCAL statement_timeout = ${QUERY_TIMEOUT_MS}`);
    const result = await client.query(sqlText);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

router.get("/attempts", async (req, res) => {
  const assignmentId = toAssignmentId(req.query.assignmentId);
  const userId = String(req.query.userId || DEFAULT_USER_ID);

  if (!assignmentId) {
    return res.status(400).json({ message: "assignmentId is required." });
  }

  try {
    const attempts = await Attempt.find({ assignmentId, userId })
      .sort({ createdAt: -1 })
      .limit(MAX_ATTEMPTS_TO_RETURN)
      .lean();

    return res.json({ attempts });
  } catch {
    return res.json({ attempts: [] });
  }
});

router.post("/execute", async (req, res) => {
  const { assignmentId: rawAssignmentId, query, userId = DEFAULT_USER_ID } = req.body || {};
  const assignmentId = toAssignmentId(rawAssignmentId);

  if (!assignmentId) {
    return res.status(400).json({ message: "Valid assignmentId is required." });
  }

  if (!query || !String(query).trim()) {
    return res.status(400).json({ message: "Query cannot be empty." });
  }

  try {
    const assignment = await fetchAssignmentMeta(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    const validation = validateSqlQuery(query, assignment.table_names || []);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    const result = await executeWithTimeout(query);

    await recordAttempt({
      userId,
      assignmentId,
      query,
      status: "success"
    });

    const rows = result.rows.slice(0, MAX_VISIBLE_ROWS);

    return res.json({
      columns: result.fields.map((field) => field.name),
      rows,
      rowCount: result.rowCount,
      truncated: result.rowCount > MAX_VISIBLE_ROWS
    });
  } catch (error) {
    await recordAttempt({
      userId,
      assignmentId,
      query,
      status: "error",
      error: error.message
    });

    return res.status(400).json({ message: error.message });
  }
});

export default router;
