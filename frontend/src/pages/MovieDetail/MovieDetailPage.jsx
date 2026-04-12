import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieApi } from '../../api/movieApi';
import { FaArrowLeft, FaGlobeAsia, FaStar, FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';
import CommentSection from '../../components/Movie/CommentSection'; 
import { useAuth } from '../../context/AuthContext';
import { interactApi } from '../../api/interactApi';
import VideoPlayer from '../../components/Movie/VideoPlayer';

const MovieDetailPage = () => {
    const { id } = useParams();
    const {user} = useAuth();
    const [movie, setMovie] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);

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
                const urlsData = await movieApi.getMovieUrls(id);
                if (urlsData && urlsData.length > 0) {
                    setEpisodes(urlsData);
                    setCurrentEpisode(urlsData[0]); 
                    setVideoUrl(urlsData[0].url);
                } else if (movieData.trailerUrl || movieData.trailer_url) {
                    setVideoUrl(movieData.trailerUrl || movieData.trailer_url); 
                } else {
                    console.warn("Bộ phim này chưa có link trailer_url trong Database");
                }
                const cmtData = await movieApi.getCommentsByMovie(id);
                if (Array.isArray(cmtData)) setComments(cmtData);
                const ratingData = await movieApi.getAverageRating(id);
                setAverageRating(ratingData);

            } catch (err) {
                console.error("Lỗi khi tải chi tiết phim:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetailData();
        window.scrollTo(0, 0); 
    }, [id]);
    // THÊM MỚI: Tự động lưu lịch sử xem phim
    useEffect(() => {
        const saveWatchHistory = async () => {
            // Chỉ lưu khi có user đăng nhập và đã xác định được tập phim đang xem (currentEpisode)
            if (user && currentEpisode && currentEpisode.id) {
                try {
                    // Gọi API lưu lịch sử với watchTime = 0 (đánh dấu là đã bắt đầu xem)
                    await interactApi.saveHistory(currentEpisode.id, 0);
                    console.log("Đã lưu phim vào lịch sử!");
                } catch (error) {
                    console.error("Lỗi lưu lịch sử (có thể do API hoặc Backend):", error);
                }
            }
        };

        // Kích hoạt hàm này mỗi khi biến currentEpisode thay đổi (người dùng chọn tập khác)
        saveWatchHistory();
    }, [currentEpisode, user]);

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white text-2xl">Đang tải dữ liệu phim...</div>;
    if (!movie) return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-red-500 text-2xl font-bold">Lỗi: Không tìm thấy thông tin phim từ Backend!</div>;

    const poster = movie.posterUrl || movie.poster_url || 'https://placehold.co/300x450/1f2937/ffffff?text=No+Poster';
    // Hàm nhận diện và chuyển đổi link YouTube thường thành link Embed chuẩn
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('/embed/')) return url; 
        
        // Cắt lấy ID video từ các định dạng link YouTube khác nhau
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
        }
        return url; // Nếu không phải YouTube thì trả về link gốc
    };
    
    // Kiểm tra xem link hiện tại có phải của YouTube không
    const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
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
                <div className="mb-6 bg-gray-900 dark:bg-black rounded-xl overflow-hidden shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-800 aspect-video relative group flex items-center justify-center transition-colors duration-300">
                    {videoUrl ? (
                        isYouTube ? (
                            <iframe 
                                className="w-full h-full object-cover"
                                src={getYouTubeEmbedUrl(videoUrl)} 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowFullScreen
                            ></iframe>
                        ) : (
                            // SỬ DỤNG COMPONENT VIDEO PLAYER THÔNG MINH TẠI ĐÂY
                            <VideoPlayer 
                                videoUrl={videoUrl} 
                                movieUrlId={currentEpisode ? currentEpisode.id : null} 
                            />
                        )
                    ) : (
                        <div className="text-center p-10">
                            <FaPlay className="text-6xl text-gray-400 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-xl">Trailer / Video đang được cập nhật...</p>
                        </div>
                    )}
                </div>

                {/* THÊM MỚI: KHU VỰC CHỌN TẬP PHIM (Chỉ hiện nếu có nhiều hơn 1 tập) */}
                {episodes.length > 0 && (
                    <div className="mb-12 bg-white dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Danh sách tập phim</h3>
                        <div className="flex flex-wrap gap-3">
                            {episodes.map((ep) => (
                                <button 
                                    key={ep.id}
                                    onClick={() => {
                                        setCurrentEpisode(ep);
                                        setVideoUrl(ep.url);
                                    }}
                                    className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                                        currentEpisode?.id === ep.id 
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 transform scale-105' 
                                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {ep.name || `Tập ${ep.episode || index + 1}`}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
                            
                            {/* HIỂN THỊ ĐIỂM TRUNG BÌNH */}
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-yellow-500 dark:text-yellow-400">
                                <FaStar />
                                <span className="text-gray-800 dark:text-white">
                                    {averageRating > 0 
                                        ? `${Number(averageRating).toFixed(1)} / 5` 
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

                            {/* ===== PHẦN HIỂN THỊ THỂ LOẠI (GENRES) ĐƯỢC THÊM MỚI ===== */}
                            {movie.genres && movie.genres.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 border-l border-gray-300 dark:border-gray-700 pl-4 ml-2">
                                    {movie.genres.map((genre, index) => (
                                        <span 
                                            key={index} 
                                            className="text-gray-700 dark:text-gray-300 bg-gray-200/50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors duration-300"
                                        >
                                            {typeof genre === 'string' ? genre : genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}

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