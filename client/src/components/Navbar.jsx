import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaHeart, FaShoppingBag, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth, useCart, useWishlist, useSearch } from '../hooks/index_hooks';

export default function Navbar({ onAuthClick }) {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const { itemCount, openDrawer } = useCart();
    const { wishlist } = useWishlist();
    const { query, results, handleQueryChange } = useSearch(300);

    const [isScrolled, setIsScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        window.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navLinks = [
        { label: 'Home', path: '/home' },
        { label: 'Discover', path: '/discover' },
        { label: 'Paths', path: '/paths' },
        { label: 'About', path: '/about' }
    ];

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: isScrolled ? 'rgba(44, 24, 16, 0.98)' : 'var(--interior)',
            borderBottom: '4px solid #3A1A08',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: isScrolled ? '12px 0' : '20px 0',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
            <div className="container flex-between" style={{ alignItems: 'center' }}>
                {/* ─── MOBILE HAMBURGER ─── */}
                <div className="mobile-only" onClick={() => setIsMenuOpen(true)}>
                    <FaBars size={24} style={{ color: 'var(--clay-cream)', cursor: 'pointer' }} />
                </div>

                {/* ─── LOGO ─── */}
                <motion.div 
                    onClick={() => navigate('/home')}
                    whileHover={{ scale: 1.05 }}
                    style={{ 
                        cursor: 'pointer', 
                        fontFamily: 'var(--font-display)', 
                        fontSize: '28px', 
                        color: 'var(--clay-cream)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    Book<span style={{ color: 'var(--terra)' }}>Smart</span>
                </motion.div>

                {/* ─── DESKTOP NAV ─── */}
                <div className="flex desktop-only" style={{ gap: '40px' }}>
                    {navLinks.map(link => (
                        <NavLink 
                            key={link.path} 
                            to={link.path}
                            className={({isActive}) => isActive ? 'active-nav-link' : 'nav-link'}
                            style={({isActive}) => ({
                                color: isActive ? 'var(--mint)' : 'var(--clay-cream)',
                                fontWeight: 700,
                                textDecoration: 'none',
                                fontSize: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                opacity: isActive ? 1 : 0.7,
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            })}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                {/* ─── ACTIONS ─── */}
                <div className="flex" style={{ gap: '20px', alignItems: 'center' }}>
                    {/* Search Bar (Desktop) */}
                    <div className="desktop-only" style={{ position: 'relative' }}>
                        <div className="flex" style={{ 
                            background: 'rgba(0,0,0,0.2)', 
                            padding: '8px 16px', 
                            borderRadius: '30px', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            width: '240px' 
                        }}>
                            <FaSearch style={{ color: 'var(--clay-cream)', opacity: 0.5, marginRight: '10px' }} fontSize="14px" />
                            <input 
                                placeholder="Search curiosity..."
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--clay-cream)',
                                    fontSize: '13px',
                                    outline: 'none',
                                    width: '100%'
                                }}
                            />
                        </div>
                        
                        {/* Live Results Dropdown */}
                        <AnimatePresence>
                            {query.length > 0 && results.books.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    style={{
                                        position: 'absolute',
                                        top: '130%',
                                        right: 0,
                                        width: '400px',
                                        background: '#F2E4C8',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-xl)',
                                        overflow: 'hidden',
                                        border: '4px solid #3A1A08',
                                        zIndex: 1001
                                    }}
                                >
                                    {results.books.slice(0, 5).map(book => (
                                        <div 
                                            key={book._id}
                                            onClick={() => { navigate(`/book/${book.slug}`); handleQueryChange(''); }}
                                            className="flex hover:bg-forest/5 transition-colors"
                                            style={{ 
                                                padding: '12px', 
                                                gap: '12px', 
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(58,26,8,0.1)'
                                            }}
                                        >
                                            <img src={book.coverUrl} style={{ width: '45px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #3A1A08' }} alt={book.title} />
                                            <div className="flex-col" style={{ justifyContent: 'center' }}>
                                                <p style={{ fontWeight: 900, color: '#3A1A08', fontSize: '14px', margin: 0 }}>{book.title}</p>
                                                <p style={{ fontSize: '12px', color: 'rgba(58,26,8,0.6)', margin: 0 }}>by {book.author}</p>
                                                <p style={{ fontSize: '12px', fontWeight: 900, color: 'var(--terra)', margin: '4px 0 0 0' }}>₹{book.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => { navigate(`/discover?q=${query}`); handleQueryChange(''); }}
                                        style={{ padding: '14px', textAlign: 'center', background: '#3A1A08', color: '#F2E4C8', fontSize: '12px', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
                                    >
                                        See all {results.total} results →
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Wishlist Icon */}
                    <div className="desktop-only cursor-pointer group" style={{ position: 'relative' }} onClick={() => navigate('/wishlist')}>
                        <FaHeart size={20} className="group-hover:text-terra transition-colors" style={{ color: 'var(--clay-cream)', opacity: 0.8 }} />
                        {wishlist.size > 0 && <span className="badge-count">{wishlist.size}</span>}
                    </div>

                    {/* Cart Icon */}
                    <div style={{ position: 'relative' }} onClick={openDrawer} className="cursor-pointer group">
                        <FaShoppingBag size={20} className="group-hover:text-mint transition-colors" style={{ color: 'var(--clay-cream)', opacity: 0.8 }} />
                        {itemCount > 0 && <span className="badge-count" style={{ background: 'var(--mint)' }}>{itemCount}</span>}
                    </div>

                    {/* User Icon (Desktop) */}
                    <div className="desktop-only" style={{ position: 'relative' }} ref={userMenuRef}>
                        <div 
                            className="flex items-center gap-2 cursor-pointer p-1 rounded-full border-2 border-transparent hover:border-mint transition-all"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                           {isAuthenticated && user.avatar ? (
                               <img src={user.avatar} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} alt={user.name} />
                           ) : (
                               <FaUserCircle size={28} style={{ color: 'var(--clay-cream)', opacity: 0.8 }} />
                           )}
                        </div>
                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    style={{
                                        position: 'absolute',
                                        top: '150%',
                                        right: 0,
                                        width: '220px',
                                        background: '#fff',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                        padding: '8px',
                                        border: '3px solid #3A1A08',
                                        zIndex: 1002
                                    }}
                                >
                                    {isAuthenticated ? (
                                        <>
                                            <div style={{ padding: '12px', borderBottom: '1px solid #eee', marginBottom: '8px' }}>
                                                <p style={{ fontWeight: 900, fontSize: '14px', color: '#3A1A08', margin: 0 }}>{user.name.split(' ')[0]}</p>
                                                <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.5)', margin: 0 }}>{user.email}</p>
                                            </div>
                                            <div onClick={() => { navigate('/profile'); setShowUserMenu(false); }} className="dropdown-item">My Profile</div>
                                            <div onClick={() => { navigate('/orders'); setShowUserMenu(false); }} className="dropdown-item">Order History</div>
                                            <div onClick={() => { navigate('/wishlist'); setShowUserMenu(false); }} className="dropdown-item">My Wishlist</div>
                                            {isAdmin && <div onClick={() => { navigate('/admin'); setShowUserMenu(false); }} className="dropdown-item" style={{ color: 'var(--terra)' }}>Admin Console</div>}
                                            <div onClick={() => { logout(); setShowUserMenu(false); }} className="dropdown-item" style={{ color: '#CC2244', marginTop: '8px', borderTop: '1px solid #eee' }}>Sign Out</div>
                                        </>
                                    ) : (
                                        <div style={{ padding: '16px' }}>
                                            <button className="clay-btn btn-primary btn-sm w-full mb-4" onClick={() => { onAuthClick('login'); setShowUserMenu(false); }}>Login</button>
                                            <p style={{ fontSize: '11px', textAlign: 'center', fontWeight: 700, color: '#666' }}>
                                                New here? <span style={{ color: 'var(--terra)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { onAuthClick('register'); setShowUserMenu(false); }}>Create Account</span>
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ─── MOBILE DRAWER ─── */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, backdropFilter: 'blur(10px)' }}
                        />
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            style={{
                                position: 'fixed', top: 0, left: 0, bottom: 0, width: '300px',
                                background: '#3A1A08', zIndex: 2001, borderRight: '4px solid #2C1810',
                                padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: '30px'
                            }}
                        >
                            <div className="flex-between">
                                <span className="font-fredoka text-2xl text-cream">Book<span className="text-terra">Smart</span></span>
                                <FaTimes onClick={() => setIsMenuOpen(false)} size={24} style={{ color: 'var(--clay-cream)', cursor: 'pointer' }} />
                            </div>
                            
                            <div className="flex-col" style={{ gap: '16px' }}>
                                {navLinks.map(link => (
                                    <NavLink key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--clay-cream)', fontSize: '20px', fontWeight: 900, textDecoration: 'none' }} className={({isActive}) => isActive ? 'text-mint' : ''}>
                                        {link.label}
                                    </NavLink>
                                ))}
                                <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
                                <NavLink to="/wishlist" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--clay-cream)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaHeart size={18} /> Wishlist
                                </NavLink>
                                <NavLink to="/orders" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--clay-cream)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaShoppingBag size={18} /> Orders
                                </NavLink>
                                
                                {isAuthenticated ? (
                                    <>
                                        <NavLink to="/profile" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--clay-cream)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FaUserCircle size={18} /> Profile
                                        </NavLink>
                                        <div onClick={() => { logout(); setIsMenuOpen(false); }} style={{ color: 'var(--terra)', fontSize: '18px', fontWeight: 900, cursor: 'pointer', marginTop: '20px' }}>Sign Out 👋</div>
                                    </>
                                ) : (
                                    <button className="clay-btn btn-primary mt-6" onClick={() => { onAuthClick('login'); setIsMenuOpen(false); }}>Login / Join</button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .active-nav-link::after {
                    content: ''; display: block; width: 100%; height: 3px; background: var(--mint);
                    position: absolute; bottom: -8px; border-radius: 2px;
                }
                .badge-count {
                    position: absolute; top: -8px; right: -10px; background: var(--terra);
                    color: white; font-size: 9px; font-weight: 900; width: 16px; height: 16px;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    border: 2px solid var(--interior);
                }
                .dropdown-item { font-size: 14px; font-weight: 700; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; color: #333; }
                .dropdown-item:hover { background: #f0f0f0; color: var(--forest); }
                
                @media (min-width: 769px) { .mobile-only { display: none; } }
                @media (max-width: 768px) { .desktop-only { display: none; } }
            `}} />
        </nav>
    );
}
