import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { FaUsers, FaFilm, FaTags, FaComments, FaStar, FaHeart, FaHistory, FaBrain, FaSync } from 'react-icons/fa';

const statCards = [
    { key: 'totalUsers', label: 'Người dùng', icon: FaUsers, color: 'from-blue-500 to-blue-700' },
    { key: 'totalMovies', label: 'Phim', icon: FaFilm, color: 'from-red-500 to-red-700' },
    { key: 'totalGenres', label: 'Thể loại', icon: FaTags, color: 'from-green-500 to-green-700' },
    { key: 'totalComments', label: 'Bình luận', icon: FaComments, color: 'from-yellow-500 to-yellow-700' },
    { key: 'totalRatings', label: 'Đánh giá', icon: FaStar, color: 'from-purple-500 to-purple-700' },
    { key: 'totalFavorites', label: 'Yêu thích', icon: FaHeart, color: 'from-pink-500 to-pink-700' },
    { key: 'totalHistories', label: 'Lượt xem', icon: FaHistory, color: 'from-cyan-500 to-cyan-700' },
];

const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [retrainLoading, setRetrainLoading] = useState(false);
    const [retrainResult, setRetrainResult] = useState(null);
    const [retrainError, setRetrainError] = useState('');

    useEffect(() => {
        adminApi.getDashboard(5).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const handleRetrain = async () => {
        if (retrainLoading) return;
        if (!window.confirm('Bạn có chắc muốn huấn luyện lại model? Quá trình này có thể mất vài phút.')) return;
        setRetrainLoading(true);
        setRetrainResult(null);
        setRetrainError('');
        try {
            const result = await adminApi.retrainModel();
            setRetrainResult(result);
        } catch (err) {
            setRetrainError(err.message || 'Retrain thất bại');
        } finally {
            setRetrainLoading(false);
        }
    };

    if (loading) return <div className="text-gray-400 text-center py-20">Đang tải...</div>;
    if (!data) return <div className="text-red-400 text-center py-20">Không lấy được dữ liệu dashboard.</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map(card => (
                    <div key={card.key} className={`bg-gradient-to-br ${card.color} rounded-xl p-5 shadow-lg`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{card.label}</p>
                                <p className="text-3xl font-bold text-white mt-1">{data[card.key] ?? 0}</p>
                            </div>
                            <card.icon className="text-3xl text-white/30" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Top lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <TopList title="Top yêu thích" items={data.topFavoriteMovies} valueKey="favoriteCount" valueLabel="lượt thích" />
                <TopList title="Top đánh giá" items={data.topRatedMovies} valueKey="averageRating" valueLabel="điểm" isRating />
                <TopList title="Top lượt xem" items={data.topWatchedMovies} valueKey="watchCount" valueLabel="lượt xem" />
            </div>

            {/* Retrain Model */}
            <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <FaBrain className="text-2xl text-purple-400" />
                    <div>
                        <h3 className="text-lg font-semibold text-white">Huấn luyện lại Model gợi ý</h3>
                        <p className="text-gray-400 text-sm">Cập nhật model AI với dữ liệu đánh giá mới nhất từ người dùng</p>
                    </div>
                </div>

                <button
                    onClick={handleRetrain}
                    disabled={retrainLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition ${
                        retrainLoading
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                >
                    <FaSync className={retrainLoading ? 'animate-spin' : ''} />
                    {retrainLoading ? 'Đang huấn luyện...' : 'Retrain Model'}
                </button>

                {retrainError && (
                    <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                        {retrainError}
                    </div>
                )}

                {retrainResult && retrainResult.status === 'no_change' && (
                    <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                        <p className="text-yellow-400 font-medium">Không có thay đổi</p>
                        <p className="text-gray-400 text-sm mt-1">{retrainResult.message || 'Dữ liệu không thay đổi so với lần retrain trước. Không cần huấn luyện lại.'}</p>
                    </div>
                )}

                {retrainResult && retrainResult.status === 'success' && (
                    <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                        <p className="text-green-400 font-medium mb-2">Huấn luyện thành công!</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-black/30 rounded-lg p-3">
                                <p className="text-gray-400 text-xs">RMSE</p>
                                <p className="text-white font-bold">{retrainResult.metrics?.rmse?.toFixed(4) ?? '—'}</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3">
                                <p className="text-gray-400 text-xs">MAE</p>
                                <p className="text-white font-bold">{retrainResult.metrics?.mae?.toFixed(4) ?? '—'}</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3">
                                <p className="text-gray-400 text-xs">Số người dùng</p>
                                <p className="text-white font-bold">{retrainResult.total_users ?? '—'}</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3">
                                <p className="text-gray-400 text-xs">Số phim</p>
                                <p className="text-white font-bold">{retrainResult.total_movies ?? '—'}</p>
                            </div>
                        </div>
                        {retrainResult.elapsed_seconds != null && (
                            <p className="text-gray-400 text-xs mt-2">Thời gian: {retrainResult.elapsed_seconds.toFixed(1)}s</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const TopList = ({ title, items = [], valueKey, valueLabel, isRating }) => (
    <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-300 px-5 py-4 border-b border-gray-800 uppercase tracking-wider">{title}</h3>
        {items.length === 0 ? (
            <p className="text-gray-500 text-sm px-5 py-4">Chưa có dữ liệu</p>
        ) : (
            <ul>
                {items.map((item, i) => (
                    <li key={item.movieId} className="flex items-center gap-3 px-5 py-3 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition">
                        <span className="w-6 h-6 rounded-full bg-gray-700 text-xs flex items-center justify-center font-bold text-gray-300">{i + 1}</span>
                        {item.posterUrl && <img src={item.posterUrl} alt="" className="w-8 h-12 object-cover rounded" />}
                        <span className="flex-1 text-sm truncate">{item.title}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                            {isRating ? Number(item[valueKey]).toFixed(1) : item[valueKey]} {valueLabel}
                        </span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default DashboardPage;
