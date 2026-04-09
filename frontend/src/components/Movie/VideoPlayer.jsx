import React from 'react';

const VideoPlayer = ({ videoUrl }) => {
    if (!videoUrl) {
        return (
            <div className="aspect-video bg-gray-800 flex items-center justify-center rounded-lg shadow-inner">
                <p className="text-gray-400 text-lg">Hệ thống đang cập nhật link phim. Vui lòng quay lại sau!</p>
            </div>
        );
    }

    return (
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-700">
            {/* aspect-video giữ tỷ lệ 16:9 chuẩn điện ảnh */}
            <video 
                controls 
                autoPlay
                className="w-full h-full aspect-video"
                poster="https://placehold.co/1920x1080/111827/ffffff?text=Loading+Player..."
            >
                <source src={videoUrl} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
            </video>
        </div>
    );
};

export default VideoPlayer;