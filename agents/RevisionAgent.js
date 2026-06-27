import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Revision Agent: Creates revision plans and spaced-repetition schedules based on exam dates.
 * Uses Google Gemini (gemini-2.5-flash) to output structured JSON data.
 */
export async function runRevisionAgent(subject, topic, examDate) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const today = new Date().toISOString().split("T")[0];

  const systemPrompt = `You are the 'Revision Agent', an expert in cognitive science, learning efficiency, and exam preparation strategies.
Your goal is to create a spaced-repetition-based revision checklist and timeline leading up to the exam date.

Generate a structured revision plan in JSON format.
Format the output EXACTLY matching this JSON schema:
{
  "revisionTitle": "String (e.g. Spaced Repetition Revision Strategy)",
  "subject": "String",
  "topic": "String",
  "examDate": "String (YYYY-MM-DD)",
  "milestones": [
    {
      "timeFrame": "String (e.g., '14 Days Before', '7 Days Before', '3 Days Before', '1 Day Before')",
      "phaseName": "String (e.g., 'Comprehensive Active Recall', 'Targeted Weakness Fixing', 'High-Pressure Mock Exam', 'Confidence Building & Light Review')",
      "strategy": "String (Specific scientific revision strategy, e.g., 'Feynman Technique & Blurred Mind Mapping')",
      "tasks": [
        "String (Actionable milestone item, e.g., 'Draft a 1-page summary sheet from memory')",
        "String (Another actionable item)"
      ],
      "priority": "String ('High', 'Medium', or 'Critical')"
    }
  ],
  "examDayPrep": {
    "nightBefore": "String (Actionable advice for the evening before the exam)",
    "morningOf": "String (Actionable advice for the morning of the exam)"
  }
}

Guidelines:
1. Ground the revision strategy in evidence-based learning principles (Spaced Repetition, Active Recall, Feynman Technique, and practice testing).
2. Calculate or estimate the phases based on the gap between today (${today}) and the exam date (${examDate}). If the gap is short (e.g., less than 5 days), create a highly accelerated revision timeline (e.g., 3 days before, 2 days before, 1 day before). If the gap is longer, space it out logically.
3. Keep instructions clear, direct, and actionable.`;

  const userPrompt = `Create a revision plan for:
- Subject: ${subject}
- Topic: ${topic}
- Exam Date: ${examDate}
- Current Date: ${today}`;

  const response = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt }
  ]);

  const text = response.response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON from Revision Agent:", text);
    throw new Error("Revision Agent generated an invalid JSON response.");
  }
}
