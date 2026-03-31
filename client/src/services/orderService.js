import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },

  getMyOrders: async (page = 1, limit = 10) => {
    const { data } = await api.get(`/orders/my?page=${page}&limit=${limit}`);
    return data;
  },

  getOrderById: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  cancelOrder: async (id, reason) => {
    const { data } = await api.put(`/orders/${id}/cancel`, { reason });
    return data;
  },

  // Admin
  getAllOrders: async (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    const { data } = await api.get(`/orders?${queryStr}`);
    return data;
  },

  updateOrderStatus: async (id, status, note) => {
    const { data } = await api.put(`/orders/${id}/status`, { status, note });
    return data;
  },
};

export default orderService;
