# BilanCompetence - Competency Assessment App

A modern web application for conducting comprehensive employee competency assessments with AI-powered personalization.

## Features

- **Multi-step Assessment Form**: 7-step evaluation process with AI-personalized questions
- **AI Integration**: Google Gemini API for adaptive question generation and synthesis
- **Personalized Reports**: AI-generated synthesis with:
  - Key strengths analysis
  - Development areas identification
  - Career recommendations with ROME codes
  - Next steps for professional development
- **Report Exports**: PDF and CSV export capabilities
- **Admin Dashboard**: View and manage all assessments
- **Production Ready**: Configured for Vercel + Railway deployment

## Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS 3 for styling
- React Hook Form for form management
- Chart.js for visualizations
- Lucide React for icons

### Backend
- Node.js 18+
- Express.js
- PostgreSQL (with SQLite fallback)
- Google Gemini API
- pdfkit for PDF generation

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm 9+
- Google Gemini API Key (optional, uses fallback mode without it)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd bilan-competence
```

2. Install dependencies
```bash
# Root level (concurrently for running both servers)
npm install

# Frontend dependencies
cd frontend && npm install && cd ..

# Backend dependencies
cd backend && npm install && cd ..
```

3. Create `.env` file in `backend/` directory
```bash
cat > backend/.env << EOF
GEMINI_API_KEY=your-gemini-api-key-here
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/bilan.db
EOF
```

4. Start development servers (both frontend & backend)
```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Getting Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste into `backend/.env`

---

## 🚀 PRODUCTION DEPLOYMENT (Vercel + Railway)

### ⏱️ Total Deployment Time: ~13 minutes

This guide walks you through deploying to production with:
- **Frontend**: Vercel (free tier available)
- **Backend**: Railway.app (free $5 credit)
- **Database**: PostgreSQL (Railway hosted)

---

### STEP 1: Prepare for GitHub (2 minutes)

#### 1.1 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create new repository: `bilan-competence`
3. Choose: Public or Private
4. Click "Create repository"

#### 1.2 Push Code to GitHub
```bash
# From root directory of project
git remote add github https://github.com/YOUR-USERNAME/bilan-competence.git

# Rename branch to main (if needed)
git branch -M main

# Push all commits to GitHub
git push -u github main
```

✅ Your code is now on GitHub!

---

### STEP 2: Deploy Frontend to Vercel (3 minutes)

#### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up (free tier)
3. Authorize GitHub integration

#### 2.2 Import Project
1. Click "New Project"
2. Click "Import Git Repository"
3. Select your `bilan-competence` repository

#### 2.3 Configure Project
**Framework Preset**: Vite
**Root Directory**: `./frontend`
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

#### 2.4 Add Environment Variables
Click "Environment Variables" and add:
```
VITE_API_URL = https://your-app-backend.railway.app/api
```

**Note**: Leave this as-is for now, update after backend deployment

#### 2.5 Deploy
Click "Deploy" button

**⏳ Wait**: Vercel builds and deploys (usually 2-3 minutes)

✅ **Frontend URL**: `https://bilan-competence.vercel.app` (or your custom domain)

---

### STEP 3: Deploy Backend to Railway (5 minutes)

#### 3.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up (free $5 monthly credit)
3. Create new workspace

#### 3.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `bilan-competence` repository
4. Authorize railway-app to access GitHub

#### 3.3 Configure Backend Service
1. Click "Add Service" → "GitHub repo"
2. Select: `bilan-competence`
3. **Root Directory**: `./backend`
4. **Branch**: `main`
5. Railway auto-detects Node.js

#### 3.4 Add PostgreSQL Database
1. Click "Add Service" → "Database" → "PostgreSQL"
2. Railway auto-creates PostgreSQL instance
3. Copy connection URL (shown in variables)

#### 3.5 Add Environment Variables
Click on Backend service and add these variables:
```
GEMINI_API_KEY = your-gemini-api-key-here
NODE_ENV = production
FRONTEND_URL = https://bilan-competence.vercel.app
DATABASE_URL = postgresql://user:pass@host:port/dbname
PORT = 3000
```

**Note**: Railway auto-provides `DATABASE_URL` - copy from service variables

#### 3.6 Deploy
Railway auto-deploys on GitHub push. Or:
1. Click "Deploy" button in service
2. **⏳ Wait**: 2-3 minutes for build and deployment

✅ **Backend URL**: `https://your-app-backend.railway.app` (shown in Railway dashboard)

---

### STEP 4: Connect Frontend to Backend (1 minute)

#### 4.1 Update Vercel Environment
1. Go to Vercel project → Settings → Environment Variables
2. Update: `VITE_API_URL = https://your-app-backend.railway.app/api`
3. Click "Save"

#### 4.2 Redeploy Frontend
1. Go to Vercel project → Deployments
2. Click "Redeploy" on latest deployment
3. **⏳ Wait**: 1-2 minutes for rebuild

✅ **Frontend now connected to Backend!**

---

### STEP 5: Verify Deployment (2 minutes)

#### 5.1 Test Frontend
1. Open: https://bilan-competence.vercel.app
2. You should see BilanCompetence homepage
3. Click "Start Assessment"

#### 5.2 Test Backend Health
1. Open: https://your-app-backend.railway.app/api/health
2. Should return: `{"status":"ok","timestamp":"..."}`

#### 5.3 Test Full Flow
1. Fill in assessment form (name, category, hours)
2. Submit form
3. Should create assessment and fetch questions
4. Answer a few questions
5. Download PDF

✅ **All systems operational!**

---

## 📋 Environment Variables Reference

### Frontend (.env)
```
VITE_API_URL=https://your-backend.railway.app/api
```

### Backend (.env)
```
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=production
FRONTEND_URL=https://bilan-competence.vercel.app
DATABASE_URL=postgresql://user:pass@host:port/dbname
PORT=3000
```

---

## Project Structure

```
bilan-competence/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Full pages
│   │   ├── api/                # API client
│   │   ├── App.jsx             # Main app
│   │   └── index.css           # TailwindCSS styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/                     # Node.js + Express
│   ├── config/
│   │   └── database.js         # Database setup
│   ├── routes/                 # API endpoints
│   │   ├── assessments.js
│   │   ├── questions.js
│   │   ├── responses.js
│   │   └── reports.js
│   ├── ai/                     # Gemini AI integration
│   │   ├── geminiIntegration.js
│   │   └── prompts.js
│   ├── utils/                  # Utilities
│   │   ├── reportGenerator.js
│   │   └── csvExporter.js
│   ├── server.js               # Express entry point
│   ├── package.json
│   └── .env.example
│
├── README.md                    # This file
├── DEPLOYMENT_GUIDE.md          # Detailed deployment info
├── QUICK_START_GUIDE_FOR_AI.md  # AI developer guide
├── COMPREHENSIVE_SPEC_*.md      # Full technical spec
├── vercel.json                  # Vercel config
├── package.json                 # Root package.json
└── .env.example                 # Environment template
```

---

## API Endpoints

### Assessment Management
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments` - List all assessments
- `GET /api/assessments/:id` - Get assessment details
- `PATCH /api/assessments/:id` - Update assessment status

### Questions
- `GET /api/assessments/:id/questions/:phase` - Get phase questions

### Responses
- `POST /api/responses` - Submit an answer
- `GET /api/assessments/:id/responses` - Get all responses

### Reports
- `GET /api/assessments/:id/synthesis` - Get AI synthesis
- `GET /api/assessments/:id/report/pdf` - Download PDF
- `GET /api/assessments/:id/report/csv` - Download CSV

### Health
- `GET /api/health` - Health check

---

## Database Schema

### assessments
- Employee information and assessment metadata
- Status tracking (in_progress, completed)
- AI synthesis storage

### questions
- Assessment questions grouped by phase
- Question types (rating, multiple_choice, open_ended)
- Difficulty levels

### responses
- Employee answers to questions
- Answer content and explanations
- Timestamp tracking

### interest_categories
- Available professional categories
- Pre-populated with 8 categories

---

## Scripts

### Development
```bash
npm run dev              # Start both frontend & backend
npm run server           # Backend only (port 5000)
npm run client           # Frontend only (port 5173)
```

### Building
```bash
npm run build            # Build frontend for production
```

### Database (Local)
```bash
npm run db:reset         # Reset local SQLite database
```

---

## Configuration

### Tailwind Colors
The app uses custom colors defined in `frontend/tailwind.config.js`:
- `primary`: #2C3E50 (dark blue)
- `secondary`: #1ABC9C (teal)
- `accent`: #E74C3C (red)

---

## Troubleshooting

### Local Development

| Problem | Solution |
|---------|----------|
| Port 5000 in use | `lsof -i :5000 \| grep node \| awk '{print $2}' \| xargs kill -9` |
| Port 5173 in use | `lsof -i :5173 \| grep node \| awk '{print $2}' \| xargs kill -9` |
| Database locked | Delete `./data/bilan.db` and restart |
| Cannot find module | Run `npm install` in that directory |
| Vite not finding files | Clear `.vite` cache: `rm -rf frontend/.vite` |

### Deployment (Vercel + Railway)

| Problem | Solution |
|---------|----------|
| Frontend shows blank page | Check browser console → verify VITE_API_URL in Vercel env vars |
| Backend deployment fails | Check logs in Railway dashboard → verify package.json scripts |
| CORS errors | Check FRONTEND_URL in Railway backend env matches Vercel domain |
| Database connection error | Verify DATABASE_URL in Railway env vars |
| API requests 404 | Check backend is deployed and health endpoint responds |

---

## Development Time Estimate

- Backend setup: 1 hour
- API implementation: 3-4 hours
- Gemini integration: 2 hours
- Utilities (PDF/CSV): 1.5 hours
- Frontend setup: 1-2 hours
- Components: 4-5 hours
- Integration & testing: 2 hours
- Polish & deployment config: 2 hours

**Total: ~18-22 hours** ✅ COMPLETED

---

## Future Enhancements

- [ ] User authentication (JWT)
- [ ] Multi-language support
- [ ] Question bank management UI
- [ ] Custom assessment templates
- [ ] Performance analytics dashboard
- [ ] Email report delivery
- [ ] Assessment scheduling
- [ ] Comparison reports between assessments
- [ ] Real-time collaboration features
- [ ] Mobile app (React Native)

---

## Security Considerations

- ✅ Environment variables never committed (.env in .gitignore)
- ✅ CORS configured for specific domains
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React escapes by default)
- ⚠️ Add authentication for production (JWT recommended)
- ⚠️ Add rate limiting on API endpoints
- ⚠️ Enable HTTPS only in production

---

## License

MIT License - Feel free to use this project for personal or commercial use.

---

## Support & Documentation

- **Quick Start**: See `QUICK_START_GUIDE_FOR_AI.md`
- **Full Specification**: See `COMPREHENSIVE_SPEC_BilanCompetence_SimpleLocal.md`
- **Deployment Details**: See `DEPLOYMENT_GUIDE.md`
- **Testing Checklist**: See `TESTING_AND_DEPLOYMENT_CHECKLIST.md`

---

## Getting Help

### Local Development Issues
1. Check `QUICK_START_GUIDE_FOR_AI.md` for step-by-step instructions
2. Review error messages in console (frontend) or terminal (backend)
3. Check Troubleshooting section above

### Deployment Issues
1. Review `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Check Vercel and Railway dashboards for logs
3. Verify all environment variables are set correctly

---

## Contributing

Feel free to fork this project and submit pull requests with improvements!

---

## Version History

- **v1.0.0** (Nov 8, 2025) - Initial release
  - ✅ Full assessment flow implemented
  - ✅ AI synthesis with Gemini API
  - ✅ PDF and CSV exports
  - ✅ Admin dashboard
  - ✅ Production deployment ready

---

**Status**: ✅ Production Ready | 🟢 Fully Tested | 🚀 Ready to Deploy

Last Updated: November 8, 2025
