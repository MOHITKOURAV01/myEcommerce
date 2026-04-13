import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaBox, FaTruck, FaHome } from 'react-icons/fa';

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  return (
    <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column', textAlign: 'center', paddingTop: '80px' }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        style={{ marginBottom: '32px' }}
      >
        <FaCheckCircle size={80} color="var(--forest-glow)" />
      </motion.div>

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', color: 'var(--text-warm)', marginBottom: '12px' }}>
          Order Placed!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '8px' }}>
          Your books are being packed with love.
        </p>
        {order?.orderNumber && (
          <p style={{ color: 'var(--forest-glow)', fontWeight: 900, fontSize: '18px', marginBottom: '32px' }}>
            Order #{order.orderNumber}
          </p>
        )}

        {/* Order Summary */}
        {order?.items?.length > 0 && (
          <div style={{ background: 'var(--interior2)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '32px', maxWidth: '500px', border: '1px solid var(--border-warm)', textAlign: 'left', marginLeft: 'auto', marginRight: 'auto' }}>
            <p style={{ fontWeight: 900, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px' }}>Order Summary</p>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid var(--border-warm)' }}>
                <span style={{ color: 'var(--text-warm)', fontWeight: 700 }}>{item.title} × {item.quantity}</span>
                <span style={{ color: 'var(--forest-glow)', fontWeight: 900 }}>₹{item.subtotal}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-warm)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-editorial)', fontSize: '24px', fontWeight: 700, color: 'var(--forest-glow)' }}>
                ₹{order.pricing?.total?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Timeline preview */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700 }}>
          <div style={{ textAlign: 'center' }}>
            <FaCheckCircle size={28} color="var(--forest-glow)" style={{ marginBottom: '8px' }} />
            <p>Order Placed</p>
          </div>
          <div style={{ textAlign: 'center', opacity: 0.4 }}>
            <FaBox size={28} style={{ marginBottom: '8px' }} />
            <p>Processing</p>
          </div>
          <div style={{ textAlign: 'center', opacity: 0.4 }}>
            <FaTruck size={28} style={{ marginBottom: '8px' }} />
            <p>Shipped</p>
          </div>
          <div style={{ textAlign: 'center', opacity: 0.4 }}>
            <FaHome size={28} style={{ marginBottom: '8px' }} />
            <p>Delivered</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="clay-btn btn-primary btn-lg" onClick={() => navigate('/orders')}>
            Track Order
          </button>
          <button className="clay-btn btn-ghost btn-lg" onClick={() => navigate('/discover')}>
            Continue Shopping
          </button>
        </div>
      </motion.div>
    </div>
  );
}
