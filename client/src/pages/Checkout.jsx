import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../hooks/index_hooks';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShippingFast, FaCreditCard, FaCheckCircle, FaChevronRight, FaChevronLeft, FaMapMarkerAlt, FaShieldAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { formatPrice } from '../utils/site_utils';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refresh } = useAuth();
  const { items, totals, isOpen, closeDrawer, clearCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Local state for temporary address
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    if (isOpen) closeDrawer();
    if (!authLoading && !user) {
        navigate('/', { state: { openAuth: 'login', from: '/checkout' } });
    }
    if (!authLoading && items.length === 0) {
        navigate('/discover');
    }
    if (user?.addresses?.length > 0 && !selectedAddress) {
        const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
        setSelectedAddress(def);
    }
  }, [items, user, authLoading, navigate, isOpen, closeDrawer, selectedAddress]);

  const handleNextStep = () => {
    if (step === 1 && !selectedAddress && !isAddingNew) {
      return toast.error('Please select a shipping address');
    }
    if (step === 1 && isAddingNew) {
        if (!newAddr.fullName || !newAddr.phone || !newAddr.line1 || !newAddr.city || !newAddr.pincode) {
            return toast.error('Please fill all required address fields');
        }
    }
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);
      
      let finalAddress = selectedAddress;
      if (isAddingNew) {
          // Save address to profile first? Or just send with order?
          // Let's save it to profile for better UX
          const updatedAddresses = [...(user.addresses || []), newAddr];
          await api.put('/auth/me', { addresses: updatedAddresses });
          await refresh();
          finalAddress = newAddr;
      }

      if (paymentMethod === 'cod') {
        const { data } = await api.post('/payment/cod', { shippingAddress: finalAddress });
        toast.success('Order placed successfully! 📦');
        clearCart();
        navigate('/order/success', { state: { order: data.data } });
      } else {
        // Stripe integration would go here
        toast.error('Online payment is temporarily disabled. Please use COD.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || isProcessing) return <LoadingSpinner text={isProcessing ? "Finalizing your collection..." : "Opening the archives..."} />;

  const subtotal = totals?.subtotal || 0;
  const discount = totals?.discount || 0;
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal - discount + shipping + tax;

  const handleLocateMe = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    
    toast.loading('Detecting location...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            setNewAddr(prev => ({ 
                ...prev, 
                city: data.city || data.locality || '', 
                state: data.principalSubdivision || '',
                pincode: data.postcode || prev.pincode
            }));
            toast.success('Location detected! 🛰️', { id: 'geo' });
        } catch (err) {
            toast.error('Failed to parse location', { id: 'geo' });
        }
    }, () => toast.error('Permission denied', { id: 'geo' }));
  };

  const steps = [
    { n: 1, icon: <FaMapMarkerAlt />, label: 'Address' },
    { n: 2, icon: <FaShippingFast />, label: 'Review' },
    { n: 3, icon: <FaCreditCard />, label: 'Payment' }
  ];

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      
      {/* Stepper */}
      <div className="flex-center mb-16 gap-4">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className="flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex-center border-4 transition-all duration-500 ${step >= s.n ? 'border-mint bg-mint text-white' : 'border-borderWarm bg-interior text-textMuted'}`}>
                {step > s.n ? <FaCheckCircle /> : s.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${step >= s.n ? 'text-mint' : 'text-textMuted'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-20 h-1 mb-4 rounded-full ${step > s.n ? 'bg-mint' : 'bg-borderWarm'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-7xl mx-auto">
        
        {/* LEFT SECTION: MAIN INTERACTION (Steps 1, 2, 3) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: ADDRESS */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="mb-10 text-left">
                  <h2 className="sec-title !text-4xl mb-4 text-left">Shipping <em>Destination</em></h2>
                  <p className="text-cream/40 font-bold text-xs uppercase tracking-widest">Where shall we dispatch your curated artifacts?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  {user?.addresses?.map((addr, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.01 }}
                      onClick={() => { setSelectedAddress(addr); setIsAddingNew(false); }}
                      className={`wood-panel p-6 cursor-pointer relative transition-all border-2 group ${selectedAddress === addr && !isAddingNew ? 'border-mint shadow-[0_0_40px_rgba(46,125,50,0.15)] bg-mint/5' : 'border-white/5 hover:border-mint/20'}`}
                    >
                      <div className="flex justify-between items-start mb-5">
                        <span className="bg-mint/10 text-mint px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-mint/20">{addr.label}</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setNewAddr(addr); 
                                    setIsAddingNew(true); 
                                    setSelectedAddress(null);
                                    window.scrollTo({ top: 500, behavior: 'smooth' });
                                }} 
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex-center text-mint hover:bg-mint hover:text-forest hover:border-mint transition-all shadow-lg"
                                title="Edit Address"
                            >
                                <FaEdit className="text-sm" />
                            </button>
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if(window.confirm('Erase this destination from archives?')) {
                                        toast.success('Archive purged! 🗑️');
                                    }
                                }} 
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex-center text-terra hover:bg-terra hover:text-white hover:border-terra transition-all shadow-lg"
                                title="Delete Address"
                            >
                                <FaTrash className="text-sm" />
                            </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div style={{ flex: 1 }}>
                            <p className="font-black text-cream text-lg mb-1">{addr.fullName}</p>
                            <p className="text-xs text-cream/40 leading-relaxed font-bold">
                                {addr.line1}, {addr.city}<br/>
                                {addr.state} - {addr.pincode}
                            </p>
                        </div>
                        {selectedAddress === addr && !isAddingNew && <FaCheckCircle className="text-mint text-2xl drop-shadow-[0_0_10px_rgba(76,175,80,0.5)]" />}
                      </div>
                    </motion.div>
                  ))}

                  <div 
                    onClick={() => { 
                        setIsAddingNew(true); 
                        setSelectedAddress(null); 
                        setNewAddr({ label: '', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
                    }}
                    className={`wood-panel p-8 cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[160px] border-2 border-dashed transition-all ${isAddingNew ? 'border-mint bg-mint/5 shadow-inner' : 'border-white/10 hover:border-mint/40 hover:bg-white/2'}`}
                  >
                    <div className="w-14 h-14 rounded-3xl bg-white/5 flex-center text-3xl font-black text-mint/50 border border-white/5 group-hover:border-mint/20 transition-all">+</div>
                    <span className="font-black text-cream/40 text-[10px] uppercase tracking-[0.3em]">Seal New Sanctuary</span>
                  </div>
                </div>

                {isAddingNew && (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="wood-panel p-10 rounded-[40px] mb-12 border-2 border-mint/20 bg-gradient-to-br from-white/5 to-transparent shadow-2xl">
                    <div className="flex-between mb-10 items-end">
                        <div>
                            <h3 className="font-black text-cream text-2xl mb-2">Sanctuary <em>Registration</em></h3>
                            <p className="text-[10px] font-black text-mint/40 uppercase tracking-widest">Detail the precise coordinates for dispatch</p>
                        </div>
                        <button onClick={()=>setIsAddingNew(false)} className="text-cream/20 hover:text-terra font-black text-[10px] tracking-widest uppercase transition-all">DISCARD</button>
                    </div>

                    <form className="grid grid-cols-2 gap-8">
                        <div className="col-span-2">
                            <button 
                                type="button"
                                onClick={handleLocateMe}
                                className="w-full py-5 rounded-3xl bg-mint/5 border-2 border-mint/20 text-mint font-black text-xs hover:bg-mint hover:text-forest transition-all flex items-center justify-center gap-4 shadow-lg group mb-4"
                            >
                                <FaMapMarkerAlt className="group-hover:animate-bounce" /> DETECT MY REALM (INSTANT FILL)
                            </button>
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                             <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/20 mb-3 block">Designation Label</label>
                             <input type="text" placeholder="e.g. HOME, VAULT, OFFICE" value={newAddr.label} onChange={e=>setNewAddr({...newAddr, label:e.target.value})} className="clay-input w-full !bg-white/2" />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                             <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/20 mb-3 block">Archive Recipient</label>
                             <input type="text" placeholder="Full Legal Name" value={newAddr.fullName} onChange={e=>setNewAddr({...newAddr, fullName:e.target.value})} className="clay-input w-full !bg-white/2" />
                        </div>
                        
                        <div className="col-span-2 lg:col-span-1">
                             <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/20 mb-3 block">Mobile Frequency</label>
                             <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-cream/20 font-black">+91</span>
                                <input type="tel" placeholder="10 Digit Number" value={newAddr.phone} onChange={e=>setNewAddr({...newAddr, phone:e.target.value})} className="clay-input w-full pl-16 !bg-white/2" />
                             </div>
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                             <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/20 mb-3 block">Street Protocol</label>
                             <input type="text" placeholder="Plot / Door / Society" value={newAddr.line1} onChange={e=>setNewAddr({...newAddr, line1:e.target.value})} className="clay-input w-full !bg-white/2" />
                        </div>

                        <div className="col-span-2">
                             <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cream/20 mb-3 block">Regional Artifacts (City / State / Pin)</label>
                             <div className="grid grid-cols-3 gap-6">
                                <input type="text" placeholder="City" value={newAddr.city} onChange={e=>setNewAddr({...newAddr, city:e.target.value})} className="clay-input w-full !bg-white/2" />
                                <input type="text" placeholder="State" value={newAddr.state} onChange={e=>setNewAddr({...newAddr, state:e.target.value})} className="clay-input w-full !bg-white/2" />
                                <input type="text" placeholder="Pincode" maxLength={6} value={newAddr.pincode} onChange={e=>setNewAddr({...newAddr, pincode:e.target.value.replace(/\D/g,'')})} className="clay-input w-full !bg-white/2" />
                             </div>
                        </div>
                    </form>

                    <div className="flex justify-between items-center pt-10 border-t border-white/5 mt-10 gap-6">
                        <button 
                            type="button"
                            onClick={() => navigate('/discover')} 
                            className="h-[52px] px-8 rounded-2xl border-2 border-white/10 text-cream/40 font-black text-xs hover:border-terra hover:text-terra transition-all flex items-center gap-3"
                        >
                            <FaChevronLeft /> RETURN TO LIBRARY
                        </button>
                        <button 
                            type="button"
                            onClick={handleNextStep} 
                            className="clay-btn btn-primary btn-lg flex items-center gap-4 flex-1 justify-center"
                        >
                            Review Items <FaChevronRight />
                        </button>
                    </div>
                  </motion.div>
                )}

                {!isAddingNew && (
                  <div className="flex justify-between items-center pt-10 border-t border-white/5 gap-6">
                    <button 
                        onClick={() => navigate('/discover')} 
                        className="h-[52px] px-8 rounded-2xl border-2 border-white/10 text-cream/40 font-black text-xs hover:border-terra hover:text-terra transition-all flex items-center gap-3"
                    >
                        <FaChevronLeft /> RETURN TO LIBRARY
                    </button>
                    <button onClick={handleNextStep} className="clay-btn btn-primary btn-lg flex items-center gap-4 flex-1 justify-center">
                      Review Items <FaChevronRight />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: REVIEW */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="mb-10 text-left">
                  <h2 className="sec-title !text-4xl mb-4 text-left">Review <em>Collection</em></h2>
                  <p className="text-cream/40 font-bold text-xs uppercase tracking-widest">Verify your artifacts before vaulting them.</p>
                </div>
                
                <div className="flex flex-col gap-6 mb-12">
                   {items.map(item => (
                     <div key={item.book._id} className="wood-panel p-6 flex gap-8 items-center border border-white/5 transition-all hover:border-mint/20">
                        <img src={item.book.coverUrl} className="w-20 rounded shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-white/10" alt={item.book.title} />
                        <div style={{ flex: 1 }}>
                            <h4 className="font-black text-cream text-xl mb-1">{item.book.title}</h4>
                            <p className="text-[10px] font-black text-cream/40 uppercase tracking-[0.2em] italic">Archive Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-3xl text-mint leading-none">{formatPrice(item.book.price * item.quantity)}</p>
                            <p className="text-[9px] font-black text-cream/20 uppercase tracking-[0.2em] mt-2 italic">{formatPrice(item.book.price)} per unit</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="wood-panel p-10 mb-12 border-l-8 border-l-mint bg-mint/5 rounded-[40px]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xs font-black text-mint tracking-[0.4em] uppercase mb-4">ARCHIVE DESTINATION</h3>
                            <p className="font-black text-cream mb-2 text-2xl">{selectedAddress?.fullName || newAddr.fullName}</p>
                            <p className="text-sm text-cream/50 leading-loose font-bold max-w-md">
                                {(selectedAddress || newAddr).line1}, {(selectedAddress || newAddr).city}<br/>
                                {(selectedAddress || newAddr).state} - {(selectedAddress || newAddr).pincode}
                            </p>
                        </div>
                        <button onClick={() => setStep(1)} className="bg-white/5 h-12 px-6 rounded-2xl text-mint font-black text-[10px] tracking-widest uppercase hover:bg-mint hover:text-forest transition-all border border-mint/20">REVISE</button>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-10 border-t border-white/5 gap-6">
                   <button 
                        onClick={() => setStep(1)} 
                        className="h-[52px] px-8 rounded-2xl border-2 border-white/10 text-cream/40 font-black text-xs hover:border-terra hover:text-terra transition-all flex items-center gap-3"
                   >
                       <FaChevronLeft /> REVISE DESTINATION
                   </button>
                   <button onClick={handleNextStep} className="clay-btn btn-primary btn-lg flex items-center gap-4 flex-1 justify-center">
                     Continue to Settlement <FaChevronRight />
                   </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="mb-10 text-left">
                  <h2 className="sec-title !text-4xl mb-4 text-left">Vault <em>Settlement</em></h2>
                  <p className="text-cream/40 font-bold text-xs uppercase tracking-widest">Settle your debt with the archaic treasury.</p>
                </div>
                
                <div className="flex flex-col gap-6 mb-12">
                   <label className={`wood-panel p-10 cursor-pointer flex gap-8 items-center border-2 transition-all rounded-[40px] ${paymentMethod === 'cod' ? 'border-mint bg-mint/5 shadow-[0_20px_50px_rgba(46,125,50,0.1)]' : 'border-white/5 opacity-50'}`}>
                      <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-8 h-8 accent-mint" />
                      <div>
                         <h3 className="font-black text-2xl text-cream flex items-center gap-4 mb-2">
                           Cash on Delivery 🏺
                         </h3>
                         <p className="text-sm text-cream/40 font-bold leading-relaxed">Exchange bullion for knowledge upon safe arrival at your sanctuary.</p>
                      </div>
                   </label>

                   <label className={`wood-panel p-10 cursor-pointer flex gap-8 items-center border-2 transition-all rounded-[40px] ${paymentMethod === 'card' ? 'border-mint bg-mint/5' : 'border-white/5 opacity-50'}`}>
                      <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-8 h-8 accent-mint" />
                      <div>
                         <h3 className="font-black text-2xl text-cream flex items-center gap-4 mb-2">
                           Credit / Debit Card 💳
                         </h3>
                         <p className="text-sm text-cream/40 font-bold leading-relaxed">Securely authorize digital transfer through the archaic encryption layers.</p>
                      </div>
                   </label>
                </div>

                <div className="wood-panel p-8 flex items-center gap-6 bg-white/5 border-2 border-white/5 mb-12 rounded-3xl">
                   <div className="w-16 h-16 rounded-full bg-mint/10 flex-center border-2 border-mint/20 shadow-[0_0_20px_rgba(46,125,50,0.1)]">
                      <FaShieldAlt className="text-mint text-3xl" />
                   </div>
                   <div>
                      <p className="font-black text-cream text-sm tracking-[0.2em] uppercase mb-1">Vault Protection Active</p>
                      <p className="text-[10px] text-cream/30 font-black uppercase tracking-widest mt-0.5">Your transaction is shielded by imperial-grade archaic encryption</p>
                   </div>
                </div>

                <div className="flex justify-between items-center pt-10 border-t border-white/5 gap-6">
                   <button 
                        onClick={() => setStep(2)} 
                        className="h-[52px] px-8 rounded-2xl border-2 border-white/10 text-cream/40 font-black text-xs hover:border-terra hover:text-terra transition-all flex items-center gap-3"
                   >
                       <FaChevronLeft /> RE-REVIEW COLLECTION
                   </button>
                   <button onClick={handlePlaceOrder} className="clay-btn btn-primary btn-lg flex-1 !bg-forest shadow-[0_20px_60px_rgba(46,125,50,0.3)] border-4 border-mint/20">
                     CONFIRM & SECURE {formatPrice(grandTotal)}
                   </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT SECTION: SIDEBAR SUMMARY (Consistently Sticky) */}
        <div className="lg:col-span-4 sticky top-[120px]">
           <div className="wood-panel p-10 rounded-[40px] border-2 border-white/5 bg-white/2">
              <div className="mb-10">
                <h3 className="text-xs font-black text-cream/30 tracking-[0.4em] uppercase mb-10">ORDER SUMMARY</h3>
                
                <div className="flex flex-col gap-6">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-cream/40 uppercase tracking-widest">Archaic Subtotal</span>
                      <span className="text-lg font-black text-cream">{formatPrice(subtotal)}</span>
                   </div>
                   {discount > 0 && (
                     <div className="flex justify-between items-center text-mint bg-mint/5 px-4 py-3 rounded-2xl border border-mint/10">
                        <span className="text-xs font-black uppercase tracking-widest">Eldritch Discount</span>
                        <span className="text-lg font-black">-{formatPrice(discount)}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-cream/40 uppercase tracking-widest">Relic Shipping</span>
                      <span className="text-lg font-black text-cream">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                   </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black text-cream/40 uppercase tracking-widest">Empire Tax (18%)</span>
                       <span className="text-lg font-black text-cream">{formatPrice(tax) || 0}</span>
                    </div>
                </div>
              </div>

              <div className="pt-10 border-t-2 border-white/10 flex flex-col gap-6">
                 <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black text-mint tracking-[0.3em] uppercase mb-4">GRAND TOTAL</p>
                        <p className="font-black text-5xl text-primary leading-none">{formatPrice(grandTotal)}</p>
                    </div>
                 </div>

                 {step < 3 && (
                    <div className="mt-4 p-5 bg-white/5 rounded-3xl border border-white/10 flex items-start gap-4">
                       <FaCheckCircle className="text-mint mt-1 shrink-0" />
                       <p className="text-[9px] font-black text-cream/40 leading-relaxed uppercase tracking-widest">
                         Section {step} of 3 is in progress. Complete your details and confirm to advance.
                       </p>
                    </div>
                 )}
              </div>
           </div>

           {/* Small security seal */}
           <div className="mt-8 px-10 flex items-center justify-center gap-3 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                <FaShieldAlt className="text-mint text-xl" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cream">SECURE ENCRYPTION ACTIVE</span>
           </div>
        </div>

      </div>
    </div>
  );
}
