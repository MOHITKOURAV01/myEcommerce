import React, { useState } from 'react';
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

// --- AuthModals.jsx ---
export const AuthModal = ({ type = 'login', isOpen, onClose, onSwitch }) => {
    const { login, register } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [showPass, setShowPass] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-backdrop flex-center"
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 4000, backdropFilter: 'blur(10px)' }}
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ y: 50, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.95 }}
                        className="flex-col"
                        style={{ width: '400px', background: 'var(--interior)', borderRadius: 'var(--radius-lg)', border: '4px solid #3A1A08', padding: '40px', pointerEvents: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--clay-cream)', textAlign: 'center', marginBottom: '30px' }}>
                            {type === 'login' ? 'Welcome Back' : 'Join Curiosity'}
                        </h2>

                        <div className="flex-col" style={{ gap: '20px' }}>
                            {type === 'register' && (
                                <input className="clay-input" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            )}
                            <input className="clay-input" placeholder="Email Address" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            <div style={{ position: 'relative' }}>
                                <input type={showPass ? 'text' : 'password'} className="clay-input" style={{ width: '100%' }} placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                <div style={{ position: 'absolute', top: '50%', right: '15px', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.5 }} onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>

                            <button className="clay-btn" style={{ background: 'var(--forest)', padding: '14px 0' }}>
                                {type === 'login' ? 'Step Inside' : 'Create Account'}
                            </button>

                            <div className="flex-center" style={{ gap: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                                <span>or continue with</span>
                                <hr style={{ flex: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                            </div>

                            <button className="clay-btn" style={{ width: '100%', background: '#fff', color: '#3A1A08', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                                <FaGoogle /> Google
                            </button>
                        </div>

                        <p style={{ marginTop: '30px', textAlign: 'center', color: '#fff', fontSize: '13px', opacity: 0.6 }}>
                            {type === 'login' ? "Don't have an account? " : "Already part of the library? "}
                            <span style={{ color: 'var(--terra)', cursor: 'pointer', fontWeight: 900 }} onClick={onSwitch}>
                                {type === 'login' ? 'Register' : 'Login'}
                            </span>
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
