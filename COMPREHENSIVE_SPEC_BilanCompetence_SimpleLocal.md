# 🎯 COMPREHENSIVE SPECIFICATION
## BilanCompetence Simple Local App (Single Page + Report Dashboard)

**Version:** 1.0  
**Status:** Ready for AI Development  
**Build Time:** Single Sprint (AI: 4-8 hours)  
**Technology Stack:** React + Vite + TailwindCSS | Node.js + Express | SQLite | Gemini API

---

## 📋 SECTION 1: PROJECT VISION & SCOPE

### 1.1 What is this?
A **local, single-company web app** for conducting competency assessments (Bilan de Compétence) with employees.

**Key characteristics:**
- ✅ **Single Page Application** with multi-step form
- ✅ **AI-Powered** adaptive questioning (using Gemini)
- ✅ **No User Management** - everyone is anonymous/local
- ✅ **No External Dependencies** - no auth, no cloud, just runs locally
- ✅ **SQLite Database** - embedded, zero-config
- ✅ **Report Dashboard** - view all past assessments + export
- ✅ **Standalone** - `npm install && npm run dev` = ready

### 1.2 User Flow (High Level)
```
1. INITIAL SCREEN: 
   Employee enters:
   - First name, Last name
   - Select interest category (dropdown)
   - Select hours allocated for assessment (1-8 hours)
   → Employee submits

2. AI PERSONALIZES:
   Based on interest + hours, Gemini decides:
   - How many assessment "phases" (étapes)
   - How many questions per phase
   - Question difficulty/complexity

3. MULTI-STEP FORM:
   For each phase/question:
   - Question displayed
   - Employee selects answer (1-5 rating or multiple choice)
   - Explanation field (optional)
   → All saved to DB

4. FINAL REPORT:
   AI generates synthesis:
   - Strengths & weaknesses
   - Career recommendations (ROME codes if possible)
   - Development areas
   → PDF download

5. DASHBOARD:
   Admin (any company employee) can:
   - View all past assessments
   - See employee responses + AI synthesis
   - Export as CSV/PDF
   - Search by name, date, category

---

## 🏗️ SECTION 2: TECH STACK & SETUP

### 2.1 Frontend Stack
```
Framework:     React 18 + Vite
UI Library:    TailwindCSS 3
State:         React Context + useReducer (no Redux)
Form:          React Hook Form (lightweight)
PDF Export:    html2pdf
HTTP Client:   Fetch API (no axios)
Charts:        Chart.js (for reports visualization)
Icons:         Lucide React
```

### 2.2 Backend Stack
```
Runtime:       Node.js 18+
Framework:     Express.js
Database:      SQLite 3
ORM:           sqlite3 npm package (direct SQL, no Prisma)
PDF Generate:  pdfkit
AI:            Google Gemini API (via fetch)
Env:           dotenv
```

### 2.3 Project Structure
```
bilan-app/
├── backend/
│   ├── server.js                 # Express entry point
│   ├── config/
│   │   └── database.js          # SQLite setup & migrations
│   ├── routes/
│   │   ├── assessments.js       # POST/GET bilans
│   │   ├── questions.js         # POST/GET questions
│   │   ├── responses.js         # POST/GET responses
│   │   └── reports.js           # GET synthesis + PDF
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── ai/
│   │   └── geminiIntegration.js # Gemini calls
│   ├── utils/
│   │   ├── reportGenerator.js   # PDF + synthesis
│   │   └── logger.js
│   └── .env                      # GEMINI_API_KEY
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── AssessmentForm.jsx      # Main form (7-step wizard)
│   │   │   ├── AdminDashboard.jsx      # Report view & export
│   │   │   └── ResultsPage.jsx         # Final AI synthesis
│   │   ├── components/
│   │   │   ├── InitialInfo.jsx         # Step 1: Name + Interest + Hours
│   │   │   ├── QuestionStep.jsx        # Step 2+: Display question + answer
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ReportTable.jsx
│   │   │   └── PDFPreview.jsx
│   │   ├── api/
│   │   │   └── client.js              # Fetch wrapper
│   │   ├── hooks/
│   │   │   ├── useAssessment.js
│   │   │   └── useReports.js
│   │   ├── styles/
│   │   │   └── index.css               # Tailwind + custom
│   │   └── utils/
│   │       └── helpers.js
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── package.json (root - monorepo style)
├── .env.example
├── .gitignore
└── README.md
```

### 2.4 Environment Variables
```
# .env (never commit)
GEMINI_API_KEY=sk-xxx...
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/bilan.db
```

---

## 💾 SECTION 3: DATABASE SCHEMA (SQLite)

### 3.1 Tables Design

```sql
-- TABLE 1: Assessments (Bilans)
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  interest_category TEXT NOT NULL,
  allocated_hours INTEGER NOT NULL,
  
  -- AI Personalization (set after initial submission)
  total_phases INTEGER,
  total_questions INTEGER,
  estimated_completion_time INTEGER,
  
  -- Status
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, archived
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  
  -- Synthesis (generated after all questions answered)
  ai_synthesis TEXT, -- JSON string with findings
  synthesis_generated_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 2: Questions (templated questions Gemini will personalize)
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  phase_number INTEGER NOT NULL, -- 1, 2, 3, etc.
  question_number INTEGER NOT NULL, -- 1-N per phase
  
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'rating', -- rating (1-5), multiple_choice, open
  
  -- For multiple_choice type
  choices JSON, -- ["Option A", "Option B", "Option C"]
  
  -- Generated by Gemini (or template)
  category TEXT, -- Technical, Soft Skills, Management, etc.
  difficulty INTEGER DEFAULT 3, -- 1-5 scale
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);

-- TABLE 3: Responses (Employee answers)
CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  
  -- Answer
  answer_rating INTEGER, -- 1-5 if rating type
  answer_text TEXT, -- choice or open-ended response
  explanation TEXT, -- optional explanation
  
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (assessment_id) REFERENCES assessments(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- TABLE 4: Templates (Question templates for Gemini to personalize)
CREATE TABLE question_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL, -- Technical, Soft Skills, Management, etc.
  difficulty_level INTEGER, -- 1-5
  template_text TEXT NOT NULL, -- "{{competency}} proficiency level?"
  question_type TEXT DEFAULT 'rating',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 5: Interest Categories (Reference table)
CREATE TABLE interest_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL, -- "Software Development", "Data Analysis", etc.
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data
INSERT INTO interest_categories (name, description) VALUES
('Software Development', 'Programming, coding, software architecture'),
('Data Analysis', 'Data analysis, visualization, statistics'),
('Project Management', 'Planning, execution, team coordination'),
('Human Resources', 'Recruitment, training, employee relations'),
('Marketing', 'Digital marketing, content, strategy'),
('Sales', 'Sales techniques, client management, negotiation'),
('Business Analysis', 'Requirements, process improvement, documentation'),
('Leadership & Management', 'Team management, strategy, decision making');
```

### 3.2 Initialization SQL (auto-run on startup)
```javascript
// See section: Database Initialization Script
```

---

## 🔌 SECTION 4: API SPECIFICATION

**Base URL:** `http://localhost:5000/api`  
**All responses:** JSON  
**CORS:** Enabled for `http://localhost:5173`

### 4.1 Assessment Endpoints

#### POST /assessments
**Purpose:** Create new assessment, collect initial info  
**Request:**
```json
{
  "first_name": "Ayşe",
  "last_name": "Kaya",
  "interest_category": "Software Development",
  "allocated_hours": 4
}
```

**Response:** 201 Created
```json
{
  "id": 1,
  "first_name": "Ayşe",
  "last_name": "Kaya",
  "interest_category": "Software Development",
  "allocated_hours": 4,
  "total_phases": 3,           // AI calculated
  "total_questions": 15,        // AI calculated
  "estimated_completion_time": 240, // minutes
  "status": "in_progress",
  "start_time": "2025-11-08T10:00:00Z",
  "questions": [...]            // Array of first phase questions
}
```

#### GET /assessments/:id
**Purpose:** Get assessment details (for UI step navigation)  
**Response:** 200 OK
```json
{
  "id": 1,
  "first_name": "Ayşe",
  "last_name": "Kaya",
  "status": "in_progress",
  "progress": {
    "current_phase": 2,
    "current_question": 5,
    "total_questions": 15
  },
  "current_phase_questions": [...]
}
```

#### PATCH /assessments/:id
**Purpose:** Update assessment status  
**Request:**
```json
{
  "status": "completed"
}
```

**Response:** 200 OK
```json
{
  "id": 1,
  "status": "completed",
  "end_time": "2025-11-08T11:00:00Z",
  "ai_synthesis_generated_at": "2025-11-08T11:05:00Z"
}
```

#### GET /assessments
**Purpose:** Get all assessments (for admin dashboard)  
**Query Params:** `?limit=50&offset=0&category=Software Development&status=completed`  
**Response:** 200 OK
```json
{
  "total": 45,
  "assessments": [
    {
      "id": 1,
      "first_name": "Ayşe",
      "last_name": "Kaya",
      "interest_category": "Software Development",
      "allocated_hours": 4,
      "status": "completed",
      "start_time": "2025-11-08T10:00:00Z",
      "end_time": "2025-11-08T11:00:00Z",
      "ai_synthesis_generated_at": "2025-11-08T11:05:00Z"
    }
  ]
}
```

### 4.2 Question Endpoints

#### GET /assessments/:id/questions/:phase
**Purpose:** Get all questions for a phase  
**Response:** 200 OK
```json
{
  "phase_number": 1,
  "questions": [
    {
      "id": 1,
      "question_text": "Rate your JavaScript proficiency (1-5)",
      "question_type": "rating",
      "category": "Technical",
      "difficulty": 2
    },
    {
      "id": 2,
      "question_text": "Which areas interest you most?",
      "question_type": "multiple_choice",
      "choices": ["Frontend", "Backend", "Full-stack", "Other"],
      "category": "Soft Skills",
      "difficulty": 1
    }
  ]
}
```

### 4.3 Response Endpoints

#### POST /responses
**Purpose:** Submit an answer to a question  
**Request:**
```json
{
  "assessment_id": 1,
  "question_id": 1,
  "answer_rating": 4,
  "explanation": "I have 5 years of JavaScript experience"
}
```

**Response:** 201 Created
```json
{
  "id": 101,
  "assessment_id": 1,
  "question_id": 1,
  "answer_rating": 4,
  "answered_at": "2025-11-08T10:05:00Z"
}
```

#### GET /assessments/:id/responses
**Purpose:** Get all responses for an assessment (for report generation)  
**Response:** 200 OK
```json
{
  "assessment_id": 1,
  "responses": [
    {
      "question_id": 1,
      "question_text": "Rate your JavaScript proficiency",
      "answer_rating": 4,
      "category": "Technical"
    },
    {
      "question_id": 2,
      "question_text": "Which areas interest you most?",
      "answer_text": "Frontend",
      "category": "Soft Skills"
    }
  ]
}
```

### 4.4 Report & Synthesis Endpoints

#### GET /assessments/:id/synthesis
**Purpose:** Get AI-generated synthesis report  
**Response:** 200 OK
```json
{
  "assessment_id": 1,
  "employee_name": "Ayşe Kaya",
  "interest_category": "Software Development",
  "allocated_hours": 4,
  "synthesis": {
    "key_strengths": [
      "Strong JavaScript expertise (rating avg 4.2)",
      "Good problem-solving skills",
      "Quick learner in new frameworks"
    ],
    "development_areas": [
      "Database design (rating avg 2.1)",
      "DevOps/Infrastructure knowledge",
      "Team leadership experience"
    ],
    "career_recommendations": [
      {
        "rome_code": "M1805",
        "job_title": "Full-stack Developer / Tech Lead",
        "rationale": "Your technical skills and interest in full-stack align well with this path"
      }
    ],
    "next_steps": [
      "Take a database design course (e.g., SQL optimization)",
      "Lead a small project team to develop management skills",
      "Explore DevOps tools (Docker, Kubernetes basics)"
    ],
    "generated_at": "2025-11-08T11:05:00Z"
  }
}
```

#### GET /assessments/:id/report/pdf
**Purpose:** Download report as PDF  
**Response:** 200 OK + PDF file (binary)

#### GET /assessments/:id/report/csv
**Purpose:** Export responses as CSV (for data analysis)  
**Response:** 200 OK + CSV file

---

## 🤖 SECTION 5: GEMINI AI INTEGRATION

### 5.1 Gemini Workflow

**Step 1: Personalize Assessment Structure**
```
INPUT to Gemini:
- Interest category: "Software Development"
- Allocated hours: 4
- (Optional: any pre-existing profile data)

PROMPT:
"Design a personalized competency assessment for a {{interest_category}} professional 
who has {{allocated_hours}} hours to complete it. 

Respond in JSON format:
{
  'total_phases': <number 2-5>,
  'questions_per_phase': <number 3-8>,
  'phase_topics': ['Topic 1', 'Topic 2', ...],
  'difficulty_progression': 'low to high'
}

Rationale: More time = more phases and questions. More complex interest = harder questions."

OUTPUT:
{
  "total_phases": 3,
  "questions_per_phase": 5,
  "phase_topics": ["Core Technical Skills", "Architecture & Design", "Team & Leadership"],
  "difficulty_progression": "low to high"
}

BACKEND ACTION:
- Save to assessment.total_phases = 3
- Save to assessment.total_questions = 15
```

**Step 2: Generate Phase Questions**
```
INPUT to Gemini (per phase):
- Assessment ID
- Phase number
- Interest category
- Allocated hours
- Phase topic
- Difficulty level (1-5)

PROMPT:
"Generate 5 personalized competency assessment questions for a {{interest_category}} 
professional in the topic '{{phase_topic}}'.

Difficulty: {{difficulty}} / 5
Question types: Mix of rating (1-5), multiple choice, and open-ended.

Respond in JSON:
{
  'questions': [
    {
      'question_text': '...',
      'question_type': 'rating' | 'multiple_choice' | 'open',
      'choices': [...] (if multiple_choice),
      'expected_response_type': 'technical depth' | 'experience level' | 'preference'
    }
  ]
}

CONSTRAINTS:
- Questions must be specific, not generic
- Rate questions use 1-5 scale (1=Beginner, 5=Expert)
- Multiple choice should have 3-4 options
- Open-ended should ask for specific examples"

OUTPUT:
{
  "questions": [
    {
      "question_text": "Rate your proficiency with React and modern frontend frameworks",
      "question_type": "rating",
      "expected_response_type": "technical depth"
    },
    {
      "question_text": "Have you worked with state management libraries?",
      "question_type": "multiple_choice",
      "choices": ["Redux", "Zustand", "Context API", "Not yet"]
    }
  ]
}

BACKEND ACTION:
- For each question, INSERT into questions table
- Link to assessment_id + phase_number
```

**Step 3: Generate Final Synthesis**
```
INPUT to Gemini:
- Assessment full data (employee name, interest, hours, responses)
- Question details + employee answers
- Employee explanations

PROMPT:
"Analyze this competency assessment for {{employee_name}}.

Assessment Details:
- Interest: {{interest_category}}
- Time spent: {{allocated_hours}} hours
- Questions answered: {{total_questions}}

Responses summary:
{{responses_json}}

Generate a comprehensive synthesis report in JSON:
{
  'key_strengths': ['...', '...'],
  'development_areas': ['...', '...'],
  'career_recommendations': [
    {
      'rome_code': 'M1805',
      'job_title': 'Full-stack Developer',
      'rationale': '...'
    }
  ],
  'specific_next_steps': ['...', '...'],
  'overall_profile': '...',
  'confidence_level': 'high' | 'medium' | 'low'
}

Use ROME (Répertoire Opérationnel des Métiers et d'Emploi) codes where applicable.
Be specific and actionable."

OUTPUT:
JSON synthesis (stored in assessment.ai_synthesis)

BACKEND ACTION:
- Save synthesis JSON
- Generate PDF from synthesis
- Mark assessment as completed
```

### 5.2 Prompt Templates (Stored in Backend)

**File:** `backend/ai/prompts.js`
```javascript
const prompts = {
  // Prompt 1: Personalize structure
  PERSONALIZE_STRUCTURE: (interestCategory, allocatedHours) => `
    Design a personalized competency assessment for a ${interestCategory} professional 
    who has ${allocatedHours} hours to complete it...
    [full prompt above]
  `,

  // Prompt 2: Generate phase questions
  GENERATE_QUESTIONS: (interestCategory, phaseTopic, difficulty, phaseNumber) => `
    Generate ${5} personalized competency assessment questions for a ${interestCategory} 
    professional in the topic '${phaseTopic}'...
    [full prompt above]
  `,

  // Prompt 3: Final synthesis
  GENERATE_SYNTHESIS: (employeeName, interestCategory, responsesJson) => `
    Analyze this competency assessment for ${employeeName}...
    [full prompt above]
  `
};

module.exports = prompts;
```

### 5.3 Gemini API Call Function

**File:** `backend/ai/geminiIntegration.js`
```javascript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash'; // fast + cheap
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(prompt, jsonMode = true) {
  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{
      parts: [{
        text: prompt + (jsonMode ? '\n\nRespond ONLY with valid JSON, no markdown.' : '')
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      responseMimeType: jsonMode ? 'application/json' : 'text/plain'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text;

    if (jsonMode) {
      return JSON.parse(content);
    }
    return content;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

module.exports = { callGemini };
```

---

## 🎨 SECTION 6: FRONTEND PAGES & COMPONENTS

### 6.1 Page 1: Assessment Form (Main Page)

**File:** `frontend/src/pages/AssessmentForm.jsx`

**Structure:** 7-step wizard
```
Step 1: Initial Info (Name, Interest, Hours)
   ↓
Step 2-6: Questions (per phase, 1-5 questions per phase)
   ↓
Step 7: Review + Submit + Completion
```

**Component Breakdown:**

#### Component: InitialInfo (Step 1)
```jsx
// Shows:
// - First Name (text input)
// - Last Name (text input)
// - Interest Category (dropdown - fetched from /api/interest-categories)
// - Allocated Hours (radio or select: 1, 2, 3, 4, 5, 6, 7, 8)
// - Start Button

// On Submit:
// - POST /api/assessments
// - Get back assessment.id + all personalization data
// - Move to Step 2
```

**UI:** TailwindCSS styling
- Clean, minimal, professional
- Colors: Primary blue (#2C3E50), accent teal (#1ABC9C)
- Form inputs: Large, accessible, clear labels

#### Component: QuestionStep (Steps 2-6)
```jsx
// Shows:
// - Current question text
// - Question type rendering:
//    - Rating: 1-5 radio buttons or slider
//    - Multiple choice: Button group or radio
//    - Open-ended: Text area
// - Optional explanation field
// - Progress bar (e.g., "Question 5 of 15")
// - Previous / Next / Submit button (conditional)

// On Answer Submit:
// - POST /api/responses
// - Move to next question
// - If phase complete, move to next phase
// - If all complete, move to Step 7
```

#### Component: ReviewStep (Step 7)
```jsx
// Shows:
// - Summary of all responses
// - Option to edit any previous answer
// - "Complete Assessment" button
// - Loading spinner while Gemini generates synthesis

// On Complete:
// - PATCH /api/assessments/:id { status: 'completed' }
// - Backend calls Gemini for synthesis
// - Redirect to ResultsPage
```

### 6.2 Page 2: Results Page (Final Synthesis)

**File:** `frontend/src/pages/ResultsPage.jsx`

**Shows:**
```
┌─────────────────────────────────────────┐
│  ASSESSMENT COMPLETE ✓                  │
│                                          │
│  Ayşe Kaya                              │
│  Software Development Assessment        │
│                                          │
├─────────────────────────────────────────┤
│  KEY STRENGTHS                          │
│  • Strong JavaScript expertise          │
│  • Good problem-solving skills          │
│  • Quick learner                        │
├─────────────────────────────────────────┤
│  DEVELOPMENT AREAS                      │
│  • Database design                      │
│  • DevOps/Infrastructure                │
│  • Team leadership                      │
├─────────────────────────────────────────┤
│  CAREER RECOMMENDATIONS                 │
│  → Full-stack Developer / Tech Lead     │
│  → Senior Software Engineer             │
├─────────────────────────────────────────┤
│  NEXT STEPS                             │
│  1. Take database design course         │
│  2. Lead a project team                 │
│  3. Learn Docker/Kubernetes             │
├─────────────────────────────────────────┤
│  [Download PDF] [New Assessment]        │
│  [Back to Dashboard]                    │
└─────────────────────────────────────────┘
```

**Functionality:**
- GET /assessments/:id/synthesis
- Display formatted synthesis
- Button: "Download PDF Report"
- Button: "Start New Assessment"
- Button: "View Admin Dashboard"

### 6.3 Page 3: Admin Dashboard

**File:** `frontend/src/pages/AdminDashboard.jsx`

**Shows:**
```
┌──────────────────────────────────────────────────┐
│  ASSESSMENT HISTORY & REPORTS                    │
│                                                   │
│  [Search by name] [Filter by category] [Date]   │
│                                                   │
│  ┌─ Recent Assessments ──────────────────────┐  │
│  │ Name      | Category    | Date     | View  │  │
│  │ Ayşe K.   | Software    | Nov 8    | ✓ PDF │  │
│  │ Mehmet D. | Data        | Nov 7    | ✓ PDF │  │
│  │ Fatma H.  | HR          | Nov 5    | ✓ PDF │  │
│  └───────────────────────────────────────────┘  │
│                                                   │
│  [Export All CSV] [Export All PDF]              │
└──────────────────────────────────────────────────┘
```

**Features:**
- GET /assessments (with pagination + filters)
- Table with: Name, Category, Date, Status, Actions
- Click row → View detailed results
- Download buttons per assessment
- Export all as CSV

---

## 📊 SECTION 7: DATABASE INITIALIZATION & MIGRATIONS

**File:** `backend/config/database.js`

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || './data/bilan.db';

// Ensure data directory exists
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Database connection failed:', err);
  else console.log('Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize schema on startup
function initializeDatabase() {
  db.serialize(() => {
    // Create all tables (see schema above)
    db.run(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        interest_category TEXT NOT NULL,
        allocated_hours INTEGER NOT NULL,
        total_phases INTEGER,
        total_questions INTEGER,
        estimated_completion_time INTEGER,
        status TEXT DEFAULT 'in_progress',
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        ai_synthesis TEXT,
        synthesis_generated_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id INTEGER NOT NULL,
        phase_number INTEGER NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'rating',
        choices JSON,
        category TEXT,
        difficulty INTEGER DEFAULT 3,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answer_rating INTEGER,
        answer_text TEXT,
        explanation TEXT,
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id),
        FOREIGN KEY (question_id) REFERENCES questions(id)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS question_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        difficulty_level INTEGER,
        template_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'rating',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS interest_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed interest categories
    db.run(`
      INSERT OR IGNORE INTO interest_categories (name, description) VALUES
      ('Software Development', 'Programming, coding, software architecture'),
      ('Data Analysis', 'Data analysis, visualization, statistics'),
      ('Project Management', 'Planning, execution, team coordination'),
      ('Human Resources', 'Recruitment, training, employee relations'),
      ('Marketing', 'Digital marketing, content, strategy'),
      ('Sales', 'Sales techniques, client management, negotiation'),
      ('Business Analysis', 'Requirements, process improvement, documentation'),
      ('Leadership & Management', 'Team management, strategy, decision making');
    `);

    // Create indexes for performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_assessments_category ON assessments(interest_category);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_questions_assessment ON questions(assessment_id);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_responses_assessment ON responses(assessment_id);`);

    console.log('Database schema initialized');
  });
}

initializeDatabase();

module.exports = db;
```

---

## 🚀 SECTION 8: SETUP & DEPLOYMENT INSTRUCTIONS

### 8.1 Quick Start (5 minutes)

```bash
# 1. Clone / Extract project
cd bilan-app

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
GEMINI_API_KEY=your-api-key-here
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/bilan.db
EOF

# 4. Start development server (both frontend & backend)
npm run dev

# Backend runs on: http://localhost:5000
# Frontend runs on: http://localhost:5173
```

### 8.2 package.json Configuration

```json
{
  "name": "bilan-competence-app",
  "version": "1.0.0",
  "description": "Local competency assessment app with AI personalization",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd backend && node server.js",
    "client": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "npm run dev",
    "test": "echo 'No tests configured yet'",
    "db:reset": "rm -f ./data/bilan.db && node backend/config/database.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "dotenv": "^16.3.1",
    "pdfkit": "^0.13.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "concurrently": "^8.2.1"
  }
}
```

### 8.3 Frontend Setup (Vite + React)

**frontend/package.json:**
```json
{
  "name": "bilan-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.0",
    "chart.js": "^4.4.0",
    "lucide-react": "^0.263.1",
    "html2pdf.js": "^0.10.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

### 8.4 Environment Example

**`.env.example`:**
```
# Gemini API (get from Google AI Studio)
GEMINI_API_KEY=sk-...your-key-here...

# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_PATH=./data/bilan.db
```

---

## 📄 SECTION 9: PDF REPORT TEMPLATE

**File:** `backend/utils/reportGenerator.js`

```javascript
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generatePDFReport(assessmentData, synthesisData) {
  const doc = new PDFDocument({
    bufferPages: true,
    margin: 50
  });

  const filename = `Bilan_${assessmentData.last_name}_${Date.now()}.pdf`;
  const filepath = path.join('./reports', filename);

  // Ensure reports directory exists
  if (!fs.existsSync('./reports')) {
    fs.mkdirSync('./reports', { recursive: true });
  }

  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text('BILAN DE COMPÉTENCES', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text('Rapport d\'Évaluation Personnalisé', { align: 'center' });
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Employee Info
  doc.fontSize(11).font('Helvetica-Bold').text(`Employé: ${assessmentData.first_name} ${assessmentData.last_name}`);
  doc.fontSize(10).font('Helvetica').text(`Catégorie d'Intérêt: ${assessmentData.interest_category}`);
  doc.text(`Date d'Évaluation: ${new Date(assessmentData.start_time).toLocaleDateString('fr-FR')}`);
  doc.text(`Durée: ${assessmentData.allocated_hours} heures`);
  doc.moveDown();

  // Key Strengths
  doc.fontSize(12).font('Helvetica-Bold').text('Forces Clés');
  synthesisData.key_strengths.forEach(strength => {
    doc.fontSize(10).font('Helvetica').text(`• ${strength}`);
  });
  doc.moveDown();

  // Development Areas
  doc.fontSize(12).font('Helvetica-Bold').text('Domaines à Développer');
  synthesisData.development_areas.forEach(area => {
    doc.fontSize(10).font('Helvetica').text(`• ${area}`);
  });
  doc.moveDown();

  // Career Recommendations
  doc.fontSize(12).font('Helvetica-Bold').text('Recommandations Professionnelles');
  synthesisData.career_recommendations.forEach(rec => {
    doc.fontSize(10).font('Helvetica-Bold').text(`${rec.job_title} (${rec.rome_code})`);
    doc.fontSize(9).font('Helvetica').text(rec.rationale);
    doc.moveDown(0.3);
  });
  doc.moveDown();

  // Next Steps
  doc.fontSize(12).font('Helvetica-Bold').text('Prochaines Étapes');
  synthesisData.next_steps.forEach((step, idx) => {
    doc.fontSize(10).font('Helvetica').text(`${idx + 1}. ${step}`);
  });

  // Footer
  doc.moveDown(2);
  doc.fontSize(8).font('Helvetica').text('---', { align: 'center' });
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 
    { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filepath));
    stream.on('error', reject);
  });
}

module.exports = { generatePDFReport };
```

---

## 🔧 SECTION 10: COMPLETE FILE STRUCTURE & IMPLEMENTATION CHECKLIST

```
bilan-app/
│
├── backend/
│   ├── server.js                           # Express entry point
│   ├── package.json
│   ├── .env                               # Local only, never commit
│   ├── .gitignore
│   │
│   ├── config/
│   │   └── database.js                    # SQLite + schema + init
│   │
│   ├── routes/
│   │   ├── assessments.js                 # POST, GET, PATCH
│   │   ├── questions.js                   # GET /assessments/:id/questions/:phase
│   │   ├── responses.js                   # POST, GET
│   │   └── reports.js                     # GET synthesis, PDF, CSV
│   │
│   ├── middleware/
│   │   └── errorHandler.js
│   │
│   ├── ai/
│   │   ├── geminiIntegration.js          # callGemini function
│   │   └── prompts.js                    # Prompt templates
│   │
│   ├── utils/
│   │   ├── reportGenerator.js            # PDF generation
│   │   ├── csvExporter.js                # CSV export
│   │   └── logger.js                     # Simple logging
│   │
│   └── data/
│       └── bilan.db                       # SQLite (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                       # Main app router
│   │   ├── index.css                     # Tailwind imports
│   │   │
│   │   ├── pages/
│   │   │   ├── AssessmentForm.jsx        # Main form (steps 1-7)
│   │   │   ├── ResultsPage.jsx           # Synthesis results
│   │   │   └── AdminDashboard.jsx        # Reports & history
│   │   │
│   │   ├── components/
│   │   │   ├── InitialInfo.jsx           # Step 1
│   │   │   ├── QuestionStep.jsx          # Steps 2-6
│   │   │   ├── ReviewStep.jsx            # Step 7
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ReportTable.jsx
│   │   │   ├── PDFPreview.jsx
│   │   │   └── Navigation.jsx            # Top nav
│   │   │
│   │   ├── api/
│   │   │   └── client.js                 # Fetch wrapper + base URL
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAssessment.js          # Assessment state
│   │   │   └── useReports.js             # Reports state
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css                 # Global styles
│   │   │   └── components.css            # Component styles
│   │   │
│   │   └── utils/
│   │       ├── helpers.js                # formatDate, etc.
│   │       └── constants.js              # Colors, strings
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── package.json (root)
├── .env.example
├── .gitignore
├── README.md
└── docs/
    └── API_REFERENCE.md
```

---

## ✅ SECTION 11: IMPLEMENTATION CHECKLIST FOR AI

**This is what the AI developer needs to build, in order:**

### PHASE 1: Backend Setup (2-3 hours)
- [ ] `npm init` + install dependencies
- [ ] `backend/config/database.js` - SQLite initialization + schema
- [ ] `backend/server.js` - Express setup, CORS, error handler
- [ ] `backend/.env` - environment variables
- [ ] Test: `npm run server` → "Server running on 5000"

### PHASE 2: Backend API Endpoints (3-4 hours)
- [ ] `backend/routes/assessments.js` - POST, GET, PATCH
- [ ] `backend/routes/questions.js` - GET questions by phase
- [ ] `backend/routes/responses.js` - POST, GET responses
- [ ] `backend/routes/reports.js` - GET synthesis, PDF, CSV
- [ ] Test with Postman: All endpoints return correct data

### PHASE 3: Gemini Integration (2 hours)
- [ ] `backend/ai/geminiIntegration.js` - callGemini function
- [ ] `backend/ai/prompts.js` - All 3 prompt templates
- [ ] Update `/api/assessments` POST to call Gemini for personalization
- [ ] Update `/api/assessments/:id/report/synthesis` to call Gemini
- [ ] Test: Gemini responds, JSON parsing works

### PHASE 4: PDF & Export (1.5 hours)
- [ ] `backend/utils/reportGenerator.js` - PDF generation
- [ ] `backend/utils/csvExporter.js` - CSV export
- [ ] Test: PDF downloads, CSV is correct format

### PHASE 5: Frontend Setup (1-2 hours)
- [ ] `frontend/` - Vite + React + Tailwind setup
- [ ] `frontend/src/main.jsx` + `App.jsx` routing
- [ ] `frontend/src/api/client.js` - Fetch wrapper
- [ ] Test: `npm run client` → "Local: http://localhost:5173"

### PHASE 6: Frontend Pages & Components (4-5 hours)
- [ ] `components/InitialInfo.jsx` - Step 1 form
- [ ] `components/QuestionStep.jsx` - Question rendering
- [ ] `components/ReviewStep.jsx` - Step 7 review
- [ ] `pages/AssessmentForm.jsx` - Multi-step coordinator
- [ ] `pages/ResultsPage.jsx` - Synthesis display
- [ ] `pages/AdminDashboard.jsx` - Reports & history
- [ ] Test: All pages render, form submit → responses save

### PHASE 7: Styling & UX (1.5 hours)
- [ ] TailwindCSS global config
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility: ARIA labels, keyboard navigation
- [ ] Test: Looks good on all devices

### PHASE 8: Integration & Testing (2 hours)
- [ ] End-to-end flow: InitialInfo → Questions → Results → Dashboard
- [ ] PDF download works
- [ ] CSV export works
- [ ] Error handling (network, Gemini API down, etc.)
- [ ] Test: Full workflow multiple times

### PHASE 9: Polish & Deployment (1 hour)
- [ ] README.md - Setup instructions
- [ ] `.env.example` - Template
- [ ] Clean up console.logs, debug code
- [ ] Test on fresh install: `npm install && npm run dev`

**TOTAL: ~18-22 hours for AI (or 2 working days for human)**

---

## 🎓 SECTION 12: CRITICAL IMPLEMENTATION NOTES FOR AI

### 12.1 State Management (Frontend)
```javascript
// Use React Context + useReducer, NOT Redux
// Keep it simple:

const AssessmentContext = createContext();

const initialState = {
  currentStep: 1, // 1-7
  currentPhase: 1,
  currentQuestion: 1,
  assessmentId: null,
  employeeData: {},
  responses: [],
  currentPhaseQuestions: [],
  synthesis: null,
  loading: false,
  error: null
};

// Actions: START_ASSESSMENT, ANSWER_QUESTION, NEXT_STEP, etc.
```

### 12.2 Error Handling Strategy
```javascript
// All API calls should have try-catch + user feedback
// Example:
try {
  const response = await fetch('/api/assessments', { method: 'POST', body: ... });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Failed to create assessment:', error);
  setError('Unable to start assessment. Please try again.');
}
```

### 12.3 Gemini API Best Practices
```javascript
// - Rate limit: max 2 requests/second (Gemini free tier)
// - Use cheaper model: gemini-1.5-flash
// - Cache common prompts where possible
// - Timeout: 30 seconds per request
// - Retry logic for transient failures (max 2 retries)
```

### 12.4 Database Performance
```javascript
// - Use indexes on: assessments(status), assessments(interest_category)
// - Pagination on reports: LIMIT 50 OFFSET 0
// - Use foreign keys + CASCADE delete
// - Backup strategy: Copy bilan.db daily to ./backups/
```

### 12.5 Security Notes
```javascript
// - Never log API keys or sensitive data
// - Validate all inputs (sanitize HTML)
// - Use CORS whitelist (only localhost:5173)
// - PDF reports should not expose raw DB data (use views)
// - No authentication needed (local company use)
```

---

## 📞 SECTION 13: QUICK REFERENCE - API ENDPOINTS SUMMARY

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/assessments` | Create new assessment (personalize structure) |
| GET | `/api/assessments/:id` | Get assessment details + current phase questions |
| GET | `/api/assessments` | Get all assessments (admin dashboard) |
| PATCH | `/api/assessments/:id` | Update assessment status (mark completed) |
| GET | `/api/assessments/:id/questions/:phase` | Get questions for a phase |
| POST | `/api/responses` | Submit an answer |
| GET | `/api/assessments/:id/responses` | Get all responses for assessment |
| GET | `/api/assessments/:id/synthesis` | Get AI-generated synthesis |
| GET | `/api/assessments/:id/report/pdf` | Download report as PDF |
| GET | `/api/assessments/:id/report/csv` | Export responses as CSV |
| GET | `/api/interest-categories` | Get list of interest categories |

---

## 🎯 FINAL NOTES FOR AI DEVELOPER

1. **No Frontend-Backend Communication Secrets**: All endpoints documented above. Frontend calls → Backend responds with JSON. Simple.

2. **Database is Source of Truth**: All UI state derives from DB. If unsure, query DB.

3. **Gemini Prompts are Critical**: These determine question quality. Use exact prompts from Section 5. If Gemini responds with non-JSON, retry.

4. **Error Recovery**: When Gemini fails → fallback to generic questions. When DB fails → show error screen. When PDF fails → show preview instead.

5. **Test Data**: After setup, manually create 3-4 assessments to verify full flow.

6. **Performance**: Target <2s page loads, <1s question navigation, <5s PDF generation.

7. **Accessibility**: All forms need labels, all buttons need aria-labels, all colors need 4.5:1 contrast.

---

**STATUS: READY FOR AI DEVELOPMENT** ✅

Give this entire document to your AI developer with instructions:
> "Build this app exactly as specified. No ambiguity. No shortcuts. Provide working, tested, production-ready code."

---

**Document prepared by:** Specification System  
**Date:** November 8, 2025  
**For:** Mikail - BilanCompetence Simple Local App
