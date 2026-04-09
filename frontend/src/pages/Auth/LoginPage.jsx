import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await userApi.login(username, password);
            console.log("Dữ liệu gốc từ API:", res);
            
            if (res && res.status === 200 && res.data) {
                const userToSave = res.data;
                
                login(userToSave); 
                
                navigate('/');    
            } else {
                setError("Lỗi: Không lấy được thông tin user từ Backend!");
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Đã xảy ra lỗi kết nối!");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-900 p-10 rounded-xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md transition-colors duration-300">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                    ĐĂNG NHẬP
                </h2>
                
                {error && <p className="text-red-500 text-center mb-4 bg-red-100 dark:bg-red-500/10 py-2 rounded">{error}</p>}
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-400 mb-2">Tên đăng nhập</label>
                        <input 
                            type="text" 
                            required
                            className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-transparent p-3 rounded focus:ring-2 focus:ring-red-600 outline-none transition-colors duration-300"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-400 mb-2">Mật khẩu</label>
                        <input 
                            type="password" 
                            required
                            className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-transparent p-3 rounded focus:ring-2 focus:ring-red-600 outline-none transition-colors duration-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition duration-200">
                        ĐĂNG NHẬP
                    </button>
                </form>
                <div className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-red-600 hover:text-red-700 font-bold transition-colors duration-300">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;