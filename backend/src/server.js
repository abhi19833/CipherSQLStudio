import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectMongo } from "./config/db.js";
import assignmentsRouter from "./routes/assignments.js";
import hintsRouter from "./routes/hints.js";
import queryRouter from "./routes/query.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/assignments", assignmentsRouter);
app.use("/api/query", queryRouter);
app.use("/api/hints", hintsRouter);

app.use((error, _req, res, _next) => {
  res
    .status(500)
    .json({ message: "Unexpected server error", error: error.message });
});

async function startServer() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Backend  on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
