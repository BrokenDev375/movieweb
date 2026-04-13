import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaChartBar, FaFilm, FaTags, FaUsers, FaArrowLeft } from 'react-icons/fa';

const navItems = [
    { to: '/admin', icon: FaChartBar, label: 'Dashboard', end: true },
    { to: '/admin/movies', icon: FaFilm, label: 'Quản lý phim' },
    { to: '/admin/genres', icon: FaTags, label: 'Thể loại' },
    { to: '/admin/users', icon: FaUsers, label: 'Người dùng' },
];

const AdminLayout = () => {
    const { user } = useAuth();

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`;

    return (
        <div className="flex min-h-screen bg-[#0f0f0f]">
            {/* Sidebar */}
            <aside className="w-60 bg-[#1a1a1a] border-r border-gray-800 flex flex-col fixed h-full z-40">
                <div className="px-5 py-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold text-white tracking-wide">Admin Panel</h1>
                    <p className="text-xs text-gray-500 mt-1">{user.username}</p>
                    <NavLink to="/" className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white transition">
                        <FaArrowLeft /> Về trang chủ
                    </NavLink>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(item => (
                        <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                            <item.icon className="text-base" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-60 p-8 text-white">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
