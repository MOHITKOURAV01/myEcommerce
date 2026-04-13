import api, { setAccessToken } from './api';

const authService = {
    login: async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        setAccessToken(data.accessToken);
        return data;
    },

    register: async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        setAccessToken(data.accessToken);
        return data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
            setAccessToken(null);
        } catch (err) {
            // Already logged out or error; clear token regardless
            setAccessToken(null);
        }
    },

    refreshToken: async () => {
        try {
            const { data } = await api.post('/auth/refresh');
            setAccessToken(data.accessToken);
            return data;
        } catch (err) {
            setAccessToken(null);
            throw err;
        }
    },

    getMe: async () => {
        const { data } = await api.get('/auth/me');
        return data;
    },

    updateMe: async (profileData) => {
        const { data } = await api.put('/auth/me', profileData);
        return data;
    },

    forgotPassword: async (email) => {
        const { data } = await api.post('/auth/forgotpassword', { email });
        return data;
    },

    resetPassword: async (token, password) => {
        const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
        return data;
    },

    googleLogin: async (credential) => {
        // credential = Google ID token from @react-oauth/google
        const { data } = await api.post('/auth/google', { credential });
        setAccessToken(data.accessToken);
        return data;
    },
    
    sendOTP: async (phone) => {
        const { data } = await api.post('/auth/send-otp', { phone });
        return data;
    },

    verifyOTP: async (phone, otp) => {
        const { data } = await api.post('/auth/verify-otp', { phone, otp });
        setAccessToken(data.accessToken);
        return data;
    }
};

export default authService;
