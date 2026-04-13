import axiosClient from './axiosClient';

export const interactApi = {
    // Gọi API Thêm yêu thích (POST)
    addFavorite: async (payload) => {
        const response = await axiosClient.post('/favorites', payload);
        return response.data;
    },
    
    // Gọi API Xóa yêu thích (DELETE)
    removeFavorite: async (movieId) => {
        const response = await axiosClient.delete(`/favorites/${movieId}`);
        return response.data;
    },
    
    // Gọi API Kiểm tra (GET)
    checkFavorite: async (movieId) => {
        try {
            const response = await axiosClient.get(`/favorites/check?movieId=${movieId}`);
            return response.data.data; 
        } catch {
            return false;
        }
    },
    getFavorites: async () => {
        try{
            const response = await axiosClient.get(`/favorites`);        
            return response.data.data;
        } catch(error){
            console.error("Lỗi khi tải danh sách yêu thích:", error);
            return [];
        }
    },
    getHistories: async () => {
        try {
            const response = await axiosClient.get(`/history`);
            return response.data.data || response.data; 
        } catch (error) {
            console.error("Lỗi lấy lịch sử xem:", error);
            return [];
        }
    },
    saveHistory: async (movieUrlId, watchTime = 0) => {
        try {
            const payload = {
                movieUrlId: movieUrlId,
                watchTime: watchTime
            };
            const response = await axiosClient.post('/history', payload);
            return response.data;
        } catch (error) {
            console.error("Lỗi lưu lịch sử:", error);
            throw error;
        }
    }
};