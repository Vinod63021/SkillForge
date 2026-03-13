const BASE = 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  validateKey:      (api_key)  => request('/api/validate-key', { method: 'POST', body: JSON.stringify({ api_key }) }),
  getRoles:         ()         => request('/api/roles'),
  saveProfile:      (data)     => request('/api/save-profile',      { method: 'POST', body: JSON.stringify(data) }),
  getStudentFull:   (id)       => request(`/api/student-by-id/${id}/full`),
  generateChallenge:(data)     => request('/api/generate-challenge', { method: 'POST', body: JSON.stringify(data) }),
  saveQuiz:         (data)     => request('/api/save-quiz',          { method: 'POST', body: JSON.stringify(data) }),
  gapAnalysis:      (data)     => request('/api/gap-analysis',       { method: 'POST', body: JSON.stringify(data) }),
  generateRoadmap:  (data)     => request('/api/generate-roadmap',   { method: 'POST', body: JSON.stringify(data) }),
  quizHistory:      (id)       => request(`/api/quiz-history/${id}`),
};