// Trong file axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Tùy chỉnh baseURL của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor này vào
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;