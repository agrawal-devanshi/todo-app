import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Automatically append /api if the user provided the root backend URL in Vercel
if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teenspend_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('teenspend_token');
        localStorage.removeItem('teenspend_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Expense Endpoints
export const expenseApi = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Budget Endpoints
export const budgetApi = {
  getBudgets: (params) => api.get('/budgets', { params }),
  setBudget: (data) => api.post('/budgets', data),
  getSummary: (params) => api.get('/budgets/summary', { params }),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),
};

// Analytics Endpoints
export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getCategories: (params) => api.get('/analytics/categories', { params }),
  getMonthlyTrend: () => api.get('/analytics/monthly'),
  getNecessary: (params) => api.get('/analytics/necessary', { params }),
  getBudgetComparison: (params) => api.get('/analytics/budget', { params }),
};

// Recommendation Endpoints (Prompt 18)
export const recommendationApi = {
  getRecommendations: () => api.get('/recommendations'),
};

// Savings Goals Endpoints
export const savingsApi = {
  getGoals: () => api.get('/savings-goals'),
  createGoal: (data) => api.post('/savings-goals', data),
  updateGoal: (id, data) => api.put(`/savings-goals/${id}`, data),
  addContribution: (id, amount) => api.post(`/savings-goals/${id}/contribute`, { amount }),
  deleteGoal: (id) => api.delete(`/savings-goals/${id}`),
};

export default api;
