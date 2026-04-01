import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

   const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await userApi.login(username, password);
            
            // Log ra console để bạn nhìn thấy tận mắt dữ liệu backend trả về
            console.log("Dữ liệu gốc từ API:", res);
            
            // Backend Spring Boot của bạn đang bọc data trong cấu trúc: res.data.data
            const userData = res.data && res.data.data ? res.data.data : res.data;
            
            if (userData && userData.username) {
                login(userData); // Gọi hàm lưu vào Context và LocalStorage
                navigate(-1);    // Quay lại trang phim
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
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="bg-gray-900 p-10 rounded-xl shadow-2xl border border-gray-800 w-full max-w-md">
                <h2 className="text-3xl font-bold text-white text-center mb-8 border-b border-gray-700 pb-4">ĐĂNG NHẬP</h2>
                
                {error && <p className="text-red-500 text-center mb-4 bg-red-500/10 py-2 rounded">{error}</p>}
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 mb-2">Tên đăng nhập</label>
                        <input 
                            type="text" 
                            required
                            className="w-full bg-gray-800 text-white p-3 rounded focus:ring-2 focus:ring-red-600 outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Mật khẩu</label>
                        <input 
                            type="password" 
                            required
                            className="w-full bg-gray-800 text-white p-3 rounded focus:ring-2 focus:ring-red-600 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition duration-200">
                        ĐĂNG NHẬP
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;