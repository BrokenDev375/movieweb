import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaChevronLeft, FaChevronRight, FaCrown } from 'react-icons/fa';

const EMPTY_MOVIE = { title: '', releaseDate: '', trailerUrl: '', posterUrl: '', description: '', nation: '', genreIds: [], isPremium: false };

const MovieManagementPage = () => {
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [editMovie, setEditMovie] = useState(null); // null = closed, {} = new, {id:..} = edit
    const [episodeMovie, setEpisodeMovie] = useState(null); // movie to manage episodes

    const fetchMovies = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await adminApi.getMovies(p, 10);
            setMovies(res.content || []);
            setTotalPages(res.totalPages || 1);
            setPage(p);
        } catch { setMovies([]); }
        setLoading(false);
    }, []);

    useEffect(() => { fetchMovies(0); }, [fetchMovies]);
    useEffect(() => { adminApi.getGenres().then(setGenres); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Xoá phim này?')) return;
        await adminApi.deleteMovie(id);
        fetchMovies(page);
    };

    const handleSave = async (movie) => {
        if (movie.id) {
            await adminApi.updateMovie(movie.id, movie);
        } else {
            await adminApi.createMovie(movie);
        }
        setEditMovie(null);
        fetchMovies(page);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Quản lý phim</h1>
                <button onClick={() => setEditMovie({ ...EMPTY_MOVIE })} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
                    <FaPlus /> Thêm phim
                </button>
            </div>

            {/* Movie Table */}
            <div className="bg-[#1e1e1e] rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Poster</th>
                            <th className="px-4 py-3 text-left">Tên phim</th>
                            <th className="px-4 py-3 text-left">Quốc gia</th>
                            <th className="px-4 py-3 text-left">Thể loại</th>
                            <th className="px-4 py-3 text-left">Ngày phát hành</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-500">Đang tải...</td></tr>
                        ) : movies.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-500">Không có phim nào.</td></tr>
                        ) : movies.map(m => (
                            <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                <td className="px-4 py-3 text-gray-400">{m.id}</td>
                                <td className="px-4 py-3">
                                    {m.posterUrl ? <img src={m.posterUrl} alt="" className="w-10 h-14 object-cover rounded" /> : <div className="w-10 h-14 bg-gray-700 rounded" />}
                                </td>
                                <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                                    {m.title}
                                    {m.isPremium && <FaCrown className="inline ml-1.5 text-yellow-400 text-xs" title="Premium" />}
                                </td>
                                <td className="px-4 py-3 text-gray-400">{m.nation || '—'}</td>
                                <td className="px-4 py-3 text-gray-400 text-xs">{(m.genres || []).map(g => g.name).join(', ') || '—'}</td>
                                <td className="px-4 py-3 text-gray-400">{m.releaseDate || '—'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => setEpisodeMovie(m)} className="text-cyan-400 hover:text-cyan-300 text-xs px-2 py-1 rounded bg-cyan-400/10 hover:bg-cyan-400/20 transition" title="Quản lý tập">Tập</button>
                                        <button onClick={() => setEditMovie({ ...m, genreIds: (m.genres || []).map(g => g.id), isPremium: m.isPremium || false })} className="text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-blue-400/10 transition" title="Sửa"><FaEdit /></button>
                                        <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10 transition" title="Xoá"><FaTrash /></button>
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
                    <button onClick={() => fetchMovies(page - 1)} disabled={page === 0} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 transition"><FaChevronLeft /></button>
                    <span className="text-sm text-gray-400">Trang {page + 1} / {totalPages}</span>
                    <button onClick={() => fetchMovies(page + 1)} disabled={page >= totalPages - 1} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 transition"><FaChevronRight /></button>
                </div>
            )}

            {/* Modal: Edit/Create Movie */}
            {editMovie && <MovieFormModal movie={editMovie} genres={genres} onSave={handleSave} onClose={() => setEditMovie(null)} />}

            {/* Modal: Episode management */}
            {episodeMovie && <EpisodeModal movie={episodeMovie} onClose={() => setEpisodeMovie(null)} />}
        </div>
    );
};

/* ─── Movie Form Modal ──────────────────────────────────────────────── */
const MovieFormModal = ({ movie, genres, onSave, onClose }) => {
    const [form, setForm] = useState({ ...movie });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const toggleGenre = (id) => {
        const ids = form.genreIds || [];
        setForm({ ...form, genreIds: ids.includes(id) ? ids.filter(g => g !== id) : [...ids, id] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await onSave(form);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi lưu phim');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#1e1e1e] rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-bold">{movie.id ? 'Sửa phim' : 'Thêm phim mới'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded">{error}</p>}

                    <Field label="Tên phim *" name="title" value={form.title} onChange={handleChange} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Quốc gia" name="nation" value={form.nation || ''} onChange={handleChange} />
                        <Field label="Ngày phát hành" name="releaseDate" type="date" value={form.releaseDate || ''} onChange={handleChange} />
                    </div>
                    <Field label="Poster URL" name="posterUrl" value={form.posterUrl || ''} onChange={handleChange} />
                    <Field label="Trailer URL" name="trailerUrl" value={form.trailerUrl || ''} onChange={handleChange} />
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Mô tả</label>
                        <textarea name="description" value={form.description || ''} onChange={handleChange} rows={3} className="w-full bg-[#2b2b2b] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none" />
                    </div>

                    {/* Genre selection */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-2">Thể loại</label>
                        <div className="flex flex-wrap gap-2">
                            {genres.map(g => (
                                <button key={g.id} type="button" onClick={() => toggleGenre(g.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${(form.genreIds || []).includes(g.id) ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Premium toggle */}
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isPremium || false}
                                onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                                className="w-4 h-4 accent-yellow-500"
                            />
                            <FaCrown className="text-yellow-400" />
                            <span className="text-sm font-medium">Phim Premium</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm transition">Huỷ</button>
                        <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50">
                            <FaSave /> {saving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─── Episode Modal ──────────────────────────────────────────────────── */
const EpisodeModal = ({ movie, onClose }) => {
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newEp, setNewEp] = useState({ episode: '', url: '' });
    const [editEp, setEditEp] = useState(null);

    const fetchEpisodes = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getEpisodes(movie.id);
            setEpisodes(Array.isArray(data) ? data : []);
        } catch { setEpisodes([]); }
        setLoading(false);
    };

    useEffect(() => { fetchEpisodes(); }, [movie.id]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newEp.episode || !newEp.url) return;
        await adminApi.addEpisode(movie.id, { episode: Number(newEp.episode), url: newEp.url });
        setNewEp({ episode: '', url: '' });
        fetchEpisodes();
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        await adminApi.updateEpisode(movie.id, editEp.id, { episode: editEp.episode, url: editEp.url });
        setEditEp(null);
        fetchEpisodes();
    };

    const handleDelete = async (epId) => {
        if (!confirm('Xoá tập này?')) return;
        await adminApi.deleteEpisode(movie.id, epId);
        fetchEpisodes();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#1e1e1e] rounded-xl border border-gray-700 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-bold">Tập phim — {movie.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><FaTimes /></button>
                </div>
                <div className="p-6 space-y-4">
                    {/* Add new */}
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input type="number" placeholder="Tập" value={newEp.episode} onChange={e => setNewEp({ ...newEp, episode: e.target.value })} min="1" required className="w-20 bg-[#2b2b2b] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500" />
                        <input type="text" placeholder="URL video" value={newEp.url} onChange={e => setNewEp({ ...newEp, url: e.target.value })} required className="flex-1 bg-[#2b2b2b] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500" />
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition"><FaPlus /></button>
                    </form>

                    {/* List */}
                    {loading ? <p className="text-gray-500 text-sm">Đang tải...</p> : episodes.length === 0 ? <p className="text-gray-500 text-sm">Chưa có tập nào.</p> : (
                        <ul className="space-y-2">
                            {episodes.sort((a, b) => a.episode - b.episode).map(ep => (
                                <li key={ep.id} className="flex items-center gap-2 bg-[#2b2b2b] rounded-lg px-3 py-2">
                                    {editEp && editEp.id === ep.id ? (
                                        <form onSubmit={handleUpdate} className="flex items-center gap-2 flex-1">
                                            <input type="number" value={editEp.episode} onChange={e => setEditEp({ ...editEp, episode: Number(e.target.value) })} className="w-16 bg-[#1e1e1e] text-white text-sm rounded px-2 py-1" />
                                            <input type="text" value={editEp.url} onChange={e => setEditEp({ ...editEp, url: e.target.value })} className="flex-1 bg-[#1e1e1e] text-white text-sm rounded px-2 py-1" />
                                            <button type="submit" className="text-green-400 hover:text-green-300 text-xs">Lưu</button>
                                            <button type="button" onClick={() => setEditEp(null)} className="text-gray-400 hover:text-white text-xs">Huỷ</button>
                                        </form>
                                    ) : (
                                        <>
                                            <span className="w-10 text-center text-xs font-bold text-gray-400">Tập {ep.episode}</span>
                                            <span className="flex-1 text-sm text-gray-300 truncate">{ep.url}</span>
                                            <button onClick={() => setEditEp({ ...ep })} className="text-blue-400 hover:text-blue-300 p-1"><FaEdit size={12} /></button>
                                            <button onClick={() => handleDelete(ep.id)} className="text-red-400 hover:text-red-300 p-1"><FaTrash size={12} /></button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── Reusable input field ──────────────────────────────────────────── */
const Field = ({ label, name, value, onChange, type = 'text', required }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} required={required}
            className="w-full bg-[#2b2b2b] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500" />
    </div>
);

export default MovieManagementPage;
