import { useState, useEffect, useCallback } from 'react';
import orderService from '../services/orderService';

export const useOrders = (page = 1) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getMyOrders(page);
      setOrders(data.data || []);
      setPagination({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, pagination, refetch: fetchOrders };
};

export const useOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId);
        setOrder(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  return { order, loading, error };
};

export default useOrders;
