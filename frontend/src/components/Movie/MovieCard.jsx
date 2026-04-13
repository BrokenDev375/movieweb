import React from 'react';
import { Link } from 'react-router-dom';
import { FaCrown } from 'react-icons/fa';

const MovieCard = ({ movie }) => {
    const imageUrl = movie.posterUrl || movie.poster_url || 'https://via.placeholder.com/250x375?text=No+Poster';

    return (
        // Thêm chế độ sáng (nền trắng, viền xám nhạt) và chế độ tối (nền xám đen)
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl flex flex-col">
            
            <div className="relative">
                <img 
                    src={imageUrl} 
                    alt={movie.title} 
                    className="w-full h-72 object-cover"
                />
                {movie.isPremium && (
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <FaCrown /> PREMIUM
                    </span>
                )}
            </div>
            
            <div className="p-4 grow flex flex-col justify-between">
                <div>
                    {/* Tên phim: Chữ đen khi sáng, chữ trắng khi tối */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1" title={movie.title}>
                        {movie.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Quốc gia: <span className="text-gray-800 dark:text-gray-200">{movie.nation || 'Đang cập nhật'}</span>
                    </p>
                </div>

                <Link 
                    to={`/movie/${movie.id}`}
                    className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200 shadow-md hover:shadow-lg"
                >
                    Xem ngay
                </Link>
            </div>
        </div>
    );
};

export default MovieCard;