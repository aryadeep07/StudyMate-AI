# StudyMate AI 🎓🤖

StudyMate AI is a multi-agent learning coach designed to help students prepare for upcoming exams. Powered by Google Gemini (using the **gemini-2.5-flash** model), the application creates personalized study schedules, builds revision timelines, generates interactive multiple-choice quizzes, and provides motivational study tips through a responsive dark-themed dashboard.

---

# 📖 Overview

Preparing for exams requires students to manage study schedules, revise topics regularly, practice questions, and stay motivated. Most existing study tools solve only one of these problems, forcing students to switch between multiple applications.

StudyMate AI brings these essential learning activities together in one application using a **multi-agent architecture**. Each AI agent performs a specialized task, allowing students to receive a complete study kit with a single request.

This project was built as the capstone project for Kaggle's **5-Day AI Agents: Intensive Vibe Coding Course with Google**.

---

# ✨ Features

* 📅 Personalized Study Planner
* 📝 AI-generated Practice Quiz
* 📖 Revision Timeline
* 💡 Motivation & Study Tips
* 🤖 Multi-Agent Architecture
* 🌙 Responsive Glassmorphism Dashboard
* 🔒 Secure Backend API Integration

---

# 🚀 Quickstart Guide

## Prerequisites

* Node.js (v18.0.0 or higher)
* Google Gemini API Key (Obtain a free API key from Google AI Studio)

---

## 1. Installation

Clone or navigate to the project directory and install the necessary dependencies.

```bash
npm install
```

---

## 2. Configure Environment Variables

Copy the `.env.example` file to create a `.env` file.

```bash
cp .env.example .env
```

Replace the placeholder with your own Gemini API key.

```env
GEMINI_API_KEY=AIzaSyYourActualKeyHere...
PORT=3000
```

---

## 3. Run the Application

```bash
npm run dev

# or

npm start
```

Open your browser:

```
http://localhost:3000
```

---

# 📂 Project Structure

```
StudyMate-AI/
├── agents/
│   ├── PlannerAgent.js
│   ├── QuizAgent.js
│   ├── RevisionAgent.js
│   └── MotivationAgent.js
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

# 🏛️ System Architecture

StudyMate AI follows a **parallel multi-agent architecture**.

When the user submits study details, the Express.js backend coordinates four specialized AI agents simultaneously using **Promise.all()**. Each agent focuses on one responsibility and the results are merged into a unified study dashboard.

```
User
   │
   ▼
Frontend (HTML/CSS/JavaScript)
   │
POST /api/generate
   │
   ▼
Express Backend (server.js)
   │
   ├── Planner Agent
   ├── Quiz Agent
   ├── Revision Agent
   └── Motivation Agent
          │
          ▼
 Google Gemini API
          │
          ▼
 Combined Dashboard Response
```

---

# 🤖 Multi-Agent Design

### Planner Agent

Creates a personalized study schedule based on the selected subject, topic, exam date, and daily study hours.

### Quiz Agent

Generates multiple-choice questions with answer options and explanations.

### Revision Agent

Creates a structured revision timeline using spaced repetition and active recall techniques.

### Motivation Agent

Provides personalized motivational messages and practical study tips.

---

# 📡 API Endpoints

## POST `/api/generate`

Generates the complete study kit.

Example Request

```json
{
  "subject": "Chemistry",
  "topic": "Organic Reactions",
  "examDate": "2026-07-15",
  "dailyHours": 4
}
```

Example Response

```json
{
  "success": true,
  "data": {
    "planner": {},
    "quiz": {},
    "revision": {},
    "motivation": {}
  }
}
```

---

## GET `/api/motivation-boost`

Returns a quick motivational message for the student.

---

# 🔒 Security

The project follows standard backend security practices.

* Gemini API key is stored securely using environment variables.
* Sensitive files are excluded using `.gitignore`.
* API requests are processed only through the Express backend.
* API credentials are never exposed to the frontend.
* `.env.example` is included for safe project setup.

---

# ☁️ Deployment

The application can be deployed easily on platforms such as:

* Render
* Railway
* Vercel

Deployment Steps

1. Push the repository to GitHub.
2. Connect the repository to your hosting platform.
3. Set:

Build Command

```bash
npm install
```

Start Command

```bash
npm start
```

4. Add the `GEMINI_API_KEY` as an Environment Variable.

---

# 📚 What I Learned

This project helped me gain practical experience with:

* Multi-Agent AI Architecture
* Google Gemini API Integration
* Express.js Backend Development
* Environment Variable Management
* Secure API Handling
* Modular Application Design
* AI-powered Educational Applications

---

# 🚀 Future Improvements

* User authentication
* Progress tracking
* Previous-year question generation
* PDF export for study plans
* Performance analytics
* Voice interaction
* Multi-language support

---

# 📄 License

This project was developed for educational purposes as part of Kaggle's **5-Day AI Agents: Intensive Vibe Coding Course with Google**.
