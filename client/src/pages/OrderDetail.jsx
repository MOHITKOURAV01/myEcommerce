import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data.data);
      } catch (err) {
        toast.error('Failed to load order details');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner text="Locating your order in the archives..." />;
  if (!order) return null;

  const steps = ['placed', 'confirmed', 'shipped', 'delivered'];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div className="flex-between" style={{ marginBottom: '32px' }}>
            <button onClick={() => navigate('/profile')} className="btn-ghost" style={{ border: 'none', fontWeight: 800 }}>← Back to Orders</button>
            <p className="eyebrow">{order.orderNumber}</p>
        </div>

        <h1 className="sec-title" style={{ marginBottom: '40px' }}>Order <em>Timeline</em></h1>

        {/* Status Stepper */}
        <div className="wood-panel" style={{ padding: '40px', marginBottom: '48px', display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
             <div style={{ position: 'absolute', top: '50%', left: '10%', width: '80%', height: '2px', background: 'var(--border-warm)', zIndex: 1, transform: 'translateY(-50%)' }}></div>
             <div style={{ 
                position: 'absolute', top: '50%', left: '10%', height: '2px', background: 'var(--forest-glow)', zIndex: 1, 
                width: `${(currentStepIndex / (steps.length - 1)) * 80}%`, transform: 'translateY(-50%)', transition: 'width 0.5s ease'
             }}></div>

             {steps.map((step, idx) => {
                 const isCompleted = idx <= currentStepIndex;
                 const isActive = idx === currentStepIndex;
                 return (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                        <div style={{ 
                            width: '24px', height: '24px', borderRadius: '50%', 
                            background: isCompleted ? 'var(--forest-glow)' : 'var(--night)',
                            border: `4px solid ${isCompleted ? 'var(--forest)' : 'var(--interior-3)'}`,
                            boxShadow: isActive ? '0 0 15px var(--forest-glow)' : 'none'
                        }}></div>
                        <span style={{ 
                            marginTop: '12px', fontSize: '12px', fontWeight: 800, 
                            color: isCompleted ? 'var(--text-warm)' : 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '1px'
                        }}>{step}</span>
                    </div>
                 );
             })}
        </div>

        <div className="flex" style={{ gap: '32px', alignItems: 'flex-start' }}>
            
            {/* Left: Details */}
            <div style={{ flex: 1.5 }}>
                <div className="clay-card" style={{ marginBottom: '32px' }}>
                    <h3 className="eyebrow" style={{ marginBottom: '20px' }}>Books in this Shipment</h3>
                    <div className="flex-col" style={{ gap: '20px' }}>
                        {order.items.map(item => (
                            <div key={item._id} className="flex-center" style={{ justifyContent: 'flex-start', gap: '20px' }}>
                                <img src={item.coverUrl} alt={item.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px', boxShadow: 'var(--clay-shadow-sm)' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '18px', color: 'var(--clay-cream)' }}>{item.title}</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--text-med)' }}>Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                                <span className="price-current" style={{ fontSize: '20px' }}>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex" style={{ gap: '24px' }}>
                    <div className="wood-panel" style={{ flex: 1, padding: '24px' }}>
                        <h3 className="eyebrow" style={{ marginBottom: '12px' }}>Shipping Address</h3>
                        <p style={{ fontWeight: 800, color: 'var(--clay-cream)' }}>{order.shippingAddress.fullName}</p>
                        <p style={{ fontSize: '14px', color: 'var(--text-med)', lineHeight: 1.6 }}>
                            {order.shippingAddress.line1}<br/>
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                    </div>
                    <div className="wood-panel" style={{ flex: 1, padding: '24px' }}>
                        <h3 className="eyebrow" style={{ marginBottom: '12px' }}>Payment Info</h3>
                        <p style={{ fontWeight: 800, color: 'var(--clay-cream)', textTransform: 'uppercase' }}>{order.payment.method}</p>
                        <p style={{ fontSize: '14px', color: 'var(--text-med)' }}>Status: <span style={{ color: order.payment.status === 'paid' ? 'var(--mint)' : 'var(--terra)' }}>{order.payment.status}</span></p>
                        {order.payment.paidAt && <p style={{ fontSize: '12px', opacity: 0.6 }}>On {new Date(order.payment.paidAt).toLocaleDateString()}</p>}
                    </div>
                </div>
            </div>

            {/* Right: Summary */}
            <div style={{ flex: 1 }}>
                <div className="wood-panel" style={{ padding: '32px' }}>
                    <h3 className="sec-title" style={{ fontSize: '20px', marginBottom: '24px' }}>Pricing Details</h3>
                    <div className="flex-col" style={{ gap: '12px', fontSize: '14px', marginBottom: '24px', opacity: 0.8 }}>
                        <div className="flex-between"><span>Items Subtotal</span><span>₹{order.pricing.itemsPrice}</span></div>
                        <div className="flex-between"><span>Standard Shipping</span><span>₹{order.pricing.shippingPrice}</span></div>
                        <div className="flex-between"><span>Tax (GST)</span><span>₹{order.pricing.taxPrice}</span></div>
                        {order.pricing.discountPrice > 0 && (
                            <div className="flex-between" style={{ color: 'var(--mint)' }}><span>Discount</span><span>-₹{order.pricing.discountPrice}</span></div>
                        )}
                    </div>
                    <div className="flex-between" style={{ paddingTop: '24px', borderTop: '2px solid var(--border-warm)' }}>
                        <span style={{ fontWeight: 800, fontSize: '18px' }}>Total Amount</span>
                        <span className="price-current" style={{ fontSize: '28px' }}>₹{order.pricing.total}</span>
                    </div>
                </div>
                
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                     <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Need help with this order? <br/> <a href="mailto:support@booksmart.com" style={{ color: 'var(--forest-glow)', fontWeight: 800 }}>Contact Librarian</a></p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
