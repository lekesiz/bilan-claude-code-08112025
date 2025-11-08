import { useState, useEffect } from 'react';
import { reportAPI } from '../api/client';

export default function ResultsPage({ assessmentId, onBack }) {
  const [synthesis, setSynthesis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSynthesis = async () => {
      try {
        const data = await reportAPI.getSynthesis(assessmentId);
        setSynthesis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSynthesis();
  }, [assessmentId]);

  const handleDownloadPDF = async () => {
    try {
      const pdfBlob = await reportAPI.downloadPDF(assessmentId);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-${assessmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const csvBlob = await reportAPI.downloadCSV(assessmentId);
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-${assessmentId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!synthesis) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No synthesis available yet</p>
      </div>
    );
  }

  const syn = synthesis.synthesis || synthesis;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-3xl font-bold mb-2">Assessment Results</h2>
      <p className="text-gray-600 mb-6">{synthesis.employee_name} - {synthesis.interest_category}</p>

      {/* Key Strengths */}
      {syn.key_strengths && syn.key_strengths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-green-700 mb-3">Key Strengths</h3>
          <ul className="list-disc list-inside space-y-1">
            {syn.key_strengths.map((strength, idx) => (
              <li key={idx} className="text-gray-700">{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Development Areas */}
      {syn.development_areas && syn.development_areas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-blue-700 mb-3">Development Areas</h3>
          <ul className="list-disc list-inside space-y-1">
            {syn.development_areas.map((area, idx) => (
              <li key={idx} className="text-gray-700">{area}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Career Recommendations */}
      {syn.career_recommendations && syn.career_recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-purple-700 mb-3">Career Recommendations</h3>
          {syn.career_recommendations.map((rec, idx) => (
            <div key={idx} className="bg-purple-50 p-4 rounded mb-3">
              <p className="font-bold">{rec.job_title}</p>
              {rec.rome_code && <p className="text-sm text-gray-600">ROME: {rec.rome_code}</p>}
              <p className="text-gray-700 mt-2">{rec.rationale}</p>
            </div>
          ))}
        </div>
      )}

      {/* Next Steps */}
      {syn.specific_next_steps && syn.specific_next_steps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-orange-700 mb-3">Next Steps</h3>
          <ol className="list-decimal list-inside space-y-1">
            {syn.specific_next_steps.map((step, idx) => (
              <li key={idx} className="text-gray-700">{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Download Section */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-bold mb-4">Export Report</h3>
        <div className="flex gap-4">
          <button onClick={handleDownloadPDF} className="btn-primary flex-1">
            Download PDF
          </button>
          <button onClick={handleDownloadCSV} className="btn-secondary flex-1">
            Download CSV
          </button>
        </div>
      </div>

      {/* Back Button */}
      <button onClick={onBack} className="btn-secondary w-full mt-6">
        Back to Home
      </button>
    </div>
  );
}
