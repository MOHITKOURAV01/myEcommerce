import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('isAuth'));

    // Timer for auto-refresh
    const setupRefreshTimer = useCallback((expiresIn) => {
        // Refresh 1 minute before expiry (assuming expiresIn is in seconds)
        const delay = (expiresIn - 60) * 1000; 
        if (delay > 0) {
            setTimeout(async () => {
                try {
                    const data = await authService.refreshToken();
                    setupRefreshTimer(data.expiresIn);
                } catch (err) {
                    console.error("Auto-refresh failed", err);
                }
            }, delay);
        }
    }, []);

    const login = async (credentials) => {
        const { user: userData, accessToken, expiresIn } = await authService.login(credentials);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuth', 'true');
        setupRefreshTimer(expiresIn);
    };

    const register = async (userData) => {
        const { user: newUser, accessToken, expiresIn } = await authService.register(userData);
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('isAuth', 'true');
        setupRefreshTimer(expiresIn);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuth');
    };

    const checkAuth = useCallback(async () => {
        try {
            const data = await authService.refreshToken();
            const me = await authService.getMe();
            setUser(me.data);
            setIsAuthenticated(true);
            setupRefreshTimer(data.expiresIn);
        } catch (err) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('isAuth');
        } finally {
            setIsLoading(false);
        }
    }, [setupRefreshTimer]);

    useEffect(() => {
        checkAuth();
        
        // Listen for global logout events (from api interceptors)
        const handleGlobalLogout = () => {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('isAuth');
        };
        window.addEventListener('auth-logout', handleGlobalLogout);
        return () => window.removeEventListener('auth-logout', handleGlobalLogout);
    }, [checkAuth]);

    const value = {
        user,
        isLoading,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refresh: checkAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export default AuthContext;
