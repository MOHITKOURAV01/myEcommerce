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
        setAccessToken(accessToken);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuth', 'true');
        localStorage.removeItem('loggedOut');
        setupRefreshTimer(expiresIn);
    };

    const register = async (userData) => {
        const { user: newUser, accessToken, expiresIn } = await authService.register(userData);
        setAccessToken(accessToken);
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('isAuth', 'true');
        localStorage.removeItem('loggedOut');
        setupRefreshTimer(expiresIn);
    };

    const logout = () => {
        // 1. Set Strict Lock Flag
        localStorage.setItem('loggedOut', 'true');
        
        // 2. Wipe everything
        localStorage.removeItem('user');
        localStorage.removeItem('isAuth');
        sessionStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
        setAccessToken(null); 
        
        // 3. Fire server logout (don't wait)
        authService.logout().catch(() => {});
        
        // 4. Force clean state redirect
        window.location.replace('/home'); 
    };

    const checkAuth = useCallback(async () => {
        // If user explicitly logged out, don't try to auto-login
        if (localStorage.getItem('loggedOut') === 'true') {
            setIsLoading(false);
            return;
        }

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

    const googleLogin = async (data) => {
        // data = { success, accessToken, user } from our API response
        // OR data = credential string (Google ID token) — handle both
        
        let userData, accessToken, expiresIn;
        
        if (typeof data === 'string') {
            // It's a Google credential (ID token) — send to backend
            const response = await authService.googleLogin(data);
            userData = response.user;
            accessToken = response.accessToken;
            expiresIn = response.expiresIn;
        } else if (data.data?.user || data.user) {
            // Already processed API response
            userData = data.data?.user || data.user;
            accessToken = data.data?.accessToken || data.accessToken;
            expiresIn = data.data?.expiresIn || data.expiresIn;
            // Set access token in api.js
            setAccessToken(accessToken);
        }
        
        if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuth', 'true');
            localStorage.removeItem('loggedOut');
            if (expiresIn) setupRefreshTimer(expiresIn);
        }
    };

    const sendOTP = async (phone) => {
        return await authService.sendOTP(phone);
    };

    const verifyOTP = async (phone, otp) => {
        const data = await authService.verifyOTP(phone, otp);
        const userData = data.data?.user || data.user;
        const { accessToken, expiresIn } = data.data || data;
        
        setAccessToken(accessToken);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuth', 'true');
        localStorage.removeItem('loggedOut');
        if (expiresIn) setupRefreshTimer(expiresIn);
        return data;
    };

    const value = {
        user,
        isLoading,
        loading: isLoading,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        googleLogin,
        sendOTP,
        verifyOTP,
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
