import api from './api';

const bookService = {
    getBooks: async (params = {}) => {
        const { data } = await api.get('/books', { params });
        return data;
    },

    getBookBySlug: async (slug) => {
        const { data } = await api.get(`/books/${slug}`);
        return data;
    },

    getFeatured: async () => {
        const { data } = await api.get('/books/featured');
        return data;
    },

    getTrending: async () => {
        const { data } = await api.get('/books/trending');
        return data;
    },

    search: async (params = {}) => {
        const { data } = await api.get('/books/search', { params });
        return data;
    },

    getSimilar: async (id) => {
        const { data } = await api.get(`/books/${id}/similar`);
        return data;
    },

    getCategories: async () => {
        const { data } = await api.get('/categories');
        return data;
    }
};

export default bookService;
