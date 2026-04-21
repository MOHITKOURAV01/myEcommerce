import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatPrice } from '../utils/site_utils';
import { PriceTag, Badge } from './AtomicUI';
import { StarRating } from './InteractiveUI';
import { useAuth, useCart } from '../hooks/index_hooks';

// --- BookDetailModal.jsx ---
export const BookDetailModal = ({ book, isOpen, onClose }) => {
    const { addToCart } = useCart();
    
    if (!book) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-backdrop"
                    style={{ position: 'fixed', inset: 0, background: 'rgba(58,26,8,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, rotateY: -30 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        exit={{ scale: 0.9, opacity: 0, rotateY: 30 }}
                        className="book-modal-content flex"
                        style={{ width: '900px', height: '600px', background: 'transparent', perspective: '2000px', pointerEvents: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Left Page (Cover) */}
                        <div style={{ flex: 1, background: '#3A1A08', borderRadius: '12px 0 0 12px', overflow: 'hidden', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.5)' }}>
                            <img src={book.coverUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }} alt={book.title} />
                        </div>

                        {/* Right Page (Details) */}
                        <div style={{ flex: 1.2, background: '#F5ECD8', borderRadius: '0 12px 12px 0', padding: '50px', position: 'relative', display: 'flex', flexDirection: 'column', backgroundImage: 'repeating-linear-gradient(#F5ECD8, #F5ECD8 28px, #EBE1C7 29px)' }}>
                            <div className="flex-between">
                                <h2 style={{ fontFamily: 'var(--font-display)', color: '#3A1A08', margin: 0, fontSize: '32px', borderBottom: '2px solid #8A3A1A' }}>{book.title}</h2>
                                <FaTimes onClick={onClose} style={{ cursor: 'pointer', color: '#3A1A08', opacity: 0.5 }} size={24} />
                            </div>
                            <p style={{ margin: '10px 0', fontWeight: 900, color: 'var(--terra)', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.2em' }}>Authored by {book.author}</p>
                            
                            <div className="flex" style={{ gap: '12px', alignItems: 'center', margin: '20px 0' }}>
                                <StarRating rating={book.rating} count={book.numReviews} />
                                <Badge variant="hot">Bestseller</Badge>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.8', margin: '20px 0', fontWeight: 500 }}>{book.description}</p>
                            </div>

                            <div className="flex-between" style={{ marginTop: '40px', alignItems: 'center' }}>
                                <PriceTag price={formatPrice(book.price)} active />
                                <button 
                                    className="clay-btn" 
                                    style={{ background: 'var(--forest)', padding: '12px 30px' }} 
                                    onClick={() => { addToCart(book._id); onClose(); }}
                                >
                                    Add to Library
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

import { useGoogleLogin } from '@react-oauth/google';

// ─── Google Button SVG Logo ───────────────────────────────────
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
    </svg>
);

// ─── AuthModal ────────────────────────────────────────────────
export const AuthModal = ({ type = 'login', isOpen, onClose, onSwitch }) => {
    const { login, register, googleLogin, sendOTP, verifyOTP } = useAuth();
    const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
    const [otpStep, setOtpStep] = useState(0); // 0: request, 1: verify
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '+91', otp: '' });
    const [showPass, setShowPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset on type switch
    useEffect(() => {
        setError('');
        setFormData({ name: '', email: '', password: '', phone: '+91', otp: '' });
        setShowPass(false);
        setOtpStep(0);
        setAuthMethod('email');
    }, [type, isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // ── Phone/OTP Logic ──────────────────────────────────────────
    const handleSendOTP = async (e) => {
        e?.preventDefault();
        setError('');
        
        // Extract 10 digits
        const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length < 10) return setError('Enter valid 10-digit number');
        
        const fullPhone = '+91' + cleanPhone;
        setFormData(prev => ({ ...prev, phone: fullPhone }));

        setIsLoading(true);
        try {
            const res = await sendOTP(fullPhone);
            toast.success('OTP sent to ' + fullPhone);
            setOtpStep(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally { setIsLoading(false); }
    };

    const handleVerifyOTP = async (e) => {
        e?.preventDefault();
        setError('');
        if (!formData.otp || formData.otp.length < 6) return setError('Enter 6-digit OTP');

        setIsLoading(true);
        try {
            await verifyOTP(formData.phone, formData.otp);
            toast.success('Welcome to the Library! 🏺');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally { setIsLoading(false); }
    };

    // ── Email/Password Submit ──────────────────────────────────
    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (authMethod === 'phone') {
            return otpStep === 0 ? handleSendOTP() : handleVerifyOTP();
        }
        setError('');

        // Validate
        if (type === 'register' && !formData.name.trim()) {
            return setError('Please enter your full name');
        }
        if (!formData.email.trim()) {
            return setError('Please enter your email address');
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            return setError('Please enter a valid email address');
        }
        if (!formData.password) {
            return setError('Please enter your password');
        }
        if (type === 'register' && formData.password.length < 8) {
            return setError('Password must be at least 8 characters');
        }

        setIsLoading(true);
        try {
            if (type === 'login') {
                await login({ email: formData.email.trim().toLowerCase(), password: formData.password });
                toast.success('Welcome back! 📚', { icon: '🏠' });
            } else {
                await register({ name: formData.name.trim(), email: formData.email.trim().toLowerCase(), password: formData.password });
                toast.success('Account created! Welcome to BookSmart 🎉');
            }
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Something went wrong';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Google OAuth ──────────────────────────────────────────
    const handleGoogleSuccess = async (tokenResponse) => {
        setGoogleLoading(true);
        setError('');
        
        const fetchWithTimeout = async (url, options, timeout = 5000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            try {
                const response = await fetch(url, { ...options, signal: controller.signal });
                clearTimeout(id);
                return response;
            } catch (err) {
                clearTimeout(id);
                throw err;
            }
        };

        try {
            // Fetch user info with timeout
            const userInfoResponse = await fetchWithTimeout('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            
            if (!userInfoResponse.ok) throw new Error('Failed to get user info from Google');
            const userInfo = await userInfoResponse.json();

            // Pass to our backend with timeout
            const response = await fetchWithTimeout(`${import.meta.env.VITE_API_URL}/auth/google-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    googleId: userInfo.sub,
                    email: userInfo.email,
                    name: userInfo.name,
                    avatar: userInfo.picture,
                    emailVerified: userInfo.email_verified,
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Back-end authentication failed');
            }

            const data = await response.json();
            await googleLogin(data);
            
            toast.success(`Welcome, ${data.user?.name?.split(' ')[0] || 'Member'}! 🎉`);
            onClose();
        } catch (err) {
            console.error('Logout/Auth Error:', err);
            setError(err.name === 'AbortError' ? 'Request timed out. Please try again.' : (err.message || 'Google login failed'));
        } finally {
            setGoogleLoading(false);
        }
    };

    const triggerGoogleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: (err) => {
            console.error('Google Auth Popup Error:', err);
            setError('Google login was cancelled or failed.');
            setGoogleLoading(false);
        },
        scope: 'email profile openid',
        flow: 'implicit'
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="auth-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    onClick={onClose}
                >
                    <motion.div
                        key="auth-modal"
                        initial={{ y: 40, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 40, opacity: 0, scale: 0.95 }}
                        style={{ width: '100%', maxWidth: '420px', background: 'var(--interior)', borderRadius: 'var(--radius-xl)', border: '2px solid rgba(200,96,58,0.3)', padding: '40px 36px', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', pointerEvents: 'auto', position: 'relative' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaTimes size={14} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--terra-lt)', marginBottom: '4px' }}>
                                Book<span style={{ color: 'var(--forest-glow)' }}>Smart</span>
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--text-warm)', margin: '12px 0 6px' }}>
                                {type === 'login' ? 'Welcome Back!' : 'Join the Library'}
                            </h2>
                        </div>

                        {/* Method Toggle */}
                        {type === 'login' && (
                            <div className="flex gap-2 p-1 bg-interior-2 rounded-xl mb-6 border border-borderWarm">
                                <button 
                                    onClick={() => setAuthMethod('email')}
                                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${authMethod === 'email' ? 'bg-primary text-white shadow-lg' : 'text-textMuted'}`}
                                >
                                    Email
                                </button>
                                <button 
                                    onClick={() => setAuthMethod('phone')}
                                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${authMethod === 'phone' ? 'bg-primary text-white shadow-lg' : 'text-textMuted'}`}
                                >
                                    Phone / OTP
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => { setGoogleLoading(true); triggerGoogleLogin(); }}
                            disabled={googleLoading || isLoading}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#fff', color: '#3C4043', border: '1px solid #dadce0', borderRadius: '50px', padding: '13px 24px', fontSize: '15px', fontWeight: 700, cursor: googleLoading ? 'wait' : 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginBottom: '20px', opacity: googleLoading ? 0.8 : 1 }}
                        >
                            {googleLoading ? <><div className="loader-spin small" /> Connecting...</> : <><GoogleIcon /> Continue with Google</>}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>or {authMethod === 'email' ? 'email' : 'mobile'}</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(200,96,58,0.1)', border: '1px solid rgba(200,96,58,0.3)', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: 'var(--terra-lt)', fontSize: '13px', fontWeight: 700 }}>
                                ⚠ {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {authMethod === 'email' ? (
                                <>
                                    {type === 'register' && (
                                        <div>
                                            <label className="eyebrow block mb-2">Full Name</label>
                                            <input type="text" className="clay-input w-full" value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="Rahul Sharma" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="eyebrow block mb-2">Email Address</label>
                                        <input type="email" className="clay-input w-full" value={formData.email} onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" />
                                    </div>
                                    <div>
                                        <label className="eyebrow block mb-2">Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type={showPass ? 'text' : 'password'} className="clay-input w-full" value={formData.password} onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
                                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                                                {showPass ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {otpStep === 0 ? (
                                        <div>
                                            <label className="eyebrow block mb-2">Phone Number</label>
                                            <div style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: '85px 1fr', 
                                                gap: '8px', 
                                                alignItems: 'center' 
                                            }}>
                                                <select 
                                                    className="clay-input"
                                                    value={formData.countryCode || '+91'}
                                                    onChange={(e) => setFormData(f => ({ ...f, countryCode: e.target.value }))}
                                                    style={{ 
                                                        background: 'rgba(255,255,255,0.05)', 
                                                        border: '2px solid rgba(255,255,255,0.1)', 
                                                        cursor: 'pointer',
                                                        padding: '12px 4px',
                                                        textAlign: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: 900,
                                                        color: 'var(--mint)'
                                                    }}
                                                >
                                                    <option value="+91">🇮🇳 +91</option>
                                                    <option value="+1">🇺🇸 +1</option>
                                                    <option value="+44">🇬🇧 +44</option>
                                                    <option value="+971">🇦🇪 +971</option>
                                                    <option value="+61">🇦🇺 +61</option>
                                                </select>
                                                <input 
                                                    type="text" 
                                                    className="clay-input" 
                                                    value={formData.phoneDigits || ''} 
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        setFormData(f => ({ ...f, phoneDigits: val, phone: (f.countryCode || '+91') + val }));
                                                    }}
                                                    placeholder="Enter mobile number" 
                                                    style={{ 
                                                        fontSize: '18px', 
                                                        fontWeight: 900, 
                                                        letterSpacing: '1px',
                                                        width: '100%'
                                                    }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-textMuted mt-2 font-bold uppercase tracking-widest">OTP will be sent to your mobile</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="eyebrow block mb-2">Enter 6-digit OTP</label>
                                            <input 
                                                type="text" 
                                                className="clay-input w-full text-center tracking-[1em] font-black text-2xl text-mint" 
                                                value={formData.otp} 
                                                onChange={(e) => setFormData(f => ({ ...f, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))} 
                                                placeholder="000000" 
                                            />
                                            <button type="button" onClick={() => setOtpStep(0)} className="text-[10px] text-terra font-black uppercase mt-4 block hover:underline">← Edit Number</button>
                                        </div>
                                    )}
                                </>
                            )}

                            <button type="submit" className="clay-btn btn-primary btn-lg w-full mt-4" disabled={isLoading}>
                                {isLoading ? 'Processing...' : (authMethod === 'phone' ? (otpStep === 0 ? 'Send OTP' : 'Verify & Sign In') : (type === 'login' ? 'Sign In' : 'Create Account'))}
                            </button>
                        </form>

                        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
                            {type === 'login' ? "New to BookSmart? " : "Already have an account? "}
                            <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--terra-lt)', fontWeight: 900, cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
                                {type === 'login' ? 'Create account' : 'Sign in'}
                            </button>
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Footer.jsx ---
export const Footer = () => {
    return (
        <footer style={{ background: '#2C1810', padding: '80px 0 40px', borderTop: '8px solid #3A1A08', color: 'var(--clay-cream)' }}>
            <div className="container grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '60px' }}>
                <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 20px 0' }}>Book<span style={{ color: 'var(--terra)' }}>Smart</span></h3>
                    <p style={{ opacity: 0.6, fontSize: '14px', lineHeight: '1.8' }}>We curate adventures, curiosities, and worlds for the modern seeker. Our shop is built on the love for physical books and the digital future of reading.</p>
                </div>
                <div>
                    <h4 style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.2em', marginBottom: '20px' }}>Discover</h4>
                    <ul style={{ listStyle: 'none', padding: 0, opacity: 0.6, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li>Featured Books</li>
                        <li>Latest Arrivals</li>
                        <li>Bestsellers</li>
                        <li>Staff Picks</li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.2em', marginBottom: '20px' }}>Company</h4>
                    <ul style={{ listStyle: 'none', padding: 0, opacity: 0.6, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li>About Us</li>
                        <li>Our Mission</li>
                        <li>Contact Support</li>
                        <li>Join the Team</li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.2em', marginBottom: '20px' }}>Newsletter</h4>
                    <p style={{ opacity: 0.6, fontSize: '12px', marginBottom: '15px' }}>Get curated reading paths in your inbox.</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input className="clay-input" style={{ flex: 1, padding: '10px' }} placeholder="Email" />
                        <button className="clay-btn" style={{ background: 'var(--terra)', padding: '10px' }}>Join</button>
                    </div>
                </div>
            </div>
            <div className="container" style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', opacity: 0.4, fontSize: '12px' }}>
                &copy; 2026 BookSmart Cinematic Platforms. Hand-crafted with curiosity.
            </div>
        </footer>
    );
};
