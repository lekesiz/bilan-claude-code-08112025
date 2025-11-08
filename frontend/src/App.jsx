import { useState } from 'react';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // home, form, results, dashboard
  const [assessmentId, setAssessmentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold">BilanCompetence</h1>
          <nav className="flex gap-4">
            <button
              onClick={() => setCurrentPage('home')}
              className="btn-secondary text-sm"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="btn-secondary text-sm"
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {!loading && currentPage === 'home' && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Welcome to BilanCompetence</h2>
            <p className="text-gray-600 mb-8">
              Take a comprehensive assessment to evaluate your competencies and get personalized recommendations.
            </p>
            <button
              onClick={() => setCurrentPage('form')}
              className="btn-primary text-lg"
            >
              Start Assessment
            </button>
          </div>
        )}

        {!loading && currentPage === 'form' && (
          <div className="text-center py-12">
            <p>Assessment Form (Coming in Step 9)</p>
          </div>
        )}

        {!loading && currentPage === 'results' && assessmentId && (
          <div className="text-center py-12">
            <p>Results Page (Coming in Step 9)</p>
          </div>
        )}

        {!loading && currentPage === 'dashboard' && (
          <div className="text-center py-12">
            <p>Admin Dashboard (Coming in Step 9)</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t mt-12">
        <div className="container text-center text-gray-600 py-4 text-sm">
          <p>BilanCompetence © 2025 - Powered by AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
