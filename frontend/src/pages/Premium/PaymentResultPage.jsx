import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');
    const { user, updateUser } = useAuth();

    // Refresh user data after successful payment to update premiumUntil
    useEffect(() => {
        if (status === 'SUCCESS' && user) {
            // Re-login to get updated premiumUntil from backend
            axiosClient.get('/auth/me').then(res => {
                const data = res.data.data || res.data;
                if (data.premiumUntil) {
                    updateUser({ premiumUntil: data.premiumUntil });
                }
            }).catch(() => {});
        }
    }, [status]);

    const isSuccess = status === 'SUCCESS';

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {isSuccess ? (
                    <>
                        <FaCheckCircle className="text-7xl text-green-400 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-white mb-3">Thanh toán thành công!</h1>
                        <p className="text-gray-400 mb-8">
                            Tài khoản của bạn đã được nâng cấp Premium. Tận hưởng phim không giới hạn!
                        </p>
                    </>
                ) : (
                    <>
                        <FaTimesCircle className="text-7xl text-red-400 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-white mb-3">Thanh toán thất bại</h1>
                        <p className="text-gray-400 mb-8">
                            Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.
                        </p>
                    </>
                )}

                <div className="flex flex-col gap-3">
                    <Link
                        to="/"
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                    >
                        Về trang chủ
                    </Link>
                    {!isSuccess && (
                        <Link
                            to="/premium"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                        >
                            Thử lại
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;
