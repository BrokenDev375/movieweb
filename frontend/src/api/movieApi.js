import axiosClient from './axiosClient';

export const movieApi = {
    getAllMovies: async (page = 0, size = 20) => {
        const response = await axiosClient.get(`/movies?page=${page}&size=${size}`);
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
    searchMovies: async (keyword = '', genreId = '', nation = '', page = 0, size = 20) => {
        try {
            let query = `/movies/search?page=${page}&size=${size}&`;
            if (keyword) query += `keyword=${encodeURIComponent(keyword)}&`;
            if (genreId) query += `genreId=${genreId}&`;
            if (nation) query += `nation=${encodeURIComponent(nation)}&`;

            const response = await axiosClient.get(query);
            return response.data.data || response.data; 
        } catch (error) {
            console.error("Lỗi tìm kiếm/lọc phim:", error);
            return { content: [], totalPages: 0 };
        }
    },
    getAllGenres: async () => {
        try {
            const response = await axiosClient.get('/genres');
            return response.data.data || response.data || [];
        } catch (error) {
            console.warn("Lỗi lấy thể loại:", error.message);
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