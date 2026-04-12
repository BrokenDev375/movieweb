import React, { useState } from 'react';
import { FaUserCircle, FaPaperPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { movieApi } from '../../api/movieApi';

const CommentSection = ({ movieId, comments, setComments }) => {
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);

        try {
            const payload = {
                movieId: movieId,
                content: newComment
            };

            await movieApi.postComment(payload);
            
            const commentToDisplay = {
                id: Math.random(),
                content: newComment,
                userId: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            };
            
            setComments([commentToDisplay, ...comments]); 
            setNewComment(''); 

        } catch {
            alert("Lỗi khi gửi bình luận!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // Khung chứa bình luận
        <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none transition-colors duration-300">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 border-l-4 border-red-600 pl-3">
                Bình luận ({comments?.length || 0})
            </h3>

            <div className="flex gap-4 mb-10 items-start">
                <FaUserCircle className="text-gray-400 dark:text-gray-600 text-5xl mt-1 flex-shrink-0" />
                <div className="flex-grow relative">
                    {user ? (
                        <>
                            {/* Ô nhập bình luận */}
                            <textarea 
                                rows="3"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={`Bình luận dưới tên ${user.username}...`}
                                className="w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-200 p-4 pr-16 rounded-xl focus:ring-2 focus:ring-red-600 outline-none resize-none border border-gray-300 dark:border-gray-700 transition"
                            ></textarea>
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition duration-300 disabled:opacity-50 shadow-md shadow-red-600/20"
                            >
                                <FaPaperPlane />
                            </button>
                        </>
                    ) : (
                        // Khung chưa đăng nhập
                        <div className="w-full bg-gray-50 dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center transition-colors">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Bạn cần đăng nhập để gửi bình luận</p>
                            <Link to="/login" className="bg-red-600 px-6 py-2 rounded text-white font-bold hover:bg-red-700 transition shadow-md">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {comments.map((comment, index) => (
                    // Từng item bình luận
                    <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-transparent transition-colors">
                        <FaUserCircle className="text-gray-400 dark:text-gray-500 text-4xl flex-shrink-0" />
                        <div>
                            <div className="flex items-baseline gap-3 mb-1">
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {comment.username || `User ${comment.userId || comment.user_id}`}
                                </h4>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;