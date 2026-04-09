import React, { useState, useEffect } from 'react';
import { movieApi } from '../../api/movieApi';
import MovieCard from '../../components/Movie/MovieCard';

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await movieApi.getAllMovies();

                let moviesArray = [];

                if (Array.isArray(res)) {
                    moviesArray = res; 
                } else if (res && Array.isArray(res.data)) {
                    moviesArray = res.data; 
                } else if (res && res.data && Array.isArray(res.data.content)) {
                    moviesArray = res.data.content; 
                } else if (res && Array.isArray(res.content)) {
                    moviesArray = res.content; 
                }
                setMovies(moviesArray);

            } catch (err) {
                setError("Không thể tải danh sách phim. Vui lòng kiểm tra server.");
                console.error("Lỗi fetch API:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    if (loading) return <div className="text-center text-gray-900 dark:text-white text-xl mt-10">Đang tải phim...</div>;
    if (error) return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;

    return (
        // Đã thêm chế độ Sáng/Tối cho nền chính và chữ
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 text-gray-900 dark:text-white transition-colors duration-300">
            
            {/* Header trang chủ */}
            <header className="mb-12 border-b border-gray-300 dark:border-gray-700 pb-6 transition-colors duration-300">
                <h1 className="text-4xl font-extrabold text-red-600 dark:text-red-500 tracking-tighter">
                    PHIM HAY
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Cập nhật những bộ phim mới nhất</p>
            </header>

            {loading && <p className="text-center text-xl text-gray-600 dark:text-gray-300">Đang tải danh sách phim...</p>}
            {error && <p className="text-center text-red-500 text-xl">{error}</p>}

            {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}

            {movies.length === 0 && !loading && !error && (
                <p className="text-center text-gray-500 text-lg mt-20">Hiện chưa có bộ phim nào.</p>
            )}
        </div>
    );
};

export default HomePage;