import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieApi } from '../../api/movieApi';
import { FaArrowLeft, FaGlobeAsia, FaStar, FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';
import CommentSection from '../../components/Movie/CommentSection'; 
import { AuthContext } from '../../context/AuthContext';
import { interactApi } from '../../api/interactApi';

const MovieDetailPage = () => {
    const { id } = useParams();
    const {user} = useContext(AuthContext);
    const [movie, setMovie] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if(user && id){
            interactApi.checkFavorite(user.id, id).then(isFav => {
                setIsFavorite(isFav === true);
            });
        }
    }, [user, id]);

    const handleToggleFavorite = async () => {
        if(!user) {
            alert("Vui lòng đăng nhập để sử dụng tính năng này!");
            return;
        }
        
        try{
            if(isFavorite){
                await interactApi.removeFavorite(user.id, parseInt(id));
                setIsFavorite(false);
            }else{
                await interactApi.addFavorite({ userId: user.id, movieId: parseInt(id) });
                setIsFavorite(true);
            }        
        } catch(err){
            console.error("Lỗi khi cập nhật yêu thích:", err);          
            alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }            
    };

    useEffect(() => {
        const fetchDetailData = async () => {
            setLoading(true);
            try {
                const movieData = await movieApi.getMovieById(id);
                setMovie(movieData);

                const urlData = await movieApi.getMovieUrls(id);
                if (urlData && urlData.length > 0) {
                    setVideoUrl(urlData[0].url); 
                }

                const cmtData = await movieApi.getCommentsByMovie(id);
                if (Array.isArray(cmtData)) setComments(cmtData);

            } catch (err) {
                console.error("Lỗi khi tải chi tiết phim:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetailData();
        window.scrollTo(0, 0); 
    }, [id]);

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-2xl">Đang tải dữ liệu phim...</div>;
    if (!movie) return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-red-500 text-2xl font-bold">Lỗi: Không tìm thấy thông tin phim từ Backend!</div>;

    const poster = movie.posterUrl || movie.poster_url || 'https://placehold.co/300x450/1f2937/ffffff?text=No+Poster';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans pb-20 transition-colors duration-300">
            
            {/* Thanh điều hướng quay lại */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-40 shadow-sm transition-colors duration-300">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition duration-300">
                        <FaArrowLeft className="text-2xl" />
                    </Link>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">{movie.title}</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 mt-4">
                {/* === KHU VỰC 1: TRÌNH PHÁT VIDEO === */}
                <div className="mb-12 bg-gray-900 dark:bg-black rounded-xl overflow-hidden shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-800 aspect-video relative group flex items-center justify-center transition-colors duration-300">
                    {videoUrl ? (
                        <video controls autoPlay className="w-full h-full object-contain">
                            <source src={videoUrl} type="video/mp4" />
                            Trình duyệt không hỗ trợ thẻ video.
                        </video>
                    ) : (
                        <div className="text-center p-10">
                            <FaPlay className="text-6xl text-gray-400 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-xl">Trailer / Video đang được cập nhật...</p>
                        </div>
                    )}
                </div>

                {/* === KHU VỰC 2: THÔNG TIN CHI TIẾT PHIM === */}
                <div className="flex flex-col md:flex-row gap-8 mb-16 bg-white dark:bg-gray-900/50 p-6 md:p-10 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-none transition-colors duration-300">
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                        <img 
                            src={poster} 
                            alt={movie.title} 
                            className="w-56 md:w-72 rounded-xl shadow-[0_10px_30px_rgba(229,9,20,0.2)] dark:shadow-[0_10px_30px_rgba(229,9,20,0.3)] object-cover transform hover:scale-105 transition duration-500"
                        />
                    </div>
                    
                    <div className="flex-grow">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">{movie.title}</h2>
                        
                        <div className="flex flex-wrap items-center gap-6 mb-8 text-sm md:text-base font-medium">
                            
                            {/* KHU VỰC CHỈNH SỬA: HIỂN THỊ ĐIỂM TRUNG BÌNH */}
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-yellow-500 dark:text-yellow-400">
                                <FaStar />
                                <span className="text-gray-800 dark:text-white">
                                    {movie.averageRating && movie.averageRating > 0 
                                        ? `${movie.averageRating.toFixed(1)} / 5` 
                                        : "Chưa có đánh giá"}
                                </span>
                            </div>
                            
                            <button 
                                onClick={handleToggleFavorite}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 font-bold shadow-sm ${
                                    isFavorite 
                                    ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-500' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300 hover:text-red-500'
                                }`}
                            >
                                {isFavorite ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
                                <span>{isFavorite ? 'Đã yêu thích' : 'Yêu thích'}</span>
                            </button>                            
                            
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <FaGlobeAsia className="text-red-600 dark:text-red-500 text-xl" />
                                <span>{movie.nation || 'Chưa rõ'}</span>
                            </div>

                            <span className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-md uppercase tracking-wider text-xs shadow-lg shadow-red-600/30">
                                Full HD
                            </span>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 border-l-4 border-red-600 pl-3">Nội dung tóm tắt</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg text-justify bg-gray-50 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-transparent">
                                {movie.description || 'Nội dung chi tiết của bộ phim này đang được hệ thống cập nhật. Vui lòng quay lại sau!'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* === KHU VỰC 3: BÌNH LUẬN === */}
                <CommentSection 
                    movieId={id} 
                    comments={comments} 
                    setComments={setComments} 
                />

            </div>
        </div>
    );
};

export default MovieDetailPage;