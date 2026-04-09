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
    getProfile: async () => {
        try {
            const response = await axiosClient.get('/users/me'); 
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await axiosClient.put('/users/me', profileData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    changePassword: async (passwordData) => {
        try {
            const response = await axiosClient.put('/users/me/password', passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};