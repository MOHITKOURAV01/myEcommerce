import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaHeart, FaShoppingBag, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth, useCart, useWishlist, useSearch } from '../hooks/index_hooks';
import { formatPrice } from '../utils/site_utils';

export default function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const { itemCount, openDrawer } = useCart();
    const { wishlist } = useWishlist();
    const { query, results, isSearching, handleQueryChange } = useSearch(300);

    const [isScrolled, setIsScrolled] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
                                transition: 'all 0.3s ease'
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
                                        top: '120%',
                                        right: 0,
                                        width: '350px',
                                        background: '#F2E4C8',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-xl)',
                                        overflow: 'hidden',
                                        border: '4px solid #3A1A08'
                                    }}
                                >
                                    {results.books.slice(0, 5).map(book => (
                                        <div 
                                            key={book._id}
                                            onClick={() => { navigate(`/book/${book.slug}`); handleQueryChange(''); }}
                                            className="flex"
                                            style={{ 
                                                padding: '12px', 
                                                gap: '12px', 
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(58,26,8,0.1)'
                                            }}
                                        >
                                            <img src={book.coverUrl} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} alt={book.title} />
                                            <div className="flex-col" style={{ justifyContent: 'center' }}>
                                                <p style={{ fontWeight: 900, color: '#3A1A08', fontSize: '13px', margin: 0 }}>{book.title}</p>
                                                <p style={{ fontSize: '11px', color: 'rgba(58,26,8,0.6)', margin: 0 }}>{book.author}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => { navigate(`/discover?q=${query}`); handleQueryChange(''); }}
                                        style={{ padding: '12px', textAlign: 'center', background: '#3A1A08', color: '#F2E4C8', fontSize: '12px', fontWeight: 900, cursor: 'pointer' }}
                                    >
                                        See all results →
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Wishlist Icon */}
                    <div className="desktop-only" style={{ position: 'relative' }} onClick={() => navigate('/wishlist')}>
                        <FaHeart size={20} style={{ color: 'var(--clay-cream)', cursor: 'pointer', opacity: 0.8 }} />
                        {wishlist.size > 0 && <span className="badge-count">{wishlist.size}</span>}
                    </div>

                    {/* Cart Icon */}
                    <div style={{ position: 'relative' }} onClick={openDrawer}>
                        <FaShoppingBag size={20} style={{ color: 'var(--clay-cream)', cursor: 'pointer', opacity: 0.8 }} />
                        {itemCount > 0 && <span className="badge-count" style={{ background: 'var(--mint)' }}>{itemCount}</span>}
                    </div>

                    {/* User Icon (Desktop) */}
                    <div className="desktop-only" style={{ position: 'relative' }}>
                        <FaUserCircle 
                            size={24} 
                            style={{ color: 'var(--clay-cream)', cursor: 'pointer', opacity: 0.8 }}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        />
                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{
                                        position: 'absolute',
                                        top: '150%',
                                        right: 0,
                                        width: '180px',
                                        background: '#fff',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-xl)',
                                        padding: '12px'
                                    }}
                                >
                                    {isAuthenticated ? (
                                        <>
                                            <p style={{ fontWeight: 900, fontSize: '12px', color: '#3A1A08', margin: '0 0 12px 0' }}>Hi, {user.name.split(' ')[0]}</p>
                                            <div onClick={() => navigate('/profile')} className="dropdown-item">Profile</div>
                                            <div onClick={() => navigate('/orders')} className="dropdown-item">Orders</div>
                                            {isAdmin && <div onClick={() => navigate('/admin')} className="dropdown-item" style={{ color: 'var(--terra)' }}>Admin Panel</div>}
                                            <hr style={{ margin: '12px 0', borderColor: '#eee' }} />
                                            <div onClick={logout} className="dropdown-item" style={{ color: '#CC2244' }}>Logout</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="clay-btn btn-sm" style={{ width: '100%', marginBottom: '10px' }} onClick={() => navigate('/login')}>Login</div>
                                            <p style={{ fontSize: '11px', textAlign: 'center', opacity: 0.6, color: '#333' }}>New? <span style={{ color: 'var(--terra)', cursor: 'pointer' }} onClick={() => navigate('/register')}>Register</span></p>
                                        </>
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
                                position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px',
                                background: '#3A1A08', zIndex: 2001, borderRight: '4px solid #2C1810',
                                padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: '30px'
                            }}
                        >
                            <FaTimes onClick={() => setIsMenuOpen(false)} size={24} style={{ marginLeft: 'auto', color: 'var(--clay-cream)', cursor: 'pointer' }} />
                            
                            <div className="flex-col" style={{ gap: '20px' }}>
                                {navLinks.map(link => (
                                    <NavLink key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--clay-cream)', fontSize: '20px', fontWeight: 900, textDecoration: 'none' }}>
                                        {link.label}
                                    </NavLink>
                                ))}
                                <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                                <NavLink to="/wishlist" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--clay-cream)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaHeart size={18} /> Wishlist
                                </NavLink>
                                <div onClick={logout} style={{ color: 'var(--terra)', fontSize: '18px', fontWeight: 900, cursor: 'pointer', marginTop: 'auto' }}>Logout</div>
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
                .dropdown-item { font-size: 13px; font-weight: 700; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
                .dropdown-item:hover { background: #f8f8f8; }
                
                @media (min-width: 769px) { .mobile-only { display: none; } }
                @media (max-width: 768px) { .desktop-only { display: none; } }
            `}} />
        </nav>
    );
}
