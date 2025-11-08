import { useState, useEffect } from 'react';
import ProgressBar from '../components/ProgressBar';
import { assessmentAPI } from '../api/client';

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, [selectedCategory, selectedStatus]);

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = '';
      if (selectedCategory) query += `&category=${selectedCategory}`;
      if (selectedStatus) query += `&status=${selectedStatus}`;

      const data = await assessmentAPI.getAll(50, 0);
      setAssessments(data.assessments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Software Development',
    'Data Analysis',
    'Project Management',
    'Human Resources',
    'Marketing',
    'Sales',
    'Business Analysis',
    'Leadership & Management'
  ];

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Assessment Dashboard</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full"
            >
              <option value="">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Loading assessments...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {assessments.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No assessments found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-bold">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-bold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-bold">Completed</th>
                    <th className="px-6 py-3 text-left text-sm font-bold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {assessment.first_name} {assessment.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm">{assessment.interest_category}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            assessment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {assessment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {assessment.status === 'completed' ? '✓' : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(assessment.start_time).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Statistics */}
      {assessments.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{assessments.length}</p>
            <p className="text-gray-600">Total Assessments</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {assessments.filter(a => a.status === 'completed').length}
            </p>
            <p className="text-gray-600">Completed</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {assessments.filter(a => a.status === 'in_progress').length}
            </p>
            <p className="text-gray-600">In Progress</p>
          </div>
        </div>
      )}
    </div>
  );
}
