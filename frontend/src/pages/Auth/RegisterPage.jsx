import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu nhập lại không khớp!');
            return;
        }

        setIsLoading(true);
        try {
            await userApi.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login'); 
            
        } catch (err) {
            if (err.response && err.response.data) {
                const resData = err.response.data;
                if (resData.data && typeof resData.data === 'object') {
                    setFieldErrors(resData.data);
                    setError('');
                } else if (resData.message) {
                    setError(resData.message);
                } else {
                    setError("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!");
                }
            } else {
                setError("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors duration-300 py-10">
            <div className="bg-white dark:bg-gray-900 p-10 rounded-xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md transition-colors duration-300">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                    ĐĂNG KÝ
                </h2>
                
                {error && <p className="text-red-500 text-center mb-4 bg-red-100 dark:bg-red-500/10 py-2 rounded">{error}</p>}
                {Object.keys(fieldErrors).length > 0 && (
                    <div className="mb-4 bg-red-100 dark:bg-red-500/10 py-3 px-4 rounded">
                        {Object.values(fieldErrors).map((msg, i) => (
                            <p key={i} className="text-red-500 text-sm">{msg}</p>
                        ))}
                    </div>
                )}
                
                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-400 mb-2">Tên đăng nhập</label>
                        <input 
                            type="text" 
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border ${fieldErrors.username ? 'border-red-500' : 'border-gray-300 dark:border-transparent'} p-3 rounded focus:ring-2 focus:ring-red-600 outline-none transition-colors duration-300`}
                        />
                        {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-400 mb-2">Email</label>
                        <input 
                            type="email" 
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-transparent'} p-3 rounded focus:ring-2 focus:ring-red-600 outline-none transition-colors duration-300`}
                        />
                        {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-400 mb-2">Mật khẩu</label>
                        <input 
                            type="password" 
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-transparent'} p-3 rounded focus:ring-2 focus:ring-red-600 outline-none transition-colors duration-300`}
                        />
                        {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-400 mb-2">Nhập lại mật khẩu</label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-transparent p-3 rounded focus:ring-2 focus:ring-red-600 outline-none transition-colors duration-300"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition duration-200 disabled:opacity-50 mt-2"
                    >
                        {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ TÀI KHOẢN'}
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-red-600 hover:text-red-700 font-bold transition-colors duration-300">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;