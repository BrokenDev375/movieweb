import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import { FaTrash, FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchUsername, setSearchUsername] = useState('');
    const [filterRole, setFilterRole] = useState('');

    const fetchUsers = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers(p, 10, searchUsername, '', filterRole);
            setUsers(res.content || []);
            setTotalPages(res.totalPages || 1);
            setPage(p);
        } catch { setUsers([]); }
        setLoading(false);
    }, [searchUsername, filterRole]);

    useEffect(() => { fetchUsers(0); }, [fetchUsers]);

    const handleRoleChange = async (userId, newRole) => {
        if (!confirm(`Đổi role thành ${newRole}?`)) return;
        await adminApi.updateUserRole(userId, newRole);
        fetchUsers(page);
    };

    const handleDelete = async (id) => {
        if (!confirm('Xoá user này? Hành động này không thể hoàn tác.')) return;
        await adminApi.deleteUser(id);
        fetchUsers(page);
    };

    const roleBadge = (role) => {
        if (role === 'ADMIN') return 'bg-red-600/20 text-red-400 border border-red-600/30';
        return 'bg-gray-700/50 text-gray-300 border border-gray-600/30';
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Tìm theo username..."
                        value={searchUsername}
                        onChange={e => setSearchUsername(e.target.value)}
                        className="bg-[#2b2b2b] text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 w-64"
                    />
                </div>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="bg-[#2b2b2b] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500">
                    <option value="">Tất cả role</option>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            </div>

            {/* User Table */}
            <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Username</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-center">Role</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">Đang tải...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">Không có user nào.</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                <td className="px-4 py-3 text-gray-400">{u.id}</td>
                                <td className="px-4 py-3 font-medium">{u.username}</td>
                                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${roleBadge(u.role)}`}>{u.role}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <select
                                            value={u.role}
                                            onChange={e => handleRoleChange(u.id, e.target.value)}
                                            className="bg-[#2b2b2b] text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                        <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10 transition" title="Xoá"><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                    <button onClick={() => fetchUsers(page - 1)} disabled={page === 0} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 transition"><FaChevronLeft /></button>
                    <span className="text-sm text-gray-400">Trang {page + 1} / {totalPages}</span>
                    <button onClick={() => fetchUsers(page + 1)} disabled={page >= totalPages - 1} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 transition"><FaChevronRight /></button>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;
