import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';

const GenreManagementPage = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editGenre, setEditGenre] = useState(null); // { id?, name }
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');

    const fetchGenres = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getGenres();
            setGenres(data);
        } catch { setGenres([]); }
        setLoading(false);
    };

    useEffect(() => { fetchGenres(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setError('');
        try {
            await adminApi.createGenre({ name: newName.trim() });
            setNewName('');
            fetchGenres();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tạo thể loại');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editGenre.name.trim()) return;
        setError('');
        try {
            await adminApi.updateGenre(editGenre.id, { name: editGenre.name.trim() });
            setEditGenre(null);
            fetchGenres();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi cập nhật thể loại');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xoá thể loại này?')) return;
        try {
            await adminApi.deleteGenre(id);
            fetchGenres();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xoá');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản lý thể loại</h1>

            {/* Add new genre */}
            <form onSubmit={handleCreate} className="flex gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Tên thể loại mới..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                    className="flex-1 max-w-sm bg-[#2b2b2b] text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
                    <FaPlus /> Thêm
                </button>
            </form>

            {error && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg mb-4">{error}</p>}

            {/* Genre Table */}
            <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 text-left w-20">ID</th>
                            <th className="px-4 py-3 text-left">Tên thể loại</th>
                            <th className="px-4 py-3 text-center w-40">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-8 text-gray-500">Đang tải...</td></tr>
                        ) : genres.length === 0 ? (
                            <tr><td colSpan={3} className="text-center py-8 text-gray-500">Chưa có thể loại nào.</td></tr>
                        ) : genres.map(g => (
                            <tr key={g.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                <td className="px-4 py-3 text-gray-400">{g.id}</td>
                                <td className="px-4 py-3">
                                    {editGenre && editGenre.id === g.id ? (
                                        <form onSubmit={handleUpdate} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editGenre.name}
                                                onChange={e => setEditGenre({ ...editGenre, name: e.target.value })}
                                                className="bg-[#2b2b2b] text-white text-sm rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                autoFocus
                                            />
                                            <button type="submit" className="text-green-400 hover:text-green-300 p-1"><FaSave /></button>
                                            <button type="button" onClick={() => setEditGenre(null)} className="text-gray-400 hover:text-white p-1"><FaTimes /></button>
                                        </form>
                                    ) : (
                                        <span className="font-medium">{g.name}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => setEditGenre({ id: g.id, name: g.name })} className="text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-blue-400/10 transition"><FaEdit /></button>
                                        <button onClick={() => handleDelete(g.id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10 transition"><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GenreManagementPage;
