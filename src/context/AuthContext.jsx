import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        
        // CẬP NHẬT Ở ĐÂY: Kiểm tra an toàn trước khi parse JSON
        // Đảm bảo có dữ liệu VÀ dữ liệu đó không phải là chữ "undefined"
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Dữ liệu trong bộ nhớ bị lỗi, tiến hành dọn dẹp...");
                localStorage.removeItem('user'); // Xóa luôn rác đi
            }
        }
    }, []);

    const login = (userData) => {
        // Chỉ lưu nếu userData thực sự có dữ liệu
        if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};