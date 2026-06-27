# StudyMate AI 🎓🤖

StudyMate AI is a premium, multi-agent learning coach designed to help students prepare for upcoming exams. Powered by Google Gemini (using the `gemini-2.5-flash` model), the application organizes schedules, builds revision timelines, compiles interactive multiple-choice practice quizzes, and provides mindset pep-talks and cognitive study tips in a responsive, glassmorphic dark-theme dashboard.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **Google Gemini API Key** (Obtain a key for free from [Google AI Studio](https://aistudio.google.com))

### 1. Installation
Clone or navigate to the project directory and install the necessary dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to create a `.env` file:
```bash
cp .env.example .env
```
Open the `.env` file and replace the placeholder with your actual Gemini API Key:
```env
GEMINI_API_KEY=AIzaSyYourActualKeyHere...
PORT=3000
```

### 3. Run the Application
Start the local development server:
```bash
npm run dev
# or
npm start
```
Once started, open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Project Structure

The project is structured logically separating the Express backend, Gemini system prompts, and the single-page web assets:

```
StudyMate-AI/
├── agents/                     # Multi-Agent systems (Gemini prompts + JSON output schemas)
│   ├── PlannerAgent.js         # Creates daily calendars based on study budget
│   ├── QuizAgent.js            # Formulates interactive multiple-choice quizzes
│   ├── RevisionAgent.js        # Maps spaced-repetition timelines leading to exam
│   └── MotivationAgent.js      # Generates pep-talks, tips, and quick boosts
├── public/                     # Static frontend resources served by Express
│   ├── index.html              # HTML structure (sidebar inputs + result tab grids)
│   ├── style.css               # Modern glassmorphic style & dark theme dashboard styling
│   └── app.js                  # Frontend controller: API calls & interactive quiz manager
├── .env.example                # Template of environment variables
├── .env                        # Local environment file containing credentials (ignored by git)
├── .gitignore                  # Git ignore definitions
├── package.json                # Project dependencies and running scripts
├── server.js                   # Entry point: Express server & Agent orchestrator
└── README.md                   # Project documentation (this file)
```

---

## 🏛️ System Architecture

StudyMate AI uses a **parallel multi-agent orchestration architecture** on the Node.js backend. When a student enters their exam criteria, the backend splits the task among four specialized agents.

```
       ┌────────────────────────────────────────────────────────┐
       │                 Web Client (HTML/CSS/JS)               │
       └───────────────────────────┬────────────────────────────┘
                                   │ (POST /api/generate)
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             Express Orchestrator (server.js)           │
       └─────┬─────────────────────┬──────────────────────┬─────┘
             │                     │                      │
     (Promise.all Parallel Execution)                     │
             │                     │                      │
             ▼                     ▼                      ▼
  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │  Planner Agent   │  │    Quiz Agent    │  │  Revision Agent  │  │ Motivation Agent │
  │  (Planner.js)    │  │    (Quiz.js)     │  │  (Revision.js)   │  │  (Motivation.js) │
  └──────────┬───────┘  └──────────┬───────┘  └──────────┬───────┘  └──────────┬───────┘
             │                     │                      │                      │
             └─────────────────┐   │   ┌──────────────────┘                      │
                               ▼   ▼   ▼   ▼
                        ┌──────────────────────────┐
                        │   Google Gemini API      │
                        │   (gemini-2.5-flash)     │
                        └──────────────────────────┘
```

### The 4 Agents and their prompts:
1. **Planner Agent** (`agents/PlannerAgent.js`): Analyzes the date gap and daily hours budget. It outputs a structured, chronological daily study block showing timeslots, activity descriptions, and task types (e.g. Core Study, Active Recall, practice).
2. **Quiz Agent** (`agents/QuizAgent.js`): Curates 5 custom multiple-choice questions assessing deep comprehension rather than simple recall. It outputs options labeled A to D, correct answers, and instructional concept explanations.
3. **Revision Agent** (`agents/RevisionAgent.js`): Utilizes cognitive science (spaced repetition & active recall) to divide the preparation schedule into countdown milestones (e.g., 7 days before, 3 days before) and prescribes exam-day tips (night before, morning of).
4. **Motivation Agent** (`agents/MotivationAgent.js`): Generates a custom pep talk referencing the subject's challenges, specific tips (e.g., Feynman Technique, visualization), and can be queried independently via the sidebar for quick motivation boosts.

---

## 📡 API Endpoints

### 1. `POST /api/generate`
Orchestrates a full multi-agent generation cycle.
- **Request Body**:
  ```json
  {
    "subject": "Chemistry",
    "topic": "Organic Reactions",
    "examDate": "2026-07-15",
    "dailyHours": 4
  }
  ```
- **Response Structure**:
  ```json
  {
    "success": true,
    "data": {
      "planner": { ... },
      "quiz": { ... },
      "revision": { ... },
      "motivation": { ... }
    }
  }
  ```

### 2. `GET /api/motivation-boost`
Returns a single motivational mindset booster. Used by the "Quick Pep Boost" button.
- **Response Structure**:
  ```json
  {
    "success": true,
    "data": {
      "quote": "Success is not final, failure is not fatal...",
      "author": "Winston Churchill",
      "microTip": "Clear your workspace of all screens for the next 45 minutes."
    }
  }
  ```

---

## ☁️ Deployment Strategy

StudyMate AI is designed as a self-contained, unified Node.js package, making deployment easy:

### Deploy to Render or Heroku
1. Push the code repository to GitHub.
2. Link your repository to **[Render](https://render.com/)** (as a **Web Service**) or **[Heroku](https://www.heroku.com/)**.
3. Set the **Build Command** to:
   ```bash
   npm install
   ```
4. Set the **Start Command** to:
   ```bash
   npm start
   ```
5. Add your `GEMINI_API_KEY` to the **Environment Variables** in the service dashboard settings.

### Deploy to Vercel
Vercel supports Serverless Functions out-of-the-box.
1. Install Vercel CLI or import your GitHub project into the Vercel Dashboard.
2. Ensure you add `GEMINI_API_KEY` to Vercel's **Environment Variables** panel in the settings.
3. Deploy directly. Vercel automatically matches Express configurations when defined properly.
