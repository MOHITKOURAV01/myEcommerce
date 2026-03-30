import api, { setAccessToken } from './api';

const authService = {
    login: async (credentials) => {
        try {
            const { data } = await api.post('/auth/login', credentials);
            setAccessToken(data.accessToken);
            return data;
        } catch (err) {
            throw err;
        }
    },

    register: async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            setAccessToken(data.accessToken);
            return data;
        } catch (err) {
            throw err;
        }
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
        try {
            const { data } = await api.get('/auth/me');
            return data;
        } catch (err) {
            throw err;
        }
    },

    updateMe: async (profileData) => {
        try {
            const { data } = await api.put('/auth/me', profileData);
            return data;
        } catch (err) {
            throw err;
        }
    },

    forgotPassword: async (email) => {
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            return data;
        } catch (err) {
            throw err;
        }
    },

    resetPassword: async (token, password) => {
        try {
            const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
            return data;
        } catch (err) {
            throw err;
        }
    }
};

export default authService;
