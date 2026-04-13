import axiosClient from './axiosClient';

export const adminApi = {
    // Dashboard
    getDashboard: async (topLimit = 5) => {
        const res = await axiosClient.get(`/admin/dashboard?topLimit=${topLimit}`);
        return res.data.data || res.data;
    },

    // Movies
    getMovies: async (page = 0, size = 10, sortBy = 'createdAt', direction = 'desc') => {
        const res = await axiosClient.get(`/movies?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);
        return res.data.data || res.data;
    },
    createMovie: async (movie) => {
        const res = await axiosClient.post('/movies', movie);
        return res.data.data || res.data;
    },
    updateMovie: async (id, movie) => {
        const res = await axiosClient.put(`/movies/${id}`, movie);
        return res.data.data || res.data;
    },
    deleteMovie: async (id) => {
        const res = await axiosClient.delete(`/movies/${id}`);
        return res.data;
    },

    // Episodes
    getEpisodes: async (movieId) => {
        const res = await axiosClient.get(`/movies/${movieId}/episodes`);
        return res.data.data || res.data;
    },
    addEpisode: async (movieId, episode) => {
        const res = await axiosClient.post(`/movies/${movieId}/episodes`, episode);
        return res.data.data || res.data;
    },
    updateEpisode: async (movieId, episodeId, episode) => {
        const res = await axiosClient.put(`/movies/${movieId}/episodes/${episodeId}`, episode);
        return res.data.data || res.data;
    },
    deleteEpisode: async (movieId, episodeId) => {
        const res = await axiosClient.delete(`/movies/${movieId}/episodes/${episodeId}`);
        return res.data;
    },

    // Genres
    getGenres: async () => {
        const res = await axiosClient.get('/genres');
        return res.data.data || res.data || [];
    },
    createGenre: async (genre) => {
        const res = await axiosClient.post('/genres', genre);
        return res.data.data || res.data;
    },
    updateGenre: async (id, genre) => {
        const res = await axiosClient.put(`/genres/${id}`, genre);
        return res.data.data || res.data;
    },
    deleteGenre: async (id) => {
        const res = await axiosClient.delete(`/genres/${id}`);
        return res.data;
    },

    // Users
    getUsers: async (page = 0, size = 10, username = '', email = '', role = '') => {
        let query = `/users?page=${page}&size=${size}`;
        if (username) query += `&username=${encodeURIComponent(username)}`;
        if (email) query += `&email=${encodeURIComponent(email)}`;
        if (role) query += `&role=${encodeURIComponent(role)}`;
        const res = await axiosClient.get(query);
        return res.data.data || res.data;
    },
    updateUserRole: async (id, role) => {
        const res = await axiosClient.put(`/users/${id}/role`, { role });
        return res.data.data || res.data;
    },
    deleteUser: async (id) => {
        const res = await axiosClient.delete(`/users/${id}`);
        return res.data;
    },

    // Retrain model (calls Python recommender service directly)
    retrainModel: async (secret = 'retrain-secret-key') => {
        const res = await fetch('http://localhost:8000/retrain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, n_epochs: 30, batch_size: 256, learning_rate: 0.0005 }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Retrain failed (${res.status})`);
        }
        return res.json();
    },
};
