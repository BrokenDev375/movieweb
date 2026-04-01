import axiosClient from './axiosClient';

export const userApi = {
    login: async (username, password) => {
        const response = await axiosClient.post('/auth/login', { username, password });
        return response.data;
    }
};