import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

function getStoredUser() {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
            return JSON.parse(storedUser);
        } catch {
            localStorage.removeItem('user');
        }
    }
    return null;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);

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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext);
};