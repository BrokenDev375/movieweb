import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { interactApi } from '../../api/interactApi';
import { FaTrash, FaPlay, FaHeartBroken } from 'react-icons/fa';

const FavoritePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy dữ liệu khi vào trang
    useEffect(() => {
        // Chưa đăng nhập thì "mời" về trang login
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchFavorites = async () => {
            const data = await interactApi.getFavorites(user.id);
            setFavorites(data || []);
            setLoading(false);
        };

        fetchFavorites();
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    }, [user, navigate]);

    // Hàm xử lý khi bấm nút Thùng rác (Xóa)
    const handleRemove = async (movieId) => {
        // Hỏi lại cho chắc chắn
        if(!window.confirm("Bạn có chắc chắn muốn xóa phim này khỏi danh sách yêu thích?")) return;

        try {
            await interactApi.removeFavorite(user.id, movieId);
            // Cập nhật lại giao diện: Lọc bỏ bộ phim vừa xóa khỏi danh sách hiện tại
            setFavorites(favorites.filter(fav => fav.movieId !== movieId));
        } catch (error) {
            alert("Không thể xóa khỏi danh sách. Vui lòng thử lại!");
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-xl">Đang tải danh sách...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 border-b border-gray-300 dark:border-gray-700 pb-6 transition-colors duration-300">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-red-600 dark:text-red-500 tracking-tighter uppercase">
                        Phim yêu thích của tôi
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Nơi lưu giữ những bộ phim bạn đã thả tim</p>
                </header>

                {/* Nếu không có phim nào thì hiện thông báo */}
                {favorites.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <FaHeartBroken className="text-6xl text-gray-300 dark:text-gray-700 mb-6" />
                        <p className="text-xl text-gray-500 dark:text-gray-400 mb-6 font-medium">Bạn chưa có bộ phim yêu thích nào.</p>
                        <Link to="/" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-600/30 transition-transform hover:-translate-y-1">
                            Khám phá phim ngay
                        </Link>
                    </div>
                ) : (
                    // Lưới hiển thị danh sách phim
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {favorites.map((fav) => {
                            // Backend trả về theo FavoriteDto: movieTitle, moviePosterUrl
                            const imageUrl = fav.moviePosterUrl || 'https://via.placeholder.com/250x375?text=No+Poster';
                            
                            return (
                                <div key={fav.movieId} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:shadow-2xl flex flex-col group relative">
                                    
                                    {/* Nút Xóa (Thùng rác) nổi lên ở góc phải */}
                                    <button 
                                        onClick={() => handleRemove(fav.movieId)}
                                        className="absolute top-3 right-3 bg-black/60 hover:bg-red-600 text-white p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 z-10 opacity-80 hover:opacity-100 hover:scale-110 shadow-md"
                                        title="Xóa khỏi yêu thích"
                                    >
                                        <FaTrash />
                                    </button>

                                    <div className="overflow-hidden">
                                        <img 
                                            src={imageUrl} 
                                            alt={fav.movieTitle} 
                                            className="w-full h-64 sm:h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    
                                    <div className="p-4 flex flex-col grow justify-between bg-white dark:bg-gray-900 relative z-10 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 line-clamp-2" title={fav.movieTitle}>
                                            {fav.movieTitle}
                                        </h3>
                                        
                                        <Link 
                                            to={`/movie/${fav.movieId}`}
                                            className="flex justify-center items-center gap-2 bg-gray-100 hover:bg-red-600 dark:bg-gray-800 dark:hover:bg-red-600 text-gray-800 hover:text-white dark:text-gray-200 dark:hover:text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300 text-sm border border-gray-200 dark:border-gray-700 hover:border-transparent"
                                        >
                                            <FaPlay className="text-xs" /> Xem ngay
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

export default FavoritePage;