import express from "express";
import { pgPool } from "../config/db.js";

const router = express.Router();
const PREVIEW_ROW_LIMIT = 10;

function toAssignmentId(value) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

async function loadAssignmentById(assignmentId) {
  const { rows } = await pgPool.query(
    `SELECT id, title, description, difficulty, question, table_names
     FROM assignments
     WHERE id = $1`,
    [assignmentId]
  );

  return rows[0] || null;
}

async function loadTablePreview(tableName) {
  const [schemaResult, dataResult] = await Promise.all([
    pgPool.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [tableName]
    ),
    pgPool.query(`SELECT * FROM "${tableName}" LIMIT ${PREVIEW_ROW_LIMIT}`)
  ]);

  return {
    name: tableName,
    schema: schemaResult.rows,
    sampleRows: dataResult.rows
  };
}

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pgPool.query(
      `SELECT id, title, description, difficulty
       FROM assignments
       ORDER BY id ASC`
    );

    return res.json({ assignments: rows });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch assignments.",
      error: error.message
    });
  }
});

router.get("/:id", async (req, res) => {
  const assignmentId = toAssignmentId(req.params.id);
  if (!assignmentId) {
    return res.status(400).json({ message: "Invalid assignment id." });
  }

  try {
    const assignment = await loadAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    const tableNames = Array.isArray(assignment.table_names) ? assignment.table_names : [];
    const tables = await Promise.all(tableNames.map(loadTablePreview));

    return res.json({ assignment, tables });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch assignment detail.",
      error: error.message
    });
  }
});

export default router;
