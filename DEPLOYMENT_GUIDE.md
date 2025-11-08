# BilanCompetence Deployment Guide

## Architecture for Production

```
┌─────────────────────────┐
│   Vercel (Frontend)     │
│ React + Vite Build      │
│ http://your-app.vercel  │
└──────────────┬──────────┘
               │ API Calls to
               ▼
┌─────────────────────────────┐
│   Your Backend Platform     │
│ (Railway, Render, Heroku)   │
│ Node.js + Express           │
│ PostgreSQL/MongoDB          │
└─────────────────────────────┘
```

## ✅ Quick Deployment Checklist

### 1️⃣ FRONTEND DEPLOYMENT (Vercel)

#### Prerequisites:
- [ ] GitHub account (push code to GitHub first)
- [ ] Vercel account (vercel.com - free tier available)

#### Steps:

**Step 1: Push to GitHub**
```bash
git remote add github https://github.com/YOUR-USERNAME/bilan-competence.git
git push github claude/git-uzerin-011CUvRLKyVj2bBYz5mobMNU
```

**Step 2: Deploy to Vercel**
1. Go to vercel.com
2. Click "New Project"
3. Select GitHub repository
4. Select "bilan-competence"
5. Configure:
   - **Framework**: Vite
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   ```
   VITE_API_URL = https://your-backend-api.com/api
   ```
7. Click "Deploy"

#### Frontend Deployment: ✅ DONE in ~1 minute

---

### 2️⃣ BACKEND DEPLOYMENT (Railway.app - Recommended)

#### Why Railway?
- ✅ Simple Node.js deployment
- ✅ PostgreSQL database included
- ✅ Free tier available ($5/month credits)
- ✅ Auto-deploys from GitHub

#### Steps:

**Step 1: Prepare Backend for Railway**

Create `/backend/railway.json`:
```json
{
  "buildCommand": "npm install",
  "startCommand": "npm start",
  "volumes": ["/app/data"]
}
```

**Step 2: Update Backend for Production Database**

Modify `/backend/config/database.js` to support environment variable:
```javascript
// Add PostgreSQL support or use cloud SQLite
```

**Step 3: Deploy on Railway**
1. Go to railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose your repository
5. Select `/backend` directory
6. Add environment variables:
   ```
   GEMINI_API_KEY=your-key
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   DATABASE_URL=postgresql://... (provided by Railway)
   ```
7. Deploy

#### Backend URL Example:
`https://your-app-backend.railway.app`

---

### 3️⃣ UPDATE FRONTEND TO POINT TO BACKEND

Once backend is deployed:

1. Go to Vercel Project Settings
2. Go to "Environment Variables"
3. Update: `VITE_API_URL = https://your-app-backend.railway.app/api`
4. Redeploy frontend (automatic)

---

## 🗄️ DATABASE OPTIONS

### Option 1: SQLite (Local Testing)
- ✅ Simple, no setup
- ❌ Not persistent on Vercel
- ✅ Good for: Local development

### Option 2: PostgreSQL (Recommended for Production)
- ✅ Persistent, scalable
- ✅ Railway provides free PostgreSQL
- ✅ Good for: Production

### Option 3: MongoDB (Alternative)
- ✅ NoSQL, flexible schema
- ✅ Free tier on MongoDB Atlas
- ✅ Good for: If you prefer NoSQL

**For this deployment**: Use Railway's PostgreSQL (included, free)

---

## 🔐 Environment Variables Setup

### Frontend Environment Variables (Vercel)
```
VITE_API_URL=https://your-backend.railway.app/api
```

### Backend Environment Variables (Railway)
```
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://... (auto-provided by Railway)
PORT=3000 (auto-assigned)
```

---

## ✅ DEPLOYMENT TIMELINE

| Step | Platform | Time | Status |
|------|----------|------|--------|
| 1. Push to GitHub | GitHub | 2 min | 🔵 |
| 2. Deploy Frontend | Vercel | 3 min | 🔵 |
| 3. Setup Backend | Railway | 5 min | 🔵 |
| 4. Configure DB | Railway | 2 min | 🔵 |
| 5. Link Frontend-Backend | Vercel | 1 min | 🔵 |
| **TOTAL** | - | **~13 minutes** | ✅ |

---

## 🧪 TESTING AFTER DEPLOYMENT

1. **Frontend**: Open `https://your-app.vercel.app`
2. **Check Backend**: `https://your-backend.railway.app/api/health`
3. **Create Assessment**: Fill form and submit
4. **Verify Database**: Check data is saved
5. **Test Export**: Download PDF/CSV

---

## 🚀 LIVE EXAMPLE FLOW

```
1. User goes to https://your-app.vercel.app
   ↓
2. Sees BilanCompetence homepage
   ↓
3. Clicks "Start Assessment"
   ↓
4. Frontend sends request to: https://your-backend.railway.app/api/assessments
   ↓
5. Backend creates assessment in PostgreSQL
   ↓
6. Returns questions to frontend
   ↓
7. User answers and submits
   ↓
8. Data saved to database
   ↓
9. AI synthesis generated (if Gemini API key set)
   ↓
10. PDF downloaded from: https://your-backend.railway.app/api/assessments/:id/report/pdf
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] GitHub account created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Railway account created
- [ ] Gemini API key obtained (optional but recommended)
- [ ] `.env.example` files created ✅
- [ ] `vercel.json` created ✅
- [ ] Backend ready for production database

---

## ⚠️ IMPORTANT NOTES

1. **SQLite Won't Work on Vercel**: Vercel is serverless, files are ephemeral
2. **Database Choice**: Use PostgreSQL (Railway) or MongoDB (Atlas)
3. **CORS**: Ensure `FRONTEND_URL` is correct in backend
4. **API Key Security**: Never commit `.env` files, use Vercel/Railway dashboards
5. **Build Time**: Vercel builds usually take 1-3 minutes

---

## 📞 TROUBLESHOOTING

### Frontend builds but shows blank page
- Check browser console for API errors
- Verify `VITE_API_URL` is correct
- Check backend `/api/health` endpoint

### Backend deployment fails
- Check `package.json` for correct start script
- Verify `NODE_ENV` is set to `production`
- Check logs in Railway dashboard

### Database connection errors
- Verify `DATABASE_URL` environment variable
- Check PostgreSQL is running (Railway)
- Test connection string locally first

### CORS errors
- Check `FRONTEND_URL` in backend env
- Ensure it matches exact domain (with/without trailing slash)

---

## 💡 NEXT STEPS AFTER DEPLOYMENT

1. **Monitor**: Check error logs in Vercel & Railway dashboards
2. **Scale**: If needed, upgrade plans
3. **Analytics**: Add monitoring (Sentry, LogRocket)
4. **Backup**: Setup database backups (Railway has auto-backup)
5. **Domain**: Add custom domain (both platforms support it)

---

**Status**: 🟢 Ready for Production Deployment
