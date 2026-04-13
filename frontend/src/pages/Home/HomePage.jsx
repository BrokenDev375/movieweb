import React, { useState, useEffect } from 'react';
import { movieApi } from '../../api/movieApi';
import { recommendApi } from '../../api/recommendApi';
import { useAuth } from '../../context/AuthContext';
import MovieCard from '../../components/Movie/MovieCard';
import { FaChevronRight } from 'react-icons/fa';

const PAGE_SIZE = 20;

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);

    const parseResponse = (res) => {
        // Spring Boot Page response
        if (res && res.data && Array.isArray(res.data.content)) {
            return { items: res.data.content, total: res.data.totalPages || 1 };
        }
        if (res && Array.isArray(res.content)) {
            return { items: res.content, total: res.totalPages || 1 };
        }
        if (Array.isArray(res)) return { items: res, total: 1 };
        if (res && Array.isArray(res.data)) return { items: res.data, total: 1 };
        return { items: [], total: 1 };
    };

    const fetchPage = async (p) => {
        setLoading(true);
        try {
            const res = await movieApi.getAllMovies(p, PAGE_SIZE);
            const { items, total } = parseResponse(res);
            setMovies(items);
            setTotalPages(total);
            setPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError("Không thể tải danh sách phim. Vui lòng kiểm tra server.");
            console.error("Lỗi fetch API:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPage(0); }, []);

    useEffect(() => {
        if (!user) return;
        const fetchRecommendations = async () => {
            const data = await recommendApi.getMyRecommendations(10);
            if (data && data.recommendations) {
                setRecommendations(data.recommendations);
            }
        };
        fetchRecommendations();
    }, [user]);

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

            {/* Gợi ý phim cho người dùng đã đăng nhập */}
            {user && recommendations.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-red-600 pl-3">
                        Gợi ý cho bạn
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {recommendations.map((rec) => (
                            <MovieCard key={rec.movie.id} movie={rec.movie} />
                        ))}
                    </div>
                </section>
            )}

            {!loading && !error && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-red-600 pl-3">
                        Tất cả phim
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination current={page} total={totalPages} onPageChange={fetchPage} />
                    )}
                </section>
            )}

            {movies.length === 0 && !loading && !error && (
                <p className="text-center text-gray-500 text-lg mt-20">Hiện chưa có bộ phim nào.</p>
            )}
        </div>
    );
};

const Pagination = ({ current, total, onPageChange }) => {
    const getPages = () => {
        const pages = [];
        if (total <= 7) {
            for (let i = 0; i < total; i++) pages.push(i);
            return pages;
        }
        // Always show first page
        pages.push(0);
        if (current > 2) pages.push('...');
        // Pages around current
        const start = Math.max(1, current - 1);
        const end = Math.min(total - 2, current + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (current < total - 3) pages.push('...');
        // Always show last page
        pages.push(total - 1);
        return pages;
    };

    const btn = "min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer";

    return (
        <div className="flex items-center justify-center gap-2 mt-10">
            {getPages().map((p, i) =>
                p === '...' ? (
                    <span key={`dot-${i}`} className="px-2 text-gray-500 dark:text-gray-400 select-none">...</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`${btn} ${
                            p === current
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-600 hover:text-white'
                        }`}
                    >
                        {p + 1}
                    </button>
                )
            )}
            {current < total - 1 && (
                <button
                    onClick={() => onPageChange(current + 1)}
                    className={`${btn} bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-600 hover:text-white`}
                >
                    <FaChevronRight />
                </button>
            )}
        </div>
    );
};

export default HomePage;