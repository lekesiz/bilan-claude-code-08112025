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
- **Local First**: SQLite database, no external dependencies

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
- SQLite 3
- Google Gemini API
- pdfkit for PDF generation

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Google Gemini API Key

### Installation

1. Clone the repository
```bash
cd bilan-app
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file in `backend/` directory:
```bash
cat > backend/.env << EOF
GEMINI_API_KEY=your-gemini-api-key-here
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/bilan.db
EOF
```

4. Start development servers (both backend & frontend)
```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Getting Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create an API key for the Gemini API
3. Add it to your `.env` file

## Project Structure

```
bilan-app/
├── backend/
│   ├── config/
│   │   └── database.js          # SQLite setup and schema
│   ├── routes/
│   │   ├── assessments.js       # Assessment endpoints
│   │   ├── questions.js         # Question retrieval
│   │   ├── responses.js         # Answer submission
│   │   └── reports.js           # Synthesis and exports
│   ├── ai/
│   │   ├── geminiIntegration.js # Gemini API calls
│   │   └── prompts.js           # Prompt templates
│   ├── utils/
│   │   ├── reportGenerator.js   # PDF generation
│   │   └── csvExporter.js       # CSV export
│   ├── server.js                # Express entry point
│   └── .env                     # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InitialInfo.jsx      # Initial form component
│   │   │   ├── QuestionStep.jsx     # Question display component
│   │   │   └── ProgressBar.jsx      # Progress indicator
│   │   ├── pages/
│   │   │   ├── AssessmentForm.jsx   # Main assessment page
│   │   │   ├── ResultsPage.jsx      # Results and synthesis
│   │   │   └── AdminDashboard.jsx   # Admin panel
│   │   ├── api/
│   │   │   └── client.js            # API client
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Tailwind styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── data/                        # SQLite database (auto-created)
├── package.json
└── README.md
```

## API Endpoints

### Assessments
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

## Assessment Flow

1. **Initial Info** - Employee enters name, interest category, available hours
2. **AI Personalization** - Gemini generates personalized assessment structure
3. **Questions** - Employee answers multi-step questions (rating, multiple choice, open-ended)
4. **Synthesis** - Gemini analyzes responses and generates comprehensive report
5. **Results** - Employee views synthesis, strengths, recommendations
6. **Export** - Download PDF report or CSV data

## Database Schema

### assessments
- Employee information, assessment metadata
- Status tracking (in_progress, completed)
- AI synthesis storage

### questions
- Assessment questions grouped by phase
- Question type (rating, multiple_choice, open_ended)
- Difficulty levels

### responses
- Employee answers to questions
- Answer content and explanations
- Timestamp tracking

### interest_categories
- Available professional categories
- Pre-populated with 8 categories

## Scripts

```bash
# Development
npm run dev              # Start both frontend & backend
npm run server           # Backend only
npm run client           # Frontend only

# Building
npm run build            # Build frontend for production

# Database
npm run db:reset         # Reset database (delete bilan.db)
```

## Configuration

### Tailwind Colors
The app uses custom colors defined in `tailwind.config.js`:
- `primary`: #2C3E50 (dark blue)
- `secondary`: #1ABC9C (teal)
- `accent`: #E74C3C (red)

### Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key
- `NODE_ENV`: development or production
- `PORT`: Backend port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)
- `DATABASE_PATH`: SQLite database path (default: ./data/bilan.db)

## Development Time Estimate

- Backend setup: 1 hour
- API implementation: 3-4 hours
- Gemini integration: 2 hours
- Utilities (PDF/CSV): 1.5 hours
- Frontend setup: 1-2 hours
- Components: 4-5 hours
- Integration & testing: 2 hours
- Polish: 1.5 hours

**Total: 18-22 hours**

## Future Enhancements

- User authentication
- Multi-language support
- Question bank management
- Custom assessment templates
- Performance analytics dashboard
- Email report delivery
- Assessment scheduling
- Comparison reports

## Troubleshooting

### Port already in use
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Database locked error
```bash
# Reset database
rm -f ./data/bilan.db
npm run dev  # This will recreate the database
```

### Gemini API errors
- Verify API key is correct and valid
- Check API quotas haven't been exceeded
- Ensure proper JSON response format

### Frontend not connecting to backend
- Check FRONTEND_URL in backend/.env
- Ensure backend is running on correct port
- Check browser console for CORS errors

## License

MIT

## Support

For issues or questions, please check the comprehensive documentation in:
- `COMPREHENSIVE_SPEC_BilanCompetence_SimpleLocal.md` - Technical specifications
- `QUICK_START_GUIDE_FOR_AI.md` - Development guide
