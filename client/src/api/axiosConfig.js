import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Automatically add Token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
// Response Interceptor (NEW: Handles Global Errors)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        // 1. Generic Error Message
        let errorMessage = "An unexpected error occurred.";

        if (response && response.data) {
            // Use the "message" field we standardized in GlobalExceptionHandler
            errorMessage = response.data.message || response.data.error || errorMessage;
        }

        // 2. Handle 401 Unauthorized (Token Expired/Invalid)
        if (response && response.status === 401) {
            // Only redirect if not already on login page to avoid loops
            if (!window.location.pathname.includes('/login')) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem('jwtToken');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
                return Promise.reject(error);
            }
        }

        // 3. Handle 403 Forbidden
        if (response && response.status === 403) {
            toast.error("You do not have permission to perform this action.");
        }

        // 4. Return rejection so local components can still handle specific cases if needed
        return Promise.reject(new Error(errorMessage));
    }
);

export const deleteContract = async (id) => {
    return await api.delete(`/contracts/${id}`);
};

export default api;