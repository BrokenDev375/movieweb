import axiosClient from './axiosClient';

export const userApi = {
    login: async (username, password) => {
        const response = await axiosClient.post('/auth/login', { username, password });
        return response.data;
    },
    register: async (userData) => {
        try {
            const response = await axiosClient.post('/auth/register', userData); 
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};