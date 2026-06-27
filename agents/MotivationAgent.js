import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Motivation Agent: Provides customized study tips, pep talks, and quick motivational boosts.
 * Uses Google Gemini (gemini-2.5-flash) to output structured JSON data.
 */
export async function runMotivationAgent(subject, topic) {
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

  const systemPrompt = `You are the 'Motivation Agent', an academic counselor, mindset coach, and cheerleader.
Your goal is to supply the student with psychological strength, study efficiency tips, and a motivational boost tailored to their subject and topic.

Generate a structured motivational package in JSON format.
Format the output EXACTLY matching this JSON schema:
{
  "pepTalk": "String (A high-energy, empathetic, inspiring pep talk addressing the student studying the subject and topic. Acknowledge that the topic can be challenging but reassure them of their potential.)",
  "subjectTips": [
    {
      "tip": "String (Short title of the study tip, e.g., 'Visualization')",
      "description": "String (Explanation of how to apply this tip specifically to mastering this topic)"
    }
  ],
  "mindsetQuote": {
    "quote": "String (An inspiring quote on learning, grit, or resilience)",
    "author": "String (Author of the quote)"
  }
}

Guidelines:
1. Tone should be warm, inspiring, empowering, and positive.
2. The study tips should be highly practical and specific to the style of content (e.g. for Physics, focus on visual diagrams or formula sheets; for languages, active conversation or writing).
3. Do not sound generic; make references to the specific subject and topic.`;

  const userPrompt = `Create a custom motivation and study tip package for:
- Subject: ${subject}
- Topic: ${topic}`;

  const response = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt }
  ]);

  const text = response.response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON from Motivation Agent:", text);
    throw new Error("Motivation Agent generated an invalid JSON response.");
  }
}

/**
 * Generates a single quick motivational quote and micro-tip.
 * Perfect for quick boosts in the UI.
 */
export async function runQuickMotivationBoost() {
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

  const systemPrompt = `You are the 'Motivation Agent'. Provide a quick mindset booster.
Generate a structured JSON output matching this schema:
{
  "quote": "String (An inspiring quote about perseverance or success)",
  "author": "String (Author name)",
  "microTip": "String (A 1-sentence actionable study tip, e.g. 'Turn off your phone and place it in another room for 30 minutes.')"
}`;

  const response = await model.generateContent([
    { text: systemPrompt },
    { text: "Generate a quick motivational quote and micro-tip." }
  ]);

  const text = response.response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON from Quick Motivation Boost:", text);
    throw new Error("Motivation Agent generated an invalid JSON response.");
  }
}
