# 🚀 QUICK START GUIDE FOR AI DEVELOPER

**Objective:** Build the BilanCompetence Simple Local App in order, without errors.

**Total Time:** 18-22 hours (or 2 full working days)

**Prerequisite:** Node.js 18+, npm 9+, code editor

---

## STEP 1: PROJECT INITIALIZATION (15 min)

```bash
# 1. Create root directory
mkdir bilan-app
cd bilan-app

# 2. Create monorepo structure
mkdir backend frontend data docs

# 3. Initialize root package.json
npm init -y

# 4. Install root dependencies
npm install --save-dev concurrently
```

**Create `package.json` at root:**
```json
{
  "name": "bilan-competence-app",
  "version": "1.0.0",
  "description": "Local competency assessment app with AI personalization",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd backend && node server.js",
    "client": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.1"
  }
}
```

---

## STEP 2: BACKEND SETUP (1 hour)

### 2.1 Backend Initialization
```bash
cd backend
npm init -y
npm install express sqlite3 dotenv pdfkit cors
npm install --save-dev nodemon
```

**Create `backend/package.json`:**
```json
{
  "name": "bilan-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "dotenv": "^16.3.1",
    "pdfkit": "^0.13.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 2.2 Create `.env`
```bash
cat > backend/.env << 'EOF'
GEMINI_API_KEY=your-api-key-here
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/bilan.db
EOF
```

### 2.3 Create `backend/server.js`
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/database.js';

// Routes (will create next)
import assessmentsRouter from './routes/assessments.js';
import questionsRouter from './routes/questions.js';
import responsesRouter from './routes/responses.js';
import reportsRouter from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/assessments', assessmentsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/responses', responsesRouter);
app.use('/api/reports', reportsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
```

---

## STEP 3: DATABASE SETUP (45 min)

### 3.1 Create `backend/config/database.js`
**This file should:**
- Import sqlite3
- Create/connect to `./data/bilan.db`
- Run all CREATE TABLE IF NOT EXISTS
- Seed interest_categories
- Create indexes
- Export db instance

**Reference:** See SECTION 7 in COMPREHENSIVE_SPEC for exact SQL

---

## STEP 4: BUILD API ROUTES (3-4 hours)

### 4.1 `backend/routes/assessments.js`
**Implement:**
- POST /assessments (create new)
- GET /assessments (list all with pagination)
- GET /assessments/:id (get one)
- PATCH /assessments/:id (update status)

**Key logic:**
- POST should call Gemini to personalize structure
- Return assessment + first phase questions

### 4.2 `backend/routes/questions.js`
**Implement:**
- GET /assessments/:id/questions/:phase
- Returns all questions for that phase

### 4.3 `backend/routes/responses.js`
**Implement:**
- POST /responses (save answer)
- GET /assessments/:id/responses (get all)

### 4.4 `backend/routes/reports.js`
**Implement:**
- GET /assessments/:id/synthesis (call Gemini)
- GET /assessments/:id/report/pdf (generate PDF)
- GET /assessments/:id/report/csv (export CSV)

---

## STEP 5: GEMINI INTEGRATION (2 hours)

### 5.1 Create `backend/ai/geminiIntegration.js`
```javascript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-1.5-flash';

export async function callGemini(prompt, jsonMode = true) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{
      parts: [{
        text: prompt + (jsonMode ? '\n\nRespond ONLY with valid JSON.' : '')
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
    console.error('Gemini call failed:', error);
    throw error;
  }
}
```

### 5.2 Create `backend/ai/prompts.js`
**Store all 3 prompt templates** as functions (see SECTION 5.2 in COMPREHENSIVE_SPEC)

---

## STEP 6: UTILITIES (1.5 hours)

### 6.1 `backend/utils/reportGenerator.js`
- Implement PDF generation using pdfkit
- Take assessmentData + synthesisData
- Output PDF file to `./reports/`

### 6.2 `backend/utils/csvExporter.js`
- Export responses as CSV
- Headers: Question | Answer | Category | Date

---

## STEP 7: TEST BACKEND (30 min)

```bash
# Terminal 1
cd backend
npm start

# Terminal 2: Test endpoints with curl
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/assessments \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","interest_category":"Software Development","allocated_hours":2}'
```

**Verify:**
- [ ] Server starts on port 5000
- [ ] Database created at `./data/bilan.db`
- [ ] POST /assessments returns 201 + assessment ID
- [ ] Gemini returns personalized structure

---

## STEP 8: FRONTEND SETUP (1-2 hours)

### 8.1 Initialize Vite + React
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-hook-form chart.js lucide-react html2pdf.js
```

### 8.2 Tailwind Configuration
**Update `frontend/tailwind.config.js`:**
```javascript
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2C3E50',
        secondary: '#1ABC9C',
        accent: '#E74C3C'
      }
    }
  },
  plugins: []
}
```

### 8.3 Create `frontend/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  @apply transition-all duration-200;
}

button {
  @apply rounded-lg font-medium py-2 px-4 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary text-white hover:bg-opacity-90;
}

.btn-secondary {
  @apply bg-secondary text-white hover:bg-opacity-90;
}

input, textarea, select {
  @apply border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary;
}
```

---

## STEP 9: FRONTEND COMPONENTS (4-5 hours)

### 9.1 Create API Client
**`frontend/src/api/client.js`:**
```javascript
const BASE_URL = 'http://localhost:5000/api';

export async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json' }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

### 9.2 Main App Component
**`frontend/src/App.jsx`:**
- Use React Router or simple state for page navigation
- Routes: `/` (form), `/results/:id` (results), `/dashboard` (admin)

### 9.3 Multi-Step Form
**`frontend/src/pages/AssessmentForm.jsx`:**
- Step 1: InitialInfo component
- Steps 2-6: QuestionStep component
- Step 7: ReviewStep component

### 9.4 Components to Build
- `components/InitialInfo.jsx` - Form for name, interest, hours
- `components/QuestionStep.jsx` - Display question + rating/choice/text
- `components/ReviewStep.jsx` - Confirm all answers
- `components/ProgressBar.jsx` - Visual progress
- `pages/ResultsPage.jsx` - Show synthesis + download PDF
- `pages/AdminDashboard.jsx` - Show all assessments + export

---

## STEP 10: INTEGRATION (2 hours)

### 10.1 Full Flow Test
```
1. Start backend: cd backend && npm start
2. Start frontend: cd frontend && npm run dev
3. Open http://localhost:5173
4. Fill form: Name, Interest, Hours
5. Submit → Should create assessment + show questions
6. Answer all questions → Redirect to results
7. Results page → Download PDF
8. Dashboard → See assessment history
```

### 10.2 Error Scenarios to Test
- Gemini API down → Fallback questions
- Network timeout → Retry logic
- Invalid JSON from Gemini → Parse error handling
- PDF generation fails → Show preview instead

---

## STEP 11: POLISH (1.5 hours)

- [ ] Remove all console.logs (except errors)
- [ ] Add loading spinners
- [ ] Add error messages (toast notifications)
- [ ] Make responsive (mobile, tablet, desktop)
- [ ] Test keyboard navigation
- [ ] Test on slow network (DevTools throttle)
- [ ] Clean up code: remove unused imports, dead code

---

## STEP 12: DOCUMENTATION (30 min)

### Create `README.md`
```markdown
# BilanCompetence - Simple Local Assessment App

## Quick Start

1. Get Gemini API Key from https://aistudio.google.com/
2. Clone this repo
3. Create `.env` with GEMINI_API_KEY
4. npm install && npm run dev
5. Open http://localhost:5173

## Architecture
- Backend: Node.js + Express + SQLite
- Frontend: React + Vite + TailwindCSS
- AI: Google Gemini API
- Database: SQLite (local file)

## Folder Structure
See COMPREHENSIVE_SPEC.md section 2.3

## API Endpoints
See COMPREHENSIVE_SPEC.md section 4 or docs/API_REFERENCE.md
```

---

## 🎯 FINAL VERIFICATION CHECKLIST

- [ ] `npm run dev` starts both backend & frontend
- [ ] Backend: http://localhost:5000/api/health returns 200
- [ ] Frontend: http://localhost:5173 loads without errors
- [ ] Can create new assessment (POST /api/assessments)
- [ ] Gemini personalizes structure (returns total_phases, total_questions)
- [ ] Can answer all questions (POST /api/responses)
- [ ] Can generate synthesis (GET /api/assessments/:id/synthesis)
- [ ] PDF downloads (GET /api/assessments/:id/report/pdf)
- [ ] Dashboard shows all assessments (GET /api/assessments)
- [ ] Everything works end-to-end with real data

---

## 📞 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Cannot find module" | `npm install` in that directory |
| Port 5000 in use | `lsof -i :5000 && kill -9 <PID>` |
| Gemini API 401 | Check GEMINI_API_KEY is correct |
| Database locked | Delete `./data/bilan.db`, restart |
| React error | Check React import, component capitalization |
| Tailwind not loading | Run `npm run build` in frontend |

---

## ⏱️ TIME BREAKDOWN

| Task | Time |
|------|------|
| Backend setup | 1 h |
| API routes | 3-4 h |
| Gemini integration | 2 h |
| Utilities (PDF/CSV) | 1.5 h |
| Backend testing | 0.5 h |
| Frontend setup | 1-2 h |
| Frontend components | 4-5 h |
| Integration & testing | 2 h |
| Polish | 1.5 h |
| Documentation | 0.5 h |
| **TOTAL** | **~18-22 h** |

---

**Ready? Start with STEP 1 above!** 🚀

If you get stuck, refer to the COMPREHENSIVE_SPEC_BilanCompetence_SimpleLocal.md for exact specifications.
