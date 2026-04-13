import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBox, FaTruck, FaCheckCircle, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => (
  <span className={`status-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
);

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders?page=${page}&limit=10`);
      setOrders(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`, { cancelReason: 'Cancelled by customer' });
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '60vh' }}>
      <div className="loading-spinner" />
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="eyebrow">Purchase History</div>
      <h1 className="sec-title">My <em>Orders</em></h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: 'var(--interior2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-warm)' }}>
          <FaBox size={60} color="var(--text-muted)" style={{ marginBottom: '24px', opacity: 0.4 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-warm)', marginBottom: '12px' }}>No orders yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Start shopping to see your orders here.</p>
          <button className="clay-btn btn-primary btn-lg" onClick={() => navigate('/discover')}>
            Browse Books
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ background: 'var(--interior2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-warm)', padding: '24px', cursor: 'pointer' }}
              onClick={() => navigate(`/order/${order._id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-warm)', margin: '0 0 4px 0' }}>
                    {order.orderNumber}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <StatusBadge status={order.status} />
                  <span style={{ fontFamily: 'var(--font-editorial)', fontSize: '20px', fontWeight: 700, color: 'var(--forest-glow)' }}>
                    ₹{order.pricing?.total?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Items preview */}
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
                {order.items.slice(0, 4).map((item, j) => (
                  <div key={j} style={{ flexShrink: 0 }}>
                    <img
                      src={item.coverUrl || item.book?.coverUrl}
                      alt={item.title}
                      style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px', boxShadow: 'var(--shadow-md)' }}
                      onError={(e) => { e.target.src = `https://placehold.co/50x70/2C1F0E/F2E4C8?text=Book`; }}
                    />
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div style={{ flexShrink: 0, width: '50px', height: '70px', borderRadius: '4px', background: 'var(--interior3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 900 }}>
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              {/* Cancel button */}
              {['placed', 'confirmed'].includes(order.status) && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-warm)', display: 'flex', gap: '12px' }}>
                  <button
                    className="clay-btn btn-sm"
                    style={{ background: 'rgba(200,96,58,0.1)', color: 'var(--terra-lt)', boxShadow: 'none', border: '1px solid var(--terra)' }}
                    onClick={(e) => { e.stopPropagation(); handleCancel(order._id); }}
                  >
                    <FaTimes size={12} /> Cancel Order
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, alignSelf: 'center' }}>
                    Payment: {order.payment?.method?.toUpperCase()} · {order.payment?.status}
                  </span>
                </div>
              )}
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
              <button className="clay-btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>
                ← Prev
              </button>
              <span style={{ padding: '8px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>
                Page {page} of {totalPages}
              </span>
              <button className="clay-btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
