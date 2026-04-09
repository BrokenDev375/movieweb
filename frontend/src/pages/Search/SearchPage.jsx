import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { movieApi } from '../../api/movieApi';
import { FaSearch, FaPlay, FaFilter } from 'react-icons/fa';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    
    // Lấy các tham số từ URL
    const keyword = searchParams.get('keyword') || '';
    const genreId = searchParams.get('genreId') || '';
    const genreName = searchParams.get('genreName') || '';
    const nation = searchParams.get('nation') || '';

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            // Gọi API với đầy đủ tham số
            const results = await movieApi.searchMovies(keyword, genreId, nation);
            setMovies(results);
            setLoading(false);
        };

        fetchSearchResults();
        window.scrollTo(0, 0);
    }, [keyword, genreId, nation]); 

    if (loading) return <div className="min-h-screen flex justify-center items-center dark:bg-[#141414] dark:text-white text-xl">Đang tải phim...</div>;

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
                    <p className="text-gray-500 mt-2">Tìm thấy {movies.length} bộ phim</p>
                </header>

                {movies.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        Không có bộ phim nào phù hợp với tiêu chí của bạn.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movies.map((movie) => (
                            <div key={movie.id} className="bg-white dark:bg-[#1a1a1a] rounded-lg overflow-hidden shadow-lg group">
                                <div className="relative overflow-hidden">
                                    <img 
                                        src={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'} 
                                        alt={movie.title} 
                                        className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <Link to={`/movie/${movie.id}`} className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                            <FaPlay />
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-sm truncate" title={movie.title}>{movie.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{movie.releaseYear || 'Đang cập nhật'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;