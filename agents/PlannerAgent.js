import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Planner Agent: Creates personalized study schedules.
 * Uses Google Gemini (gemini-2.5-flash) to output structured JSON data.
 */
export async function runPlannerAgent(subject, topic, examDate, dailyHours) {
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

  const systemPrompt = `You are the 'Planner Agent', a professional educational coordinator and study planner.
Your goal is to design a realistic, high-efficiency, personalized study schedule for a student.

Generate a structured daily study schedule in JSON format.
Format the output EXACTLY matching this JSON schema:
{
  "title": "String (e.g. Intensive 7-Day Study Plan for Physics - Quantum Mechanics)",
  "subject": "String",
  "topic": "String",
  "summary": "String (Brief overview explaining the pedagogical approach for this schedule)",
  "totalDays": "Number (Total days planned)",
  "schedule": [
    {
      "day": "Number (e.g., 1)",
      "date": "String (e.g., YYYY-MM-DD, starting from tomorrow or logical progression)",
      "focus": "String (Main theme for the day)",
      "tasks": [
        {
          "timeSlot": "String (e.g., 09:00 AM - 10:30 AM)",
          "activity": "String (Detailed, actionable task like 'Active recall on wave-particle duality equations')",
          "durationMinutes": "Number (e.g., 90)",
          "type": "String (One of: 'Core Study', 'Active Recall', 'Practice Questions', 'Review', 'Rest Break')"
        }
      ]
    }
  ]
}

Guidelines:
1. Distribute the study activities so that the total active study time matches the student's daily study hours budget: ${dailyHours} hours.
2. Incorporate spaced repetition and short rest breaks. Do not exceed the student's daily hour limit for active work.
3. Be specific and actionable: specify exactly WHAT to review and HOW (e.g. flashcards, mind maps, solving problems).
4. The timeline should be realistic, targeting the exam date: ${examDate}. Today's date is: ${today}.
5. If the exam is far away, create an optimal 7-day startup schedule. If the exam is closer, design a condensed schedule covering the remaining days leading up to the exam.`;

  const userPrompt = `Create a study schedule for:
- Subject: ${subject}
- Topic: ${topic}
- Exam Date: ${examDate}
- Daily Study Budget: ${dailyHours} hours
- Start Date (Today): ${today}`;

  const response = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt }
  ]);

  const text = response.response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON from Planner Agent:", text);
    throw new Error("Planner Agent generated an invalid JSON response.");
  }
}
