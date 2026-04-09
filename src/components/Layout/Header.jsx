import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaCaretDown, FaMoon, FaSun, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // Mảng dữ liệu đã chuẩn hóa (Thể loại có ID để gọi API)
    const genres = [
        { id: 1, name: 'Action' },
        { id: 2, name: 'Drama' },
        { id: 3, name: 'Anime' },
        { id: 4, name: 'Romance' },
        { id: 6, name: 'Science fiction' },
        { id: 7, name: 'Horror' },
        { id: 8, name: 'Documentary' },
    ];
    const countries = ['Korea', 'China', 'USA', 'Vietnam', 'Japan', 'Thailand'];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?keyword=${searchQuery}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white/95 dark:bg-[#141414]/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 py-3 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                
                {/* 1. KHU VỰC TÌM KIẾM */}
                <div className="flex-shrink-0 mr-8">
                    <form onSubmit={handleSearch} className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm phim..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-100 dark:bg-[#2b2b2b] text-gray-900 dark:text-gray-200 text-sm rounded-md py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all duration-300"
                        />
                    </form>
                </div>

                {/* 2. KHU VỰC MENU LINK */}
                <div className="flex-grow flex items-center space-x-6 text-[15px] font-medium hidden md:flex">
                    <Link to="/" className="text-red-600 dark:text-white font-bold text-lg tracking-wider hover:text-red-500 transition">PHIM HAY</Link>
                    <Link to="/phim-bo" className="hover:text-red-600 dark:hover:text-white transition">Phim Bộ</Link>
                    <Link to="/phim-le" className="hover:text-red-600 dark:hover:text-white transition">Phim Lẻ</Link>
                    <Link to="/chieu-rap" className="hover:text-red-600 dark:hover:text-white transition">Phim Chiếu Rạp</Link>
                    
                    {/* DROPDOWN: THỂ LOẠI */}
                    <div className="relative group py-2">
                        <button className="flex items-center gap-1 hover:text-red-600 dark:hover:text-white transition focus:outline-none">
                            Thể loại <FaCaretDown className="text-xs" />
                        </button>
                        <div className="absolute left-0 mt-2 w-[400px] bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 z-50">
                            <ul className="grid grid-cols-3 gap-3">
                                {genres.map((genre, index) => (
                                    <li key={index}>
                                        <Link to={`/search?genreId=${genre.id}&genreName=${genre.name}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition block">
                                            {genre.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* DROPDOWN: QUỐC GIA */}
                    <div className="relative group py-2">
                        <button className="flex items-center gap-1 hover:text-red-600 dark:hover:text-white transition focus:outline-none">
                            Quốc gia <FaCaretDown className="text-xs" />
                        </button>
                        <div className="absolute left-0 mt-2 w-[300px] bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 z-50">
                            <ul className="grid grid-cols-2 gap-3">
                                {countries.map((country, index) => (
                                    <li key={index}>
                                        <Link to={`/search?nation=${country}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition block">
                                            {country}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 3. KHU VỰC USER & ĐỔI THEME */}
                <div className="flex-shrink-0 flex items-center gap-5">
                    <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 text-xl transition-colors duration-300 focus:outline-none">
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    {user ? (
                        <div className="relative group py-2">
                            <button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-white transition focus:outline-none font-bold">
                                <FaUserCircle className="text-2xl" />
                                <span>{user.username}</span>
                                <FaCaretDown className="text-xs" />
                            </button>
                            
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2 z-50">
                                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Trang cá nhân</Link>
                                <Link to="/favorites" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Phim yêu thích</Link>
                                <Link to="/history" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Lịch sử xem</Link>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 transition">Đăng xuất</button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-bold rounded transition">Đăng nhập</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;