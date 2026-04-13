import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentApi } from '../../api/paymentApi';
import { FaCrown, FaCheck, FaStar, FaHistory } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const PLAN_ORDER = ['1month', '3months', '12months'];

const PremiumPage = () => {
    const { user, isPremium } = useAuth();
    const navigate = useNavigate();
    const [plans, setPlans] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('1month');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        paymentApi.getPlans().then(setPlans).catch(console.error);
        if (user) {
            paymentApi.getHistory().then(setHistory).catch(() => {});
        }
    }, [user]);

    const handlePayment = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setLoading(true);
        try {
            const data = await paymentApi.createPayment(selectedPlan);
            // Redirect to VNPay
            window.location.href = data.paymentUrl;
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    const premiumUntil = user?.premiumUntil ? new Date(user.premiumUntil) : null;

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Hero */}
            <div className="bg-gradient-to-br from-yellow-600 via-amber-600 to-orange-700 py-16 px-4 text-center">
                <FaCrown className="text-6xl text-yellow-300 mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-3">Nâng cấp Premium</h1>
                <p className="text-white/80 text-lg max-w-xl mx-auto">
                    Xem tất cả phim Premium không giới hạn, trải nghiệm nội dung độc quyền
                </p>
            </div>

            {/* Current status */}
            {user && isPremium() && (
                <div className="max-w-3xl mx-auto px-4 mt-8">
                    <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border border-yellow-600 rounded-xl p-5 flex items-center gap-4">
                        <FaCrown className="text-3xl text-yellow-400" />
                        <div>
                            <p className="font-semibold text-yellow-400">Bạn đang là thành viên Premium</p>
                            <p className="text-gray-300 text-sm">
                                Hết hạn: {premiumUntil?.toLocaleDateString('vi-VN')} lúc {premiumUntil?.toLocaleTimeString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Features */}
            <div className="max-w-3xl mx-auto px-4 mt-10">
                <h2 className="text-xl font-bold mb-4 text-center">Quyền lợi Premium</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        'Xem phim Premium độc quyền',
                        'Không giới hạn nội dung',
                        'Chất lượng video cao nhất',
                        'Ưu tiên phim mới nhất',
                    ].map((text, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-900 rounded-lg p-4 border border-gray-800">
                            <FaCheck className="text-green-400 flex-shrink-0" />
                            <span>{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plan selection */}
            <div className="max-w-4xl mx-auto px-4 mt-10">
                <h2 className="text-xl font-bold mb-6 text-center">Chọn gói</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {PLAN_ORDER.map(key => {
                        const plan = plans[key];
                        if (!plan) return null;
                        const isSelected = selectedPlan === key;
                        const isBest = key === '12months';
                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedPlan(key)}
                                className={`relative rounded-xl p-6 border-2 transition-all text-left ${
                                    isSelected
                                        ? 'border-yellow-500 bg-yellow-900/20 shadow-lg shadow-yellow-500/20'
                                        : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                                }`}
                            >
                                {isBest && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                                        Tiết kiệm nhất
                                    </span>
                                )}
                                <p className="text-lg font-bold mb-1">{plan.label}</p>
                                <p className="text-3xl font-bold text-yellow-400 mb-1">{formatPrice(plan.price)}</p>
                                <p className="text-gray-400 text-sm">{plan.days} ngày</p>
                                {key === '3months' && (
                                    <p className="text-green-400 text-xs mt-2">Tiết kiệm {formatPrice(79000 * 3 - 199000)}</p>
                                )}
                                {key === '12months' && (
                                    <p className="text-green-400 text-xs mt-2">Tiết kiệm {formatPrice(79000 * 12 - 599000)}</p>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="text-center mt-8">
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className={`px-10 py-3.5 rounded-xl font-bold text-lg tracking-wide transition ${
                            loading
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black shadow-lg shadow-yellow-500/30'
                        }`}
                    >
                        {loading ? 'Đang xử lý...' : user ? 'Thanh toán qua VNPay' : 'Đăng nhập để mua Premium'}
                    </button>
                </div>
            </div>

            {/* Payment history */}
            {user && history.length > 0 && (
                <div className="max-w-3xl mx-auto px-4 mt-12 mb-16">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaHistory /> Lịch sử thanh toán
                    </h2>
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-800">
                                    <th className="px-4 py-3 text-left">Thời gian</th>
                                    <th className="px-4 py-3 text-left">Gói</th>
                                    <th className="px-4 py-3 text-right">Số tiền</th>
                                    <th className="px-4 py-3 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(p => (
                                    <tr key={p.id} className="border-b border-gray-800/50">
                                        <td className="px-4 py-3">{new Date(p.createdAt).toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-3">{p.planDurationDays} ngày</td>
                                        <td className="px-4 py-3 text-right">{formatPrice(p.amount)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                p.status === 'SUCCESS' ? 'bg-green-900 text-green-400' :
                                                p.status === 'PENDING' ? 'bg-yellow-900 text-yellow-400' :
                                                'bg-red-900 text-red-400'
                                            }`}>{p.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PremiumPage;
