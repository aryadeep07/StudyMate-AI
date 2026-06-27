import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import backend agents
import { runPlannerAgent } from "./agents/PlannerAgent.js";
import { runQuizAgent } from "./agents/QuizAgent.js";
import { runRevisionAgent } from "./agents/RevisionAgent.js";
import { runMotivationAgent, runQuickMotivationBoost } from "./agents/MotivationAgent.js";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static frontend assets from public directory
app.use(express.static(path.join(__dirname, "public")));

// Check API key configuration on startup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === "your_gemini_api_key_here") {
  console.warn("==================================================");
  console.warn("WARNING: GEMINI_API_KEY is not configured!");
  console.warn("Please update the .env file with your Google AI Studio API Key.");
  console.warn("==================================================");
}

/**
 * API Endpoint: Coordinates the multi-agent generation.
 * Takes subject, topic, examDate, and dailyHours.
 * Runs all four agents concurrently using Promise.all for speed.
 */
app.post("/api/generate", async (req, res) => {
  const { subject, topic, examDate, dailyHours } = req.body;

  // Simple validation
  if (!subject || !topic || !examDate || !dailyHours) {
    return res.status(400).json({
      error: "Missing required fields. Please supply subject, topic, examDate, and dailyHours."
    });
  }

  console.log(`[StudyMate AI] Initiating multi-agent run for subject: "${subject}", topic: "${topic}"...`);

  try {
    // Run all agents in parallel
    const [planner, quiz, revision, motivation] = await Promise.all([
      runPlannerAgent(subject, topic, examDate, Number(dailyHours)),
      runQuizAgent(subject, topic),
      runRevisionAgent(subject, topic, examDate),
      runMotivationAgent(subject, topic)
    ]);

    console.log(`[StudyMate AI] Successfully generated schedule, quiz, revision, and motivation files.`);

    res.json({
      success: true,
      data: {
        planner,
        quiz,
        revision,
        motivation
      }
    });
  } catch (error) {
    console.error("[StudyMate AI] Error during multi-agent orchestration:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An internal error occurred while generating study materials."
    });
  }
});

/**
 * API Endpoint: On-demand quick motivational booster.
 * Returns a single quote and actionable tip.
 */
app.get("/api/motivation-boost", async (req, res) => {
  console.log("[StudyMate AI] Generating quick motivation boost...");
  try {
    const boost = await runQuickMotivationBoost();
    res.json({
      success: true,
      data: boost
    });
  } catch (error) {
    console.error("[StudyMate AI] Error during quick motivation boost:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate motivational booster."
    });
  }
});

// Fallback to index.html for single-page routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`[StudyMate AI] Server is running at http://localhost:${PORT}`);
});
