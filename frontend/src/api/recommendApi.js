import axiosClient from './axiosClient';

export const recommendApi = {
    getMyRecommendations: async (n = 10) => {
        try {
            const response = await axiosClient.get(`/recommendations/me?n=${n}`);
            return response.data.data || response.data;
        } catch (error) {
            console.warn("Không thể tải gợi ý phim:", error.message);
            return null;
        }
    },
};
