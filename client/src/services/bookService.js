import api from './api';

const bookService = {
    getBooks: async (params = {}) => {
        try {
            const { data } = await api.get('/books', { params });
            return data;
        } catch (err) {
            throw err;
        }
    },

    getBookBySlug: async (slug) => {
        try {
            const { data } = await api.get(`/books/${slug}`);
            return data;
        } catch (err) {
            throw err;
        }
    },

    getFeatured: async () => {
        try {
            const { data } = await api.get('/books/featured');
            return data;
        } catch (err) {
            throw err;
        }
    },

    getTrending: async () => {
        try {
            const { data } = await api.get('/books/trending');
            return data;
        } catch (err) {
            throw err;
        }
    },

    search: async (query) => {
        try {
            const { data } = await api.get(`/books/search?q=${query}`);
            return data;
        } catch (err) {
            throw err;
        }
    },

    getSimilar: async (id) => {
        try {
            const { data } = await api.get(`/books/${id}/similar`);
            return data;
        } catch (err) {
            throw err;
        }
    },

    getCategories: async () => {
        try {
            const { data } = await api.get('/categories');
            return data;
        } catch (err) {
            throw err;
        }
    }
};

export default bookService;
