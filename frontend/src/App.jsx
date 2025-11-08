import { useState } from 'react';
import './index.css';
import AssessmentForm from './pages/AssessmentForm';
import ResultsPage from './pages/ResultsPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [completedAssessmentId, setCompletedAssessmentId] = useState(null);

  const handleAssessmentComplete = (assessmentId) => {
    setCompletedAssessmentId(assessmentId);
    setCurrentPage('results');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setCompletedAssessmentId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold cursor-pointer" onClick={handleBackToHome}>
            BilanCompetence
          </h1>
          <nav className="flex gap-4">
            <button
              onClick={handleBackToHome}
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
        {currentPage === 'home' && (
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

        {currentPage === 'form' && (
          <div className="py-12">
            <AssessmentForm
              onComplete={handleAssessmentComplete}
              onBack={handleBackToHome}
            />
          </div>
        )}

        {currentPage === 'results' && completedAssessmentId && (
          <div className="py-12">
            <ResultsPage
              assessmentId={completedAssessmentId}
              onBack={handleBackToHome}
            />
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="py-12">
            <AdminDashboard />
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
