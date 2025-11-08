const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json' }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // For files (PDF, CSV)
    return await response.blob();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Assessment endpoints
export const assessmentAPI = {
  create: (data) => apiCall('/assessments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getAll: (limit = 50, offset = 0) => apiCall(`/assessments?limit=${limit}&offset=${offset}`),

  getOne: (id) => apiCall(`/assessments/${id}`),

  updateStatus: (id, status) => apiCall(`/assessments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
};

// Question endpoints
export const questionAPI = {
  getByPhase: (assessmentId, phase) => apiCall(`/assessments/${assessmentId}/questions/${phase}`)
};

// Response endpoints
export const responseAPI = {
  submit: (data) => apiCall('/responses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getAll: (assessmentId) => apiCall(`/assessments/${assessmentId}/responses`)
};

// Report endpoints
export const reportAPI = {
  getSynthesis: (assessmentId) => apiCall(`/assessments/${assessmentId}/synthesis`),

  downloadPDF: (assessmentId) => apiCall(`/assessments/${assessmentId}/report/pdf`),

  downloadCSV: (assessmentId) => apiCall(`/assessments/${assessmentId}/report/csv`)
};

// Health check
export const health = () => apiCall('/health');

export default {
  apiCall,
  assessmentAPI,
  questionAPI,
  responseAPI,
  reportAPI,
  health
};
