import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

export const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.95 }}
            style={{ background: 'var(--interior)', borderRadius: 'var(--radius-xl)', border: '2px solid rgba(200,96,58,0.3)', padding: '40px', maxWidth: '400px', width: '100%', pointerEvents: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-warm)', margin: 0 }}>Reset Password</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><FaTimes /></button>
            </div>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: '40px', marginBottom: '16px' }}>📬</p>
                <h3 style={{ color: 'var(--forest-glow)', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Email Sent!</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>Check your inbox for a password reset link. It expires in 30 minutes.</p>
                <button className="clay-btn btn-primary" style={{ marginTop: '24px', width: '100%' }} onClick={onClose}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>Enter your email address and we'll send you a link to reset your password.</p>
                <input
                  type="email"
                  className="clay-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', marginBottom: '16px' }}
                  autoFocus
                />
                <button type="submit" className="clay-btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
