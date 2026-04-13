// --- cartService.js ---
import api from './api';

export const cartService = {
    getCart: async () => {
        const { data } = await api.get('/cart');
        return data;
    },
    addItem: async (bookId, quantity = 1) => {
        const { data } = await api.post('/cart', { bookId, quantity });
        return data;
    },
    updateItem: async (bookId, quantity) => {
        const { data } = await api.put(`/cart/${bookId}`, { quantity });
        return data;
    },
    removeItem: async (bookId) => {
        const { data } = await api.delete(`/cart/${bookId}`);
        return data;
    },
    clearCart: async () => {
        const { data } = await api.delete('/cart');
        return data;
    },
    applyCoupon: async (code) => {
        const { data } = await api.post('/cart/apply-coupon', { code });
        return data;
    },
    removeCoupon: async () => {
        const { data } = await api.delete('/cart/remove-coupon');
        return data;
    }
};

// --- orderService.js ---
export const orderService = {
    getOrders: async (params = {}) => {
        const { data } = await api.get('/orders', { params });
        return data;
    },
    getOrder: async (id) => {
        const { data } = await api.get(`/orders/${id}`);
        return data;
    },
    cancelOrder: async (id, reason) => {
        const { data } = await api.put(`/orders/${id}/cancel`, { reason });
        return data;
    },
    returnOrder: async (id, reason) => {
        const { data } = await api.put(`/orders/${id}/return`, { reason });
        return data;
    },
    trackOrder: async (id) => {
        const { data } = await api.get(`/orders/${id}/track`);
        return data;
    }
};

// --- paymentService.js ---
export const paymentService = {
    createIntent: async (cartId) => {
        const { data } = await api.post('/payment/create-intent', { cartId });
        return data;
    },
    confirmPayment: async (paymentIntentId) => {
        const { data } = await api.post('/payment/confirm', { paymentIntentId });
        return data;
    },
    placeCoD: async (orderData) => {
        const { data } = await api.post('/payment/cod', orderData);
        return data;
    }
};

export default { cartService, orderService, paymentService };
