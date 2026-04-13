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

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.error("Token không hợp lệ hoặc đã hết hạn!");          
        }
        return Promise.reject(error);
    }
);

export default axiosClient;