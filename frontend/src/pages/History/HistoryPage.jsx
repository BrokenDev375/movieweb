import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { interactApi } from '../../api/interactApi';
import { FaHistory, FaPlay } from 'react-icons/fa';

const HistoryPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchHistories = async () => {
            const data = await interactApi.getHistories();
            setHistories(data || []);
            setLoading(false);
        };

        fetchHistories();
        window.scrollTo(0, 0); 
    }, [user, navigate]);

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-xl">Đang tải lịch sử...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 border-b border-gray-300 dark:border-gray-700 pb-6 transition-colors duration-300">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tighter uppercase flex items-center gap-3">
                        <FaHistory /> Lịch sử xem
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Những bộ phim bạn đã xem gần đây</p>
                </header>

                {histories.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <FaHistory className="text-6xl text-gray-300 dark:text-gray-700 mb-6" />
                        <p className="text-xl text-gray-500 dark:text-gray-400 mb-6 font-medium">Bạn chưa xem bộ phim nào.</p>
                        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/30 transition-transform hover:-translate-y-1">
                            Xem phim ngay
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {histories.map((history) => {
                            // Backend trả về theo HistoryDto: movieTitle, moviePosterUrl, updatedAt...
                            const imageUrl = history.moviePosterUrl || 'https://via.placeholder.com/250x375?text=No+Poster';
                            
                            // Xử lý định dạng ngày tháng hiển thị
                            const watchDate = history.updatedAt ? new Date(history.updatedAt).toLocaleDateString('vi-VN') : 'Gần đây';

                            return (
                                <div key={history.movieId} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:shadow-2xl flex flex-col group relative">
                                    <div className="overflow-hidden">
                                        <img 
                                            src={imageUrl} 
                                            alt={history.movieTitle} 
                                            className="w-full h-64 sm:h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    
                                    <div className="p-4 flex flex-col grow justify-between bg-white dark:bg-gray-900 relative z-10 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={history.movieTitle}>
                                            {history.movieTitle}
                                        </h3>
                                        
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                            Đã xem: <span className="font-semibold text-blue-600 dark:text-blue-400">{watchDate}</span>
                                        </p>

                                        <Link 
                                            to={`/movie/${history.movieId}`}
                                            className="flex justify-center items-center gap-2 bg-gray-100 hover:bg-blue-600 dark:bg-gray-800 dark:hover:bg-blue-600 text-gray-800 hover:text-white dark:text-gray-200 dark:hover:text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300 text-sm border border-gray-200 dark:border-gray-700 hover:border-transparent"
                                        >
                                            <FaPlay className="text-xs" /> Xem lại
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;