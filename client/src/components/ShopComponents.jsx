import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegHeart, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaTimes } from 'react-icons/fa';
import { useCart, useWishlist } from '../hooks/index_hooks';
import { formatPrice } from '../utils/site_utils';
import { Badge, PriceTag } from './AtomicUI';
import { StarRating } from './InteractiveUI';

// --- BookCard3D.jsx ---
export const BookCard3D = ({ book, view = 'grid', onQuickView }) => {
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isWished = isInWishlist(book._id);

    if (view === 'list') {
        return (
            <motion.div 
                whileHover={{ x: 10 }}
                className="flex"
                style={{
                    background: 'var(--clay-cream)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    gap: '24px',
                    marginBottom: '20px',
                    border: '1px solid var(--border-warm)',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                }}
            >
                <img src={book.coverUrl} style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '4px', boxShadow: 'var(--shadow-md)' }} alt={book.title} />
                <div className="flex-col" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <div>
                        <div className="flex-between">
                            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)', margin: 0 }}>{book.title}</h3>
                            <div onClick={() => toggleWishlist(book._id)} style={{ cursor: 'pointer' }}>
                                {isWished ? <FaHeart color="var(--terra)" /> : <FaRegHeart color="var(--text-muted)" />}
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-med)', fontSize: '14px', margin: '4px 0' }}>by {book.author}</p>
                        <StarRating rating={book.rating} count={book.numReviews} size={12} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '12px 0', lineHeight: '1.6' }}>{book.description?.slice(0, 150)}...</p>
                    </div>
                    <div className="flex-between" style={{ alignItems: 'center' }}>
                        <PriceTag price={formatPrice(book.price)} active />
                        <div className="flex" style={{ gap: '12px' }}>
                            <button className="clay-btn" onClick={() => onQuickView(book)}>Quick View</button>
                            <button className="clay-btn" style={{ background: 'var(--forest)' }} onClick={() => addToCart(book._id)}>Add to Cart</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            whileHover={{ y: -20, rotate: -3, scale: 1.05 }}
            className="book-card-container"
            style={{ 
                position: 'relative', 
                cursor: 'pointer',
                width: '100%',
                maxWidth: '240px',
                zIndex: 1
            }}
        >
            <div className="book-3d-wrapper" style={{ position: 'relative', perspective: '1000px' }}>
                {/* Book Cover */}
                <img 
                    src={book.coverUrl} 
                    style={{ 
                        width: '100%', 
                        height: '320px', 
                        objectFit: 'cover', 
                        borderRadius: '4px 8px 8px 4px',
                        boxShadow: '20px 20px 40px rgba(0,0,0,0.5)',
                        zIndex: 2,
                        position: 'relative'
                    }} 
                    alt={book.title} 
                />
                
                {/* Spine (Left Depth) */}
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '-15px',
                    width: '15px',
                    height: 'calc(100% - 4px)',
                    background: 'rgba(0,0,0,0.8)',
                    transform: 'rotateY(-45deg)',
                    transformOrigin: 'right',
                    zIndex: 1,
                    borderRadius: '4px 0 0 4px'
                }} />

                {/* Page Edges (Right Depth) */}
                <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '2px',
                    width: '10px',
                    height: 'calc(100% - 8px)',
                    background: 'repeating-linear-gradient(90deg, #fff 0px, #eee 2px)',
                    transform: 'rotateY(45deg)',
                    transformOrigin: 'left',
                    zIndex: 1,
                    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)'
                }} />

                {/* Quick Actions (Appear on Hover) */}
                <div className="hover-actions" style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
                    <div className="action-circle" onClick={() => toggleWishlist(book._id)}>
                        {isWished ? <FaHeart color="var(--terra)" /> : <FaRegHeart />}
                    </div>
                </div>

                <motion.div 
                    whileHover={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        width: '80%'
                    }}
                >
                    <button 
                        className="clay-btn" 
                        style={{ width: '100%', background: 'var(--forest)', fontSize: '12px' }}
                        onClick={() => addToCart(book._id)}
                    >
                        Add to Cart
                    </button>
                </motion.div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <h4 style={{ 
                    fontFamily: 'var(--font-display)', 
                    color: '#F2E4C8', 
                    fontSize: '18px', 
                    margin: '0 0 4px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>{book.title}</h4>
                <StarRating rating={book.rating} size={10} />
                <div className="flex-center" style={{ gap: '10px', marginTop: '10px' }}>
                    <PriceTag price={formatPrice(book.price)} />
                </div>
            </div>
        </motion.div>
    );
};

// --- CartDrawer.jsx ---
export const CartDrawer = () => {
    const { items, isOpen, closeDrawer, totals, updateQty, removeFromCart } = useCart();
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        closeDrawer();
        navigate(path);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDrawer}
                        style={{ 
                            position: 'fixed', 
                            inset: 0, 
                            background: 'rgba(0,0,0,0.8)', 
                            zIndex: 2000, 
                            backdropFilter: 'blur(8px)' 
                        }}
                    />
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '400px',
                            background: 'var(--night2)',
                            zIndex: 2001,
                            boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
                            display: 'flex',
                            flexDirection: 'column',
                            borderLeft: '4px solid var(--wood)'
                        }}
                    >
                        {/* Header */}
                        <div className="flex-between" style={{ padding: '32px', borderBottom: '1px solid var(--border-warm)' }}>
                            <h2 className="sec-title" style={{ fontSize: '24px', margin: 0 }}>Your <em>Library</em></h2>
                            <button onClick={closeDrawer} style={{ background: 'none', border: 'none', color: 'var(--clay-cream)', cursor: 'pointer', fontSize: '24px' }}>×</button>
                        </div>

                        {/* Items */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                            {items.length === 0 ? (
                                <div className="flex-center" style={{ height: '60%', flexDirection: 'column', gap: '20px', opacity: 0.3 }}>
                                    <FaShoppingCart size={48} />
                                    <p className="eyebrow">Your shelf is empty</p>
                                </div>
                            ) : (
                                <div className="flex-col" style={{ gap: '24px' }}>
                                    {items.map(item => (
                                        <div key={item.book._id} className="flex" style={{ gap: '16px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <img src={item.book.coverUrl} style={{ width: '64px', height: '84px', objectFit: 'cover', borderRadius: '4px', boxShadow: 'var(--clay-shadow-sm)' }} alt={item.book.title} />
                                            </div>
                                            <div className="flex-col" style={{ flex: 1, justifyContent: 'center' }}>
                                                <p style={{ fontWeight: 800, color: 'var(--clay-cream)', fontSize: '14px', marginBottom: '4px', lineHeight: 1.2 }}>{item.book.title}</p>
                                                <p className="price-current" style={{ fontSize: '16px', marginBottom: '8px' }}>{formatPrice(item.book.price)}</p>
                                                <div className="flex-between" style={{ width: '100%' }}>
                                                     <div className="flex-center" style={{ gap: '10px' }}>
                                                         <button onClick={() => updateQty(item.book._id, item.quantity - 1)} className="clay-qty-btn">-</button>
                                                         <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--clay-cream)' }}>{item.quantity}</span>
                                                         <button onClick={() => updateQty(item.book._id, item.quantity + 1)} className="clay-qty-btn">+</button>
                                                     </div>
                                                     <FaTrash 
                                                         size={14} 
                                                         style={{ color: 'var(--terra)', cursor: 'pointer', opacity: 0.6 }} 
                                                         onClick={() => removeFromCart(item.book._id)}
                                                     />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="wood-panel" style={{ padding: '32px', borderRadius: 0, border: 'none', borderTop: '2px solid var(--border-warm)' }}>
                            <div className="flex-between" style={{ marginBottom: '24px' }}>
                                <span className="eyebrow" style={{ fontSize: '12px' }}>Subtotal Amount</span>
                                <span className="price-current" style={{ fontSize: '24px' }}>{formatPrice(totals.total)}</span>
                            </div>
                            <div className="flex-col" style={{ gap: '12px' }}>
                                <button 
                                    className="clay-btn btn-primary" 
                                    style={{ width: '100%', padding: '14px' }}
                                    onClick={() => handleNavigate('/checkout')}
                                    disabled={items.length === 0}
                                >
                                    Proceed to Checkout 🚀
                                </button>
                                <button 
                                    className="btn-ghost" 
                                    style={{ width: '100%', fontSize: '12px', border: 'none', fontWeight: 800, color: 'var(--text-med)' }} 
                                    onClick={() => handleNavigate('/cart')}
                                >
                                    View Full Cart
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .clay-qty-btn {
                    width: 24px; height: 24px; border: 1px solid var(--border-warm);
                    background: var(--interior); color: var(--clay-cream); font-weight: 800;
                    border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: 0.2s;
                }
                .clay-qty-btn:hover { background: var(--forest); border-color: var(--forest-glow); }
            `}} />
        </AnimatePresence>
    );
};
