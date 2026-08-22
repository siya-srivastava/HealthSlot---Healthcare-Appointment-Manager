import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Patient endpoints
export const patientAPI = {
  searchDoctors: (specialisation) =>
    api.get('/patient/doctors', { params: { specialisation } }),
  getAvailableSlots: (doctorId, date) =>
    api.get(`/patient/doctors/${doctorId}/slots`, { params: { date } }),
  bookAppointment: (data) => api.post('/patient/appointments', data),
  getMyAppointments: () => api.get('/patient/appointments'),
  getMyReminders: () => api.get('/patient/reminders'),
  cancelAppointment: (id) => api.put(`/patient/appointments/${id}/cancel`),
};

// Doctor endpoints
export const doctorAPI = {
  getMyAppointments: () => api.get('/doctor/appointments'),
  getMyProfile: () => api.get('/doctor/profile'),
  updateMyProfile: (data) => api.put('/doctor/profile', data),
  completeAppointment: (id, data) => api.put(`/doctor/appointments/${id}/complete`, data),
};

// Admin endpoints
export const adminAPI = {
  createDoctor: (data) => api.post('/admin/doctors', data),
  getAllDoctors: () => api.get('/admin/doctors'),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
  addLeaveDay: (id, date) => api.post(`/admin/doctors/${id}/leave`, { date }),
  getStats: () => api.get('/admin/stats'),
  getAllAppointments: () => api.get('/admin/appointments'),
};

// Calendar endpoints
export const calendarAPI = {
  getConnectUrl: () => api.get('/calendar/connect'),
  connectDemo: () => api.post('/calendar/connect-demo'),
  getStatus: () => api.get('/calendar/status'),
  disconnect: () => api.post('/calendar/disconnect'),
};

export default api;
