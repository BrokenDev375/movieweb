import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaSun, FaMoon, FaUserCircle, FaSignOutAlt, FaSignInAlt, FaHeart, FaChevronDown, FaHistory } from 'react-icons/fa';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // State để mở/đóng menu xổ xuống
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null); // Để click ra ngoài thì tự đóng menu

    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDarkMode]);

    // Xử lý tự động đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        navigate('/login');
    };

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-50 transition-colors duration-300 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="text-3xl font-extrabold text-red-600 tracking-tighter hover:scale-105 transition-transform">
                    PHIM HAY
                </Link>

                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        {isDarkMode ? <FaSun className="text-xl text-yellow-400" /> : <FaMoon className="text-xl" />}
                    </button>

                    {user ? (
                        // KHU VỰC MENU XỔ XUỐNG CỦA USER
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 transition"
                            >
                                <FaUserCircle className="text-3xl md:text-2xl" />
                                <span className="hidden md:inline font-medium">{user.username}</span>
                                <FaChevronDown className={`text-sm transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Khung Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden py-1 z-50 transition-colors">
                                    <Link 
                                        to="/history" 
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-500 font-medium"
                                    >
                                        <FaHistory className="text-blue-500" /> Lịch sử xem
                                    </Link>
                                    <Link 
                                        to="/favorites" 
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-500 font-medium"
                                    >
                                        <FaHeart className="text-red-500" /> Phim yêu thích
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="flex items-center w-full gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium border-t border-gray-100 dark:border-gray-700"
                                    >
                                        <FaSignOutAlt className="text-gray-500" /> Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold transition-all">
                            <FaSignInAlt />
                            <span>Đăng nhập</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;