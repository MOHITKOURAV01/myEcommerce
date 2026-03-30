import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../hooks/index_hooks';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading } = useCart();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // New Address Form
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });

  useEffect(() => {
     if (!loading && (!cart || cart.items.length === 0)) {
         navigate('/cart');
     }
     
     // Fetch user addresses (assuming profile endpoint or mock for now)
     const fetchProfile = async () => {
         try {
             // Let's assume user.addresses or we need to add address feature. For now empty and user MUST enter one or select saved.
             // We can mock some for smooth navigation if data structure allows.
             if (user?.addresses) {
                 setAddresses(user.addresses);
                 if (user.addresses.length > 0) setSelectedAddress(user.addresses[0]);
             }
         } catch(err) {
             console.error(err);
         }
     }
     if (user) fetchProfile();
  }, [loading, cart, user, navigate]);

  const handleNextStep = () => {
      if (step === 1) {
          if (!selectedAddress && !showNewAddress) {
              return toast.error('Please select or add an address');
          }
          if (showNewAddress) {
              if(!newAddr.fullName || !newAddr.phone || !newAddr.line1 || !newAddr.city || !newAddr.state || !newAddr.pincode) {
                  return toast.error('Please fill all required address fields');
              }
              // Ideally save it to DB, but for now we set it as selected
              setSelectedAddress(newAddr);
          }
          setStep(2);
      } else if (step === 2) {
          setStep(3);
      }
  };

  const handlePlaceOrder = async () => {
      try {
          // If COD
          if (paymentMethod === 'cod') {
              const res = await api.post('/api/payment/cod', { shippingAddress: selectedAddress });
              toast.success('Order placed successfully!');
              navigate(`/profile`); // Or an order success page
          } else if (paymentMethod === 'stripe') {
              // Usually we show Stripe Elements on Step 2. If placed here, we confirm intent.
              // For simplicity of this structure, we mock Stripe intent if elements are not mounted, 
              // but actual Stripe requires <Elements> provider. 
              toast.success('Proceeding to Stripe Gateway...');
              // A real integration would wrap this page in an Elements provider and confirm CardSetup.
              // We'll simulate a mock gateway redirect or cod fallback.
              navigate('/profile');
          }
      } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Failed to place order');
      }
  };

  if (!cart) return null;

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
       <div style={{ maxWidth: '900px', margin: '0 auto' }}>
           
           {/* Stepper Header */}
           <div className="flex-between" style={{ marginBottom: '60px', position: 'relative', width: '80%', margin: '0 auto 60px auto' }}>
               <div style={{ position: 'absolute', top: '24px', left: 0, width: '100%', height: '4px', background: 'var(--interior-3)', zIndex: 1 }}></div>
               <div style={{ 
                   position: 'absolute', top: '24px', left: 0, height: '4px', background: 'var(--forest-glow)', zIndex: 1, 
                   width: `${(step-1)*50}%`, transition: 'width 0.4s ease' 
               }}></div>
               
               {[1, 2, 3].map(s => (
                   <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                       <div style={{ 
                           width: '48px', height: '48px', borderRadius: '50%', background: 'var(--night)', 
                           border: `4px solid ${step >= s ? 'var(--forest-glow)' : 'var(--interior-3)'}`,
                           display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800',
                           color: step >= s ? 'var(--forest-glow)' : 'var(--text-muted)'
                       }}>
                           {step > s ? '✓' : s}
                       </div>
                       <span className="eyebrow" style={{ marginTop: '12px', fontSize: '10px', color: step >= s ? 'var(--forest-glow)' : 'var(--text-muted)' }}>
                           {s === 1 ? 'Shipping' : s === 2 ? 'Payment' : 'Review'}
                       </span>
                   </div>
               ))}
           </div>

           <div className="flex" style={{ alignItems: 'flex-start' }}>
               
               {/* Main Form Area */}
               <div style={{ flex: '1.8' }} className="clay-card">
                   
                   {/* STEP 1: ADDRESS */}
                   {step === 1 && (
                       <div>
                           <h2 className="sec-title" style={{ fontSize: '28px', marginBottom: '32px' }}>Shipping <em>Address</em></h2>
                           
                           {addresses.length > 0 && (
                               <div style={{ marginBottom: '40px' }}>
                                   <label className="clay-label">Saved Addresses</label>
                                   <div className="flex-col" style={{ gap: '16px' }}>
                                       {addresses.map((addr, i) => (
                                           <label key={i} className="wood-panel" style={{ 
                                               display: 'flex', gap: '16px', padding: '16px', cursor: 'pointer',
                                               borderColor: selectedAddress === addr && !showNewAddress ? 'var(--forest-glow)' : 'var(--wood)'
                                           }}>
                                               <input 
                                                  type="radio" 
                                                  name="address" 
                                                  style={{ marginTop: '4px' }}
                                                  checked={selectedAddress === addr && !showNewAddress} 
                                                  onChange={() => { setSelectedAddress(addr); setShowNewAddress(false); }} 
                                               />
                                               <div style={{ flex: 1 }}>
                                                   <p style={{ fontWeight: 800, color: 'var(--clay-cream)' }}>{addr.fullName} <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '8px' }}>{addr.phone}</span></p>
                                                   <p style={{ fontSize: '14px', opacity: 0.8 }}>{addr.line1}, {addr.line2}</p>
                                                   <p style={{ fontSize: '14px', opacity: 0.8 }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                                               </div>
                                           </label>
                                       ))}
                                   </div>
                               </div>
                           )}

                           <div style={{ marginBottom: '24px' }}>
                               <label className="flex-center" style={{ justifyContent: 'flex-start', cursor: 'pointer' }}>
                                   <input type="radio" name="address" checked={showNewAddress || addresses.length === 0} onChange={() => setShowNewAddress(true)} />
                                   <span className="font-bold" style={{ color: 'var(--forest-glow)' }}>Add New Address</span>
                               </label>
                           </div>

                           {(showNewAddress || addresses.length === 0) && (
                               <div className="flex-col" style={{ gap: '20px', padding: '24px', background: 'var(--interior)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
                                   <div className="flex" style={{ gap: '20px' }}>
                                      <input type="text" placeholder="Full Name" className="clay-input" value={newAddr.fullName} onChange={e=>setNewAddr({...newAddr, fullName: e.target.value})} />
                                      <input type="text" placeholder="Phone" className="clay-input" value={newAddr.phone} onChange={e=>setNewAddr({...newAddr, phone: e.target.value})} />
                                   </div>
                                   <input type="text" placeholder="Address Line 1" className="clay-input" value={newAddr.line1} onChange={e=>setNewAddr({...newAddr, line1: e.target.value})} />
                                   <input type="text" placeholder="Address Line 2 (Optional)" className="clay-input" value={newAddr.line2} onChange={e=>setNewAddr({...newAddr, line2: e.target.value})} />
                                   <div className="flex" style={{ gap: '20px' }}>
                                      <input type="text" placeholder="City" className="clay-input" value={newAddr.city} onChange={e=>setNewAddr({...newAddr, city: e.target.value})} />
                                      <input type="text" placeholder="State" className="clay-input" value={newAddr.state} onChange={e=>setNewAddr({...newAddr, state: e.target.value})} />
                                      <input type="text" placeholder="Pincode" className="clay-input" value={newAddr.pincode} onChange={e=>setNewAddr({...newAddr, pincode: e.target.value})} />
                                   </div>
                               </div>
                           )}
                       </div>
                   )}

                   {/* STEP 2: PAYMENT */}
                   {step === 2 && (
                       <div>
                           <h2 className="sec-title" style={{ fontSize: '28px', marginBottom: '32px' }}>Payment <em>Method</em></h2>
                           <div className="flex-col" style={{ gap: '20px' }}>
                               <label className="wood-panel" style={{ 
                                   display: 'flex', gap: '20px', padding: '24px', cursor: 'pointer',
                                   borderColor: paymentMethod === 'stripe' ? 'var(--forest-glow)' : 'var(--wood)'
                               }}>
                                   <input type="radio" name="payment" value="stripe" style={{ width: '20px', height: '20px' }} checked={paymentMethod === 'stripe'} onChange={(e)=>setPaymentMethod(e.target.value)} />
                                   <div>
                                       <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Credit / Debit Card (Stripe)</h3>
                                       <p style={{ fontSize: '14px', opacity: 0.7 }}>Secure online payment via card.</p>
                                   </div>
                               </label>

                               {cart.total < 5000 && (
                                   <label className="wood-panel" style={{ 
                                       display: 'flex', gap: '20px', padding: '24px', cursor: 'pointer',
                                       borderColor: paymentMethod === 'cod' ? 'var(--forest-glow)' : 'var(--wood)'
                                   }}>
                                       <input type="radio" name="payment" value="cod" style={{ width: '20px', height: '20px' }} checked={paymentMethod === 'cod'} onChange={(e)=>setPaymentMethod(e.target.value)} />
                                       <div>
                                           <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Cash on Delivery (COD)</h3>
                                           <p style={{ fontSize: '14px', opacity: 0.7 }}>Pay when the parcel arrives shelf-side.</p>
                                       </div>
                                   </label>
                               )}
                               {cart.total >= 5000 && (
                                   <div className="badge badge-terra" style={{ padding: '16px', borderRadius: '8px' }}>
                                       COD is only available for orders below ₹5000.
                                   </div>
                               )}
                           </div>
                       </div>
                   )}

                   {/* STEP 3: REVIEW */}
                   {step === 3 && (
                       <div>
                           <h2 className="sec-title" style={{ fontSize: '28px', marginBottom: '32px' }}>Final <em>Review</em></h2>
                           
                           <div className="wood-panel" style={{ marginBottom: '24px', borderColor: 'var(--border-warm)' }}>
                               <h3 className="eyebrow" style={{ marginBottom: '12px' }}>Shipping To</h3>
                               <p style={{ fontWeight: 800 }}>{selectedAddress.fullName} • {selectedAddress.phone}</p>
                               <p style={{ opacity: 0.8 }}>{selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                           </div>

                           <div className="wood-panel" style={{ marginBottom: '32px', borderColor: 'var(--border-warm)' }}>
                               <h3 className="eyebrow" style={{ marginBottom: '12px' }}>Payment Mode</h3>
                               <p style={{ fontWeight: 800 }}>{paymentMethod === 'stripe' ? 'Online Card Payment' : 'Cash on Delivery'}</p>
                           </div>

                           <div>
                               <h3 className="eyebrow" style={{ marginBottom: '20px' }}>Items Brief</h3>
                               <div className="flex-col" style={{ gap: '12px' }}>
                                   {cart.items.map(item => (
                                       <div key={item.book._id} className="flex-between" style={{ borderBottom: '1px solid var(--border-warm)', paddingBottom: '12px' }}>
                                           <div className="flex-center" style={{ gap: '16px' }}>
                                               <img src={item.book.coverUrl} alt={item.book.title} style={{ width: '40px', borderRadius: '4px' }} />
                                               <div>
                                                   <p style={{ fontWeight: 700, fontSize: '14px' }}>{item.book.title}</p>
                                                   <p style={{ fontSize: '12px', opacity: 0.6 }}>Qty: {item.quantity}</p>
                                               </div>
                                           </div>
                                           <span className="price-current" style={{ fontSize: '18px' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       </div>
                   )}

                   {/* Actions */}
                   <div className="flex-between" style={{ marginTop: '40px', paddingTop: '32px', borderTop: '2px solid var(--border-warm)' }}>
                       {step > 1 ? (
                           <button onClick={()=>setStep(s=>s-1)} className="btn-ghost" style={{ border: 'none', fontWeight: 800 }}>← Back</button>
                       ) : <div />}
                       
                       {step < 3 ? (
                           <button onClick={handleNextStep} className="clay-btn btn-primary">Continue →</button>
                       ) : (
                           <button onClick={handlePlaceOrder} className="clay-btn btn-gold" style={{ padding: '14px 40px' }}>Place Order 🚀</button>
                       )}
                   </div>
               </div>

               {/* Summary Widget */}
               <div style={{ flex: '1' }}>
                    <div className="wood-panel" style={{ padding: '32px', position: 'sticky', top: '100px' }}>
                        <h2 className="sec-title" style={{ fontSize: '20px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-warm)' }}>Order Summary</h2>
                        
                        <div className="flex-col" style={{ gap: '12px', marginBottom: '24px', opacity: 0.8, fontSize: '14px' }}>
                            <div className="flex-between"><span>Items</span><span>₹{cart.subtotal}</span></div>
                            <div className="flex-between"><span>Shipping</span><span>{cart.shipping > 0 ? `₹${cart.shipping}` : 'FREE'}</span></div>
                            {cart.appliedCoupon && (
                                <div className="flex-between" style={{ color: 'var(--mint)' }}><span>Discount</span><span>-₹{cart.couponDiscount}</span></div>
                            )}
                            <div className="flex-between"><span>GST (18%)</span><span>₹{cart.tax}</span></div>
                        </div>

                        <div className="flex-between" style={{ paddingTop: '24px', borderTop: '2px solid var(--border-warm)' }}>
                            <span style={{ fontWeight: 800 }}>Total</span>
                            <span className="price-current">₹{cart.total}</span>
                        </div>
                    </div>
               </div>
           </div>

       </div>
    </div>
  );
}
