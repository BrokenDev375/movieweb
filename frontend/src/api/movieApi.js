import axiosClient from './axiosClient';

export const movieApi = {
    getAllMovies: async () => {
        const response = await axiosClient.get('/movies');
        return response.data; 
    },
    getMovieById: async (id) => {
        const response = await axiosClient.get(`/movies/${id}`);
        return response.data.data || response.data; 
    },
    getMovieUrls: async (movieId) => {
        try {
            // ĐÃ SỬA: Đổi /urls thành /episodes cho khớp với Spring Boot
            const response = await axiosClient.get(`/movies/${movieId}/episodes`);
            return response.data.data || response.data;
        } catch (error) {
            console.warn("Lỗi lấy URL video:", error.message);
            return [];
        }
    },
    getCommentsByMovie: async (movieId) => {
        try {
            const response = await axiosClient.get(`/movies/${movieId}/comments`);
            return response.data.data || response.data;
        } catch (error) {
            console.warn("Chưa có API lấy Comment:", error.message);
            return [];
        }
    },
    searchMovies: async (keyword = '', genreId = '', nation = '') => {
        try {
            let query = `/movies/search?`;
            if (keyword) query += `keyword=${keyword}&`;
            if (genreId) query += `genreId=${genreId}&`;
            if (nation) query += `nation=${nation}&`;

            const response = await axiosClient.get(query);
            return response.data.data.content || response.data.data || []; 
        } catch (error) {
            console.error("Lỗi tìm kiếm/lọc phim:", error);
            return [];
        }
    },
    postComment: async (commentData) => {
        const response = await axiosClient.post('/comments', commentData);
        return response.data;
    },
    getAverageRating: async (movieId) => {
        try {
            const response = await axiosClient.get(`/movies/${movieId}/ratings/average`);
            return response.data.data; 
        } catch (error) {
            console.warn("Lỗi lấy điểm đánh giá:", error.message);
            return 0; 
        }
    },
};