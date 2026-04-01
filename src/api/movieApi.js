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
            const response = await axiosClient.get(`/movies/${movieId}/urls`);
            return response.data.data || response.data;
        } catch (error) {
            console.warn("Chưa có API lấy URL video:", error.message);
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
    postComment: async (commentData) => {
        const response = await axiosClient.post('/comments', commentData);
        return response.data;
    }
};