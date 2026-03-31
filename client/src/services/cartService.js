import api from './api';

export const cartService = {
  getCart: async () => {
    const { data } = await api.get('/cart');
    return data;
  },

  addToCart: async (bookId, quantity = 1) => {
    const { data } = await api.post('/cart', { bookId, quantity });
    return data;
  },

  updateQuantity: async (itemId, quantity) => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    return data;
  },

  removeFromCart: async (itemId) => {
    const { data } = await api.delete(`/cart/${itemId}`);
    return data;
  },

  clearCart: async () => {
    const { data } = await api.delete('/cart');
    return data;
  },

  applyCoupon: async (code) => {
    const { data } = await api.post('/cart/coupon', { code });
    return data;
  },

  removeCoupon: async () => {
    const { data } = await api.delete('/cart/coupon');
    return data;
  },
};

export default cartService;
