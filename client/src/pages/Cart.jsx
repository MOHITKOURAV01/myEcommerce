import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useWishlist } from '../hooks/index_hooks';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Cart() {
  const { cart, loading, updateQty, removeFromCart, applyCoupon, removeCoupon } = useCart();
  const { toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  if (loading) return <LoadingSpinner text="Counting your books..." />;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="wood-panel" style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
          <span style={{ fontSize: '80px', marginBottom: '24px', display: 'block' }}>🛒</span>
          <h2 className="sec-title">Your cart is <em>feeling lonely</em></h2>
          <p style={{ color: 'var(--text-med)', marginBottom: '32px' }}>Give it some company by adding some amazing books to your library.</p>
          <button onClick={() => navigate('/discover')} className="clay-btn btn-primary btn-lg">
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <h1 className="sec-title">Your <em>Cart</em></h1>
      
      <div className="flex" style={{ alignItems: 'flex-start' }}>
        
        {/* Left Col: Item List (65%) */}
        <div style={{ flex: '1.8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.items.map(item => (
            <div key={item.book._id} className="clay-card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
               <img 
                  src={item.book.coverUrl} 
                  alt={item.book.title} 
                  className="book-thumb"
                  style={{ width: '100px', borderRadius: '4px', cursor: 'pointer', boxShadow: 'var(--clay-shadow-md)' }} 
                  onClick={() => navigate(`/book/${item.book.slug}`)} 
               />
               
               <div style={{ flex: 1 }}>
                   <h3 style={{ marginBottom: '4px', cursor: 'pointer' }} onClick={() => navigate(`/book/${item.book.slug}`)}>{item.book.title}</h3>
                   <p className="eyebrow" style={{ fontSize: '11px', marginBottom: '16px' }}>by {item.book.author}</p>
                   
                   <div className="flex-between" style={{ justifyContent: 'flex-start', gap: '32px' }}>
                       <span className="price-current">₹{item.price}</span>
                       <div className="flex-center" style={{ background: 'var(--interior)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)', overflow: 'hidden', gap: 0 }}>
                           <button 
                                onClick={() => updateQty(item.book._id, item.quantity - 1)}
                                disabled={item.quantity <= 1} 
                                style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--terra)', fontWeight: 800 }}
                           >-</button>
                           <span style={{ padding: '8px 4px', minWidth: '40px', textAlign: 'center', fontWeight: 800, color: 'var(--clay-cream)' }}>{item.quantity}</span>
                           <button 
                                onClick={() => updateQty(item.book._id, item.quantity + 1)}
                                disabled={item.quantity >= item.book.stock} 
                                style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--forest-glow)', fontWeight: 800 }}
                           >+</button>
                       </div>
                   </div>
               </div>

               <div className="flex-col" style={{ gap: '10px' }}>
                    <button 
                        onClick={() => toggleWishlist(item.book._id)}
                        className="clay-btn btn-ghost btn-sm"
                        style={{ border: 'none' }}
                    >
                        Save to Wishlist
                    </button>
                    <button 
                        onClick={() => removeFromCart(item.book._id)}
                        className="clay-btn btn-secondary btn-sm"
                        style={{ background: 'rgba(200, 96, 58, 0.1)', color: 'var(--terra)', boxShadow: 'none' }}
                    >
                        Remove
                    </button>
               </div>
            </div>
          ))}
        </div>

        {/* Right Col: Order Summary (35%) Sticky */}
        <div style={{ flex: '1', position: 'sticky', top: '100px' }}>
            <div className="wood-panel" style={{ padding: '32px' }}>
                <h2 className="sec-title" style={{ fontSize: '24px', marginBottom: '24px' }}>Summary</h2>
                
                <div className="flex-between" style={{ marginBottom: '12px', opacity: 0.8 }}>
                    <span>Subtotal</span>
                    <span>₹{cart.subtotal}</span>
                </div>

                <div className="flex-between" style={{ marginBottom: '12px', opacity: 0.8 }}>
                    <span>Shipping</span>
                    <span>{cart.shipping > 0 ? `₹${cart.shipping}` : 'FREE'}</span>
                </div>

                {cart.appliedCoupon && (
                    <div className="flex-between" style={{ color: 'var(--mint)', fontWeight: 700, marginBottom: '12px' }}>
                        <div className="flex-center" style={{ gap: '8px' }}>
                            <span>Discount ({cart.appliedCoupon.code})</span>
                            <button onClick={()=>removeCoupon()} style={{ border: 'none', background: 'transparent', color: 'var(--terra)', fontSize: '12px' }}>✕</button>
                        </div>
                        <span>-₹{cart.couponDiscount}</span>
                    </div>
                )}

                <div className="flex-between" style={{ marginBottom: '24px', opacity: 0.8, paddingBottom: '24px', borderBottom: '1px solid var(--border-warm)' }}>
                    <span>GST (18%)</span>
                    <span>₹{cart.tax}</span>
                </div>

                <div className="flex-between" style={{ marginBottom: '32px' }}>
                    <span className="font-fredoka" style={{ fontSize: '20px' }}>Total</span>
                    <span className="price-current" style={{ fontSize: '36px' }}>₹{cart.total}</span>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    {!cart.appliedCoupon ? (
                        <div className="flex" style={{ gap: '8px' }}>
                             <input 
                                 type="text" 
                                 placeholder="COUPON" 
                                 value={couponCode}
                                 onChange={(e)=>setCouponCode(e.target.value.toUpperCase())}
                                 className="clay-input"
                                 style={{ padding: '10px 16px', fontSize: '14px' }}
                             />
                             <button onClick={()=>applyCoupon(couponCode)} className="clay-btn btn-primary btn-sm">Apply</button>
                        </div>
                    ) : (
                        <div className="badge badge-forest" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                            Coupon Applied Successfully!
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => navigate('/checkout')}
                    className="clay-btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                >
                    Proceed to Checkout 🚀
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
