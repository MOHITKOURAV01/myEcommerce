import api from './api';

export const paymentService = {
  createPaymentIntent: async (orderId) => {
    const { data } = await api.post('/payment/create-intent', { orderId });
    return data;
  },

  confirmPayment: async (paymentIntentId, orderId) => {
    const { data } = await api.post('/payment/confirm', { paymentIntentId, orderId });
    return data;
  },
};

export default paymentService;
