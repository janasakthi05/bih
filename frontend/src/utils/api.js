import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// If the app is opened from a device other than the developer machine (e.g., your phone),
// requests to 'http://localhost:5000' won't reach the backend. When the frontend is loaded
// in the browser, replace localhost in API_BASE_URL with the page hostname so API calls
// target the developer machine (if reachable) instead of the phone's localhost.
let resolvedApiBase = API_BASE_URL;
if (typeof window !== 'undefined') {
    try {
        const parsed = new URL(API_BASE_URL);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            parsed.hostname = window.location.hostname; // e.g., 192.168.x.x
            // Keep original port and pathname
            resolvedApiBase = parsed.toString().replace(/\/$/, '');
            console.log(`Using dynamic API base URL for cross-device access: ${resolvedApiBase}`);
        }
    } catch (err) {
        // ignore and use default
    }
}

// Create axios instance
const api = axios.create({
    baseURL: resolvedApiBase,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Get Firebase auth token
const getAuthToken = async () => {
    const { auth } = await import('./firebase');
    const user = auth.currentUser;
    if (user) {
        return user.getIdToken();
    }
    return null;
};

// Auth API calls
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (profileData) => api.put('/auth/profile', profileData)
};

// Emergency API calls
export const emergencyAPI = {
    saveProfile: (profileData) => api.post('/emergency/profile', profileData),
    getProfile: () => api.get('/emergency/profile'),
    generateQR: () => api.get('/emergency/qr/generate'),
    updateVisibility: (settings) => api.put('/emergency/visibility', settings),
    getPublicProfile: (hash) => api.get(`/emergency/public/emergency/${hash}`)
};

// Medical Records API calls
export const recordsAPI = {
    uploadRecord: (formData) => api.post('/records/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
    getRecords: (params) => api.get('/records', { params }),
    updateRecord: (recordId, data) => api.put(`/records/${recordId}`, data),
    deleteRecord: (recordId) => api.delete(`/records/${recordId}`)
};

// Chat API calls
export const chatAPI = {
    getIntro: () => api.get('/chat/intro'),
    sendMessage: (message) => api.post('/chat/message', { message })
};
// Visibility API calls
export const visibilityAPI = {
    getSettings: () => api.get('/visibility/settings'),
    updateSettings: (settings) => api.put('/visibility/settings', settings),
    getAuditLog: () => api.get('/visibility/audit'),
    resetSettings: () => api.post('/visibility/reset')
};
// Reminders API calls
export const remindersAPI = {
    createReminder: (data) => api.post('/reminders', data),
    getReminders: (params) => api.get('/reminders', { params }),
    updateReminder: (reminderId, data) => api.put(`/reminders/${reminderId}`, data),
    deleteReminder: (reminderId) => api.delete(`/reminders/${reminderId}`)
};

export default api;