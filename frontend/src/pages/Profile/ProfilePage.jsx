import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaSave, FaKey } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get('/users/me');
                const data = res.data.data || res.data;
                setProfile(data);
                setFormData({ email: data.email || '' });
            } catch {
                setError('Không thể tải thông tin tài khoản.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');
        try {
            const res = await axiosClient.put('/users/me', formData);
            const updated = res.data.data || res.data;
            setProfile(updated);
            setEditing(false);
            setMessage('Cập nhật thông tin thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi cập nhật thông tin.');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        try {
            await axiosClient.put('/users/me/password', passwordData);
            setChangingPassword(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setMessage('Đổi mật khẩu thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi đổi mật khẩu.');
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">Đang tải...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="max-w-2xl mx-auto">
                <header className="mb-10 border-b border-gray-300 dark:border-gray-700 pb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-red-600 dark:text-red-500 tracking-tighter uppercase">
                        Trang cá nhân
                    </h1>
                </header>

                {message && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg mb-4">{message}</div>}
                {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4">{error}</div>}

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-md">
                    <div className="flex items-center gap-4 mb-8">
                        <FaUserCircle className="text-6xl text-gray-400 dark:text-gray-600" />
                        <div>
                            <h2 className="text-2xl font-bold">{profile?.username}</h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {profile?.role || 'USER'}
                            </span>
                        </div>
                    </div>

                    {!editing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400">Email</label>
                                <p className="text-lg">{profile?.email || 'Chưa có'}</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400">Ngày tạo</label>
                                <p className="text-lg">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : '—'}</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setEditing(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition">
                                    Chỉnh sửa
                                </button>
                                <button onClick={() => setChangingPassword(!changingPassword)} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 font-bold py-2 px-6 rounded-lg transition">
                                    <FaKey /> Đổi mật khẩu
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none" />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition">
                                    <FaSave /> Lưu
                                </button>
                                <button type="button" onClick={() => setEditing(false)} className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 font-bold py-2 px-6 rounded-lg transition">
                                    Hủy
                                </button>
                            </div>
                        </form>
                    )}

                    {changingPassword && (
                        <form onSubmit={handleChangePassword} className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                            <h3 className="text-lg font-bold">Đổi mật khẩu</h3>
                            <input type="password" placeholder="Mật khẩu hiện tại" value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} required
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none" />
                            <input type="password" placeholder="Mật khẩu mới" value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none" />
                            <input type="password" placeholder="Xác nhận mật khẩu mới" value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none" />
                            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition">
                                Xác nhận đổi
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
