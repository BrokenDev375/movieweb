import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import { FaUserCircle, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';

const ProfilePage = () => {
    const { user, login } = useAuth(); 
    
    // State cho Sửa Profile
    const [profileData, setProfileData] = useState({ email: '', phoneNumber: '' });
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // State cho Đổi mật khẩu
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Lấy thông tin user khi vào trang
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await userApi.getProfile();
                // Giả sử API trả về data nằm trong res.data
                const userData = res.data || res; 
                setProfileData({
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || userData.phone_number || ''
                });
            } catch (err) {
                console.error("Lỗi lấy thông tin profile:", err);
            }
        };
        fetchProfile();
    }, []);

    // Xử lý Cập nhật Profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileMsg({ type: '', text: '' });
        setIsUpdatingProfile(true);

        try {
            await userApi.updateProfile({
                email: profileData.email,
                phoneNumber: profileData.phoneNumber
            });
            setProfileMsg({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Lỗi cập nhật hồ sơ!' });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    // Xử lý Đổi Mật Khẩu
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMsg({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'Mật khẩu mới không khớp!' });
            return;
        }

        setIsChangingPassword(true);
        try {
            await userApi.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
        } catch (err) {
            setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Mật khẩu cũ không đúng!' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center text-white">Vui lòng đăng nhập...</div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#141414] py-10 px-4 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Tiêu đề trang */}
                <div className="flex items-center gap-4 border-b border-gray-300 dark:border-gray-800 pb-4">
                    <FaUserCircle className="text-5xl text-red-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tài khoản của tôi</h1>
                        <p className="text-gray-500">Xin chào, {user.username}!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* FORM 1: SỬA THÔNG TIN */}
                    <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <FaUserCircle className="text-red-500"/> Thông tin cá nhân
                        </h2>
                        
                        {profileMsg.text && (
                            <div className={`p-3 mb-4 rounded text-sm ${profileMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {profileMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-1">Tên đăng nhập (Không thể đổi)</label>
                                <input type="text" value={user.username} disabled className="w-full bg-gray-100 dark:bg-[#2a2d35] text-gray-500 rounded p-3 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-1"><FaEnvelope className="inline mr-1"/> Email</label>
                                <input 
                                    type="email" 
                                    value={profileData.email} 
                                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-[#2a2d35] text-gray-900 dark:text-white border border-gray-300 dark:border-transparent rounded p-3 focus:ring-1 focus:ring-red-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-1"><FaPhone className="inline mr-1"/> Số điện thoại</label>
                                <input 
                                    type="text" 
                                    value={profileData.phoneNumber} 
                                    onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-[#2a2d35] text-gray-900 dark:text-white border border-gray-300 dark:border-transparent rounded p-3 focus:ring-1 focus:ring-red-500 outline-none" 
                                />
                            </div>
                            <button type="submit" disabled={isUpdatingProfile} className="w-full bg-gray-800 hover:bg-gray-900 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-3 rounded mt-4 transition">
                                {isUpdatingProfile ? 'Đang lưu...' : 'LƯU THÔNG TIN'}
                            </button>
                        </form>
                    </div>

                    {/* FORM 2: ĐỔI MẬT KHẨU */}
                    <div className="bg-white dark:bg-[#1a1d24] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <FaLock className="text-red-500"/> Đổi mật khẩu
                        </h2>

                        {passwordMsg.text && (
                            <div className={`p-3 mb-4 rounded text-sm ${passwordMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {passwordMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-1">Mật khẩu hiện tại</label>
                                <input 
                                    type="password" 
                                    required
                                    value={passwordData.oldPassword} 
                                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-[#2a2d35] text-gray-900 dark:text-white border border-gray-300 dark:border-transparent rounded p-3 focus:ring-1 focus:ring-red-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-1">Mật khẩu mới</label>
                                <input 
                                    type="password" 
                                    required
                                    value={passwordData.newPassword} 
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-[#2a2d35] text-gray-900 dark:text-white border border-gray-300 dark:border-transparent rounded p-3 focus:ring-1 focus:ring-red-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 dark:text-gray-400 text-sm mb-1">Nhập lại mật khẩu mới</label>
                                <input 
                                    type="password" 
                                    required
                                    value={passwordData.confirmPassword} 
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-[#2a2d35] text-gray-900 dark:text-white border border-gray-300 dark:border-transparent rounded p-3 focus:ring-1 focus:ring-red-500 outline-none" 
                                />
                            </div>
                            <button type="submit" disabled={isChangingPassword} className="w-full bg-gray-800 hover:bg-gray-900 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-3 rounded mt-4 transition">
                                {isChangingPassword ? 'Đang xử lý...' : 'CẬP NHẬT MẬT KHẨU'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;