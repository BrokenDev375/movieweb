import axiosClient from './axiosClient';

export const paymentApi = {
    getPlans: async () => {
        const res = await axiosClient.get('/payments/plans');
        return res.data.data || res.data;
    },

    createPayment: async (plan) => {
        const res = await axiosClient.post('/payments/create', { plan });
        return res.data.data || res.data;
    },

    getHistory: async () => {
        const res = await axiosClient.get('/payments/history');
        return res.data.data || res.data;
    },
};
