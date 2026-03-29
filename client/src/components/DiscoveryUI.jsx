import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegHeart, FaChevronRight } from 'react-icons/fa';
import { useWishlist } from '../hooks/index_hooks';

// --- Breadcrumb.jsx ---
export const Breadcrumb = ({ items = [] }) => {
    return (
        <nav className="flex" style={{ alignItems: 'center', gap: '12px', padding: '20px 0', fontSize: '14px' }}>
            <Link to="/home" style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Home</Link>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <FaChevronRight size={10} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    {item.path ? (
                        <Link to={item.path} style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{item.label}</Link>
                    ) : (
                        <span style={{ color: 'var(--clay-cream)', fontWeight: 900 }}>{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

// --- WishlistButton.jsx ---
export const WishlistButton = ({ bookId, size = 24 }) => {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isWished = isInWishlist(bookId);

    return (
        <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(bookId);
            }}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={isWished ? 'filled' : 'empty'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                >
                    {isWished ? (
                        <FaHeart size={size} color="var(--terra)" />
                    ) : (
                        <FaRegHeart size={size} color="var(--text-muted)" />
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};
