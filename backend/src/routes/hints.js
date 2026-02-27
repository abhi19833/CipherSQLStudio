import express from "express";
import { pgPool } from "../config/db.js";
import { generateHint } from "../services/hintService.js";

const router = express.Router();

function toAssignmentId(value) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

async function loadAssignmentForHint(assignmentId) {
  const { rows } = await pgPool.query(
    `SELECT id, title, description, question, table_names
     FROM assignments
     WHERE id = $1`,
    [assignmentId]
  );

  return rows[0] || null;
}

router.post("/", async (req, res) => {
  const { assignmentId: rawAssignmentId, userQuery, errorMessage } = req.body || {};
  const assignmentId = toAssignmentId(rawAssignmentId);

  if (!assignmentId) {
    return res.status(400).json({ message: "assignmentId is required." });
  }

  try {
    const assignment = await loadAssignmentForHint(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    const hint = await generateHint({ assignment, userQuery, errorMessage });
    return res.json({ hint });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate hint.",
      error: error.message
    });
  }
});

export default router;
