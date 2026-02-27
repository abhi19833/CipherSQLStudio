import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_HINT =
  "Check join keys, then verify filters, then finalize selected columns. Build the query one clause at a time.";

let geminiClient;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }

  return geminiClient;
}

function buildHintPrompt({ assignment, userQuery, errorMessage }) {
  return [
    "You are helping a student debug SQL.",
    "Return one short hint (max 70 words).",
    "Do not provide the final query or multiple full steps.",
    "Focus on exactly one high-impact issue.",
    "",
    `Assignment title: ${assignment?.title || ""}`,
    `Assignment description: ${assignment?.description || ""}`,
    `Assignment question: ${assignment?.question || ""}`,
    `Expected tables: ${(assignment?.table_names || []).join(", ") || "(not specified)"}`,
    "",
    "Student SQL:",
    userQuery || "(none)",
    "",
    "Execution error:",
    errorMessage || "(none)"
  ].join("\n");
}

function cleanHint(text) {
  const singleLine = String(text || "").replace(/\s+/g, " ").trim();
  if (!singleLine) return DEFAULT_HINT;

  return singleLine.length > 280 ? `${singleLine.slice(0, 277)}...` : singleLine;
}

export async function generateHint({ assignment, userQuery, errorMessage }) {
  const client = getGeminiClient();
  if (!client) {
    return DEFAULT_HINT;
  }

  try {
    const model = client.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash"
    });

    const prompt = buildHintPrompt({ assignment, userQuery, errorMessage });
    const response = await model.generateContent(prompt);

    return cleanHint(response.response.text());
  } catch {
    return DEFAULT_HINT;
  }
}
