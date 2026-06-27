import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Quiz Agent: Generates interactive multiple-choice practice questions from a topic.
 * Uses Google Gemini (gemini-2.5-flash) to output structured JSON data.
 */
export async function runQuizAgent(subject, topic) {
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

  const systemPrompt = `You are the 'Quiz Agent', an experienced teacher and assessment specialist.
Your goal is to generate 5 high-quality, conceptually challenging multiple-choice questions (MCQs) to test a student's understanding of the given topic.

Generate a structured quiz in JSON format.
Format the output EXACTLY matching this JSON schema:
{
  "quizTitle": "String (e.g. Concept Mastery Quiz: Quantum Mechanics)",
  "subject": "String",
  "topic": "String",
  "questions": [
    {
      "id": "Number (e.g. 1)",
      "question": "String (The question text itself, clear and unambiguous)",
      "options": {
        "A": "String (First choice)",
        "B": "String (Second choice)",
        "C": "String (Third choice)",
        "D": "String (Fourth choice)"
      },
      "correctOption": "String (Either 'A', 'B', 'C', or 'D')",
      "explanation": "String (Detailed explanation of why the correct option is right, and why others are wrong, teaching the core concept)"
    }
  ]
}

Guidelines:
1. Ensure the questions test concept comprehension, application, or critical thinking, rather than just simple rote memorization.
2. The options must be plausible distractors to make the test educational.
3. Make sure the explanation is thorough and educational so that the student learns even if they get it wrong.
4. Stick strictly to the specified subject and topic.`;

  const userPrompt = `Create a 5-question multiple-choice quiz for:
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
    console.error("Failed to parse JSON from Quiz Agent:", text);
    throw new Error("Quiz Agent generated an invalid JSON response.");
  }
}
