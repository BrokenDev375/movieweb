import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        
      
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
        setUser(userData);
        if (userData.accessToken) {            
            localStorage.setItem('token', userData.accessToken);
        }
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');

        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};