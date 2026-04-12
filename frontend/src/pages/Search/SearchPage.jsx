import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { movieApi } from '../../api/movieApi';
import { FaSearch, FaPlay, FaFilter, FaChevronRight } from 'react-icons/fa';
import MovieCard from '../../components/Movie/MovieCard';

const PAGE_SIZE = 20;

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    
    const keyword = searchParams.get('keyword') || '';
    const genreId = searchParams.get('genreId') || '';
    const genreName = searchParams.get('genreName') || '';
    const nation = searchParams.get('nation') || '';

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPage = async (p) => {
        setLoading(true);
        const result = await movieApi.searchMovies(keyword, genreId, nation, p, PAGE_SIZE);
        const content = result.content || result || [];
        const pages = result.totalPages || 1;
        setMovies(content);
        setTotalPages(pages);
        setPage(p);
        setLoading(false);
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        setPage(0);
        fetchPage(0);
    }, [keyword, genreId, nation]);

    let pageTitle = "Tất cả phim";
    if (keyword) pageTitle = `Kết quả tìm kiếm: "${keyword}"`;
    else if (genreName) pageTitle = `Phim thể loại: ${genreName}`;
    else if (nation) pageTitle = `Phim quốc gia: ${nation}`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141414] p-4 md:p-8 text-gray-900 dark:text-white">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 border-b border-gray-300 dark:border-gray-800 pb-4">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        {keyword ? <FaSearch className="text-red-600" /> : <FaFilter className="text-red-600" />}
                        {pageTitle}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {loading ? 'Đang tải...' : `Trang ${page + 1} / ${totalPages}`}
                    </p>
                </header>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 text-xl">Đang tải phim...</div>
                ) : movies.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        Không có bộ phim nào phù hợp với tiêu chí của bạn.
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {movies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination current={page} total={totalPages} onPageChange={fetchPage} />
                        )}
                    </>
                )}
            </div>
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
        pages.push(0);
        if (current > 2) pages.push('...');
        const start = Math.max(1, current - 1);
        const end = Math.min(total - 2, current + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (current < total - 3) pages.push('...');
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

export default SearchPage;