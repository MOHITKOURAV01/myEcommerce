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
    const navigate = useNavigate();

    if (view === 'list') {
        return (
            <motion.div
                whileHover={{ x: 10 }}
                className="flex"
                style={{
                    background: 'var(--clay-cream)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    gap: '24px',
                    marginBottom: '20px',
                    border: '1px solid var(--border-warm)',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                }}
            >
                <img onClick={() => navigate(`/book/${book.slug}`)} src={book.coverUrl} style={{ width: '130px', height: '180px', objectFit: 'cover', borderRadius: '8px', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }} alt={book.title} />
                <div className="flex-col" style={{ flex: 1, justifyContent: 'space-between' }}>
                    <div>
                        <div className="flex-between">
                            <h3 onClick={() => navigate(`/book/${book.slug}`)} style={{ fontFamily: 'var(--font-display)', color: 'var(--text-dark)', margin: 0, cursor: 'pointer', fontSize: '24px' }}>{book.title}</h3>
                            <div onClick={() => toggleWishlist(book._id)} style={{ cursor: 'pointer', fontSize: '20px' }}>
                                {isWished ? <FaHeart color="var(--terra)" /> : <FaRegHeart color="var(--text-muted)" />}
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-med)', fontSize: '15px', margin: '4px 0', fontWeight: 700 }}>by {book.author}</p>
                        <StarRating rating={book.rating} count={book.numReviews} size={14} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '14px 0', lineHeight: '1.6', maxWidth: '600px' }}>{book.description?.slice(0, 200)}...</p>
                    </div>
                    <div className="flex-between" style={{ alignItems: 'center' }}>
                        <div className="flex items-center gap-4">
                            <span className="font-fredoka text-3xl text-primary">₹{book.price}</span>
                            {book.originalPrice > book.price && (
                                <span className="text-textMuted line-through text-sm">₹{book.originalPrice}</span>
                            )}
                        </div>
                        <div className="flex" style={{ gap: '12px' }}>
                            <button className="clay-btn btn-ghost" onClick={() => navigate(`/book/${book.slug}`)}>Details</button>
                            <button className="clay-btn btn-primary" onClick={() => addToCart(book._id)}>Add to Cart</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -15, rotate: -2, scale: 1.02 }}
            className="book-card-container"
            style={{
                position: 'relative',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '260px',
                zIndex: 1
            }}
        >
            <div className="book-3d-wrapper" style={{ position: 'relative', perspective: '1200px' }}>
                {/* Book Cover */}
                <img
                    onClick={() => navigate(`/book/${book.slug}`)}
                    src={book.coverUrl}
                    style={{
                        width: '100%',
                        height: '350px',
                        objectFit: 'cover',
                        borderRadius: '4px 10px 10px 4px',
                        boxShadow: '15px 15px 35px rgba(0,0,0,0.4)',
                        zIndex: 2,
                        position: 'relative',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    alt={book.title}
                />

                {/* Spine (Left Depth) */}
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '-18px',
                    width: '18px',
                    height: 'calc(100% - 4px)',
                    background: 'linear-gradient(to right, #1a0f0a, #3A1A08)',
                    transform: 'rotateY(-50deg)',
                    transformOrigin: 'right',
                    zIndex: 1,
                    borderRadius: '4px 0 0 4px',
                    boxShadow: 'inset -5px 0 10px rgba(0,0,0,0.5)'
                }} />

                {/* Page Edges (Right Depth) */}
                <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '2px',
                    width: '12px',
                    height: 'calc(100% - 12px)',
                    background: 'repeating-linear-gradient(90deg, #fdf5e6 0px, #e6d5b8 2px)',
                    transform: 'rotateY(45deg)',
                    transformOrigin: 'left',
                    zIndex: 1,
                    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)'
                }} />

                {/* Quick Actions (Appear on Hover) */}
                <div className="hover-actions" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                    <motion.div
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(book._id);
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: isWished ? 'var(--terra)' : 'white',
                            width: '42px',
                            height: '42px',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                            fontSize: '18px'
                        }}
                    >
                        {isWished ? <FaHeart /> : <FaRegHeart className="opacity-70" />}
                    </motion.div>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: '25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        width: '85%'
                    }}
                >
                    <button
                        className="clay-btn btn-primary"
                        style={{ width: '100%', fontSize: '13px', padding: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', transition: 'none' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(book._id);
                            openDrawer();
                        }}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }} onClick={() => navigate(`/book/${book.slug}`)}>
                <h4 style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--clay-cream)',
                    fontSize: '20px',
                    margin: '0 0 6px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }} dangerouslySetInnerHTML={{ __html: book.title }} />
                <div className="flex-center gap-2 mb-2">
                    <StarRating rating={book.rating} size={11} />
                    <span className="text-[10px] font-bold text-textMed">({book.numReviews})</span>
                </div>
                <div className="flex-center" style={{ gap: '10px' }}>
                    <span className="font-fredoka text-2xl text-primary">₹{book.price}</span>
                    {book.originalPrice > book.price && (
                        <span className="text-textMed line-through text-sm">₹{book.originalPrice}</span>
                    )}
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

    const shipping = totals.subtotal > 1000 || totals.subtotal === 0 ? 0 : 99;

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
                            background: 'rgba(10,9,18,0.85)',
                            zIndex: 2000,
                            backdropFilter: 'blur(12px)'
                        }}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '450px',
                            maxWidth: '90vw',
                            background: 'var(--interior)',
                            zIndex: 2001,
                            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            borderLeft: '4px solid var(--wood)'
                        }}
                    >
                        {/* Header */}
                        <div className="flex-between" style={{
                            padding: '40px 32px 32px 32px',
                            background: 'linear-gradient(to bottom, var(--interior), var(--interior-2))',
                            borderBottom: '4px solid #3A1A08'
                        }}>
                            <div>
                                <h1 className="sec-title" style={{ fontSize: '32px', margin: 0, letterSpacing: '-1px' }}>Your <em>Library</em></h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-mint shadow-[0_0_10px_var(--mint)]"></span>
                                    <p className="eyebrow" style={{ fontSize: '11px', margin: 0 }}>{items.length} ARCHIVAL RELICS</p>
                                </div>
                            </div>
                            <button onClick={closeDrawer} className="w-12 h-12 rounded-xl bg-interior border-4 border-[#3A1A08] flex-center hover:bg-terra transition-all shadow-lg active:scale-90" style={{ fontSize: '24px', color: 'var(--clay-cream)' }}>×</button>
                        </div>

                        {/* Items */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="hide-scrollbar">
                            {items.length === 0 ? (
                                <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{ fontSize: '100px', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
                                    >
                                        📚
                                    </motion.div>
                                    <div>
                                        <p className="font-fredoka text-3xl text-cream mb-2">Shelf is Empty</p>
                                        <p className="text-textMuted text-sm max-w-[200px]">The archives await your selection.</p>
                                    </div>
                                    <button onClick={() => handleNavigate('/discover')} className="clay-btn btn-primary btn-lg mt-4">Browse Catalog</button>
                                </div>
                            ) : (
                                <div className="flex-col" style={{ gap: '20px' }}>
                                    {items.map(item => (
                                        <motion.div
                                            key={item.book._id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="wood-panel p-4 flex gap-6 hover:bg-forest/10 transition-all group border-2 border-white/5 relative items-center"
                                            style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}
                                        >
                                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                                <img
                                                    onClick={() => handleNavigate(`/book/${item.book.slug}`)}
                                                    src={item.book.coverUrl}
                                                    style={{ width: '85px', height: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                                                    alt={item.book.title}
                                                />
                                            </div>
                                            <div className="flex-col" style={{ flex: 1, gap: '4px', overflow: 'hidden' }}>
                                                <div className="pr-8">
                                                    <p onClick={() => handleNavigate(`/book/${item.book.slug}`)} className="truncate font-black text-cream text-[17px] cursor-pointer hover:text-primary transition-colors leading-tight" title={item.book.title}>{item.book.title}</p>
                                                    <p className="text-cream/40 text-[11px] font-bold uppercase tracking-widest">{item.book.author}</p>
                                                </div>

                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-mint font-black text-xl">₹{item.book.price}</span>
                                                    <div className="flex items-center bg-forest/20 rounded-full border border-white/5 p-1">
                                                        <button
                                                            onClick={() => updateQty(item.book._id, item.quantity - 1)}
                                                            className="w-7 h-7 rounded-full flex-center text-terra hover:bg-terra/10 transition-all font-black"
                                                        >－</button>
                                                        <span className="w-8 text-center font-black text-cream text-sm">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQty(item.book._id, Math.min(10, item.quantity + 1))}
                                                            className="w-7 h-7 rounded-full flex-center text-mint hover:bg-mint/10 transition-all font-black"
                                                        >＋</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.book._id)}
                                                className="absolute top-4 right-4 w-10 h-10 rounded-xl flex-center bg-white/5 text-terra/30 hover:text-terra hover:bg-terra/10 transition-all"
                                                title="Erase from library"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Summary */}
                        <div className="bg-interior-2" style={{
                            padding: '32px',
                            borderTop: '5px solid #3A1A08',
                            background: 'linear-gradient(to top, #2C1810, var(--interior))',
                            boxShadow: '0 -20px 40px rgba(0,0,0,0.3)'
                        }}>
                            <div className="flex-col gap-4 mb-8">
                                <div className="flex-between text-sm text-textMed font-bold px-2">
                                    <span>Archival Subtotal</span>
                                    <span>{formatPrice(totals.subtotal)}</span>
                                </div>
                                <div className="flex-between text-sm text-textMuted font-bold px-2">
                                    <span>Logistic Fee</span>
                                    <span style={{ color: shipping === 0 ? 'var(--mint)' : 'inherit' }}>{shipping === 0 ? 'GRATIS' : formatPrice(shipping)}</span>
                                </div>
                                <div className="flex-between text-sm text-textMuted font-bold px-2">
                                    <span>Empire Tax (18%)</span>
                                    <span>{formatPrice(totals.tax)}</span>
                                </div>
                                <div className="flex-between text-2xl font-fredoka text-cream mt-4 pt-6 border-t-2 border-[#3A1A08] px-2">
                                    <span>ESTIMATED TOTAL</span>
                                    <span className="text-primary" style={{ textShadow: '0 0 20px rgba(200,96,58,0.3)' }}>{formatPrice(totals.total)}</span>
                                </div>
                            </div>

                            <div className="flex-col" style={{ gap: '16px' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="clay-btn btn-primary btn-lg"
                                    style={{ width: '100%', height: '65px', fontSize: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
                                    onClick={() => handleNavigate('/checkout')}
                                    disabled={items.length === 0}
                                >
                                    PROCEED TO CHECKOUT 🏺
                                </motion.button>
                                <p style={{ fontSize: '10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>
                                    SECURE ANCIENT ENCRYPTION ENABLED
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
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
