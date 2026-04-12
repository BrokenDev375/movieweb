import React, { useRef, useEffect } from 'react';
import { interactApi } from '../../api/interactApi';
import { useAuth } from '../../context/AuthContext';

const VideoPlayer = ({ videoUrl, movieUrlId }) => {
    const videoRef = useRef(null);
    const { user } = useAuth();

    // Hàm gọi API lưu lịch sử
    const handleSaveHistory = async () => {
        // Chỉ lưu nếu đã đăng nhập, có ID tập phim và video đang chạy
        if (!user || !movieUrlId || !videoRef.current) return;
        
        const currentTime = Math.floor(videoRef.current.currentTime);
        
        // Chỉ lưu nếu người dùng đã xem được lớn hơn 0 giây
        if (currentTime > 0) {
            try {
                await interactApi.saveHistory(movieUrlId, currentTime);
                console.log(`Đã lưu lịch sử: ${currentTime} giây cho tập ${movieUrlId}`);
            } catch (error) {
                console.error("Lỗi khi lưu lịch sử:", error);
            }
        }
    };

    // Tự động lưu lịch sử khi component bị hủy (người dùng chuyển sang trang khác)
    useEffect(() => {
        return () => {
            handleSaveHistory();
        };
    }, [movieUrlId, user]);

    if (!videoUrl) {
        return (
            <div className="aspect-video bg-gray-800 flex items-center justify-center rounded-lg shadow-inner">
                <p className="text-gray-400 text-lg">Hệ thống đang cập nhật link phim. Vui lòng quay lại sau!</p>
            </div>
        );
    }

    return (
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-700 w-full h-full">
            <video 
                ref={videoRef}
                controls 
                autoPlay
                className="w-full h-full aspect-video object-contain"
                poster="https://placehold.co/1920x1080/111827/ffffff?text=Loading+Player..."
                onPause={handleSaveHistory} // Kích hoạt lưu khi người dùng bấm tạm dừng
                onEnded={handleSaveHistory}  // Kích hoạt lưu khi video chạy hết
            >
                <source src={videoUrl} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
            </video>
        </div>
    );
};

export default VideoPlayer;