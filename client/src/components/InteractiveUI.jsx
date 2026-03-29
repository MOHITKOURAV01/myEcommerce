import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

// --- StarRating.jsx ---
export const StarRating = ({ rating, count, size = 16, interactive = false, onRate }) => {
    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} size={size} color="var(--amber)" onClick={() => interactive && onRate(i)} style={{ cursor: interactive ? 'pointer' : 'default' }} />);
            } else if (i === fullStars + 1 && hasHalf) {
                stars.push(<FaStarHalfAlt key={i} size={size} color="var(--amber)" onClick={() => interactive && onRate(i)} style={{ cursor: interactive ? 'pointer' : 'default' }} />);
            } else {
                stars.push(<FaRegStar key={i} size={size} color="var(--text-muted)" onClick={() => interactive && onRate(i)} style={{ cursor: interactive ? 'pointer' : 'default' }} />);
            }
        }
        return stars;
    };

    return (
        <div className="flex" style={{ gap: '4px', alignItems: 'center' }}>
            {renderStars()}
            {count && <span style={{ fontSize: '12px', marginLeft: '8px', opacity: 0.6 }}>({count})</span>}
        </div>
    );
};

// --- LoadingSpinner.jsx ---
export const LoadingSpinner = ({ label = 'Turning pages...' }) => {
    return (
        <div className="flex-center" style={{ flexDirection: 'column', padding: '100px 0', gap: '24px' }}>
            <motion.div 
                animate={{ rotateY: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    width: '60px',
                    height: '40px',
                    background: 'var(--terra)',
                    borderRadius: '4px',
                    borderLeft: '10px solid #8A3A1A', // Book spine
                    perspective: '1000px'
                }}
            >
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #fff 50%, #F5ECD8 100%)', borderRadius: '0 4px 4px 0' }} />
            </motion.div>
            <p style={{ color: 'var(--terra)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '10px' }}>{label}</p>
        </div>
    );
};

// --- NoticeBoard.jsx ---
export const NoticeBoard = ({ children, title = 'Community Notes' }) => {
    return (
        <div style={{
            background: '#3A1A08',
            padding: '30px',
            borderRadius: 'var(--radius-lg)',
            border: '8px solid #2C1810',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
            position: 'relative'
        }}>
           {/* Pinned Note effect */}
           <div style={{
               position: 'absolute',
               top: '-15px',
               left: '50%',
               transform: 'translateX(-50%)',
               background: '#CC2244',
               width: '12px',
               height: '12px',
               borderRadius: '50%',
               boxShadow: '0 4px 4px rgba(0,0,0,0.5)'
           }} />
           
           <h4 style={{ 
               fontFamily: 'var(--font-display)', 
               color: '#F2E4C8', 
               textAlign: 'center',
               marginBottom: '20px',
               fontSize: '20px',
               textTransform: 'uppercase'
           }}>{title}</h4>
           
           <div className="flex-col" style={{ gap: '12px' }}>
               {children}
           </div>
        </div>
    );
};

// --- Pagination.jsx ---
export const Pagination = ({ current, total, onPageChange }) => {
    return (
        <div className="flex-center" style={{ gap: '12px', padding: '40px 0' }}>
            <button className="clay-btn" onClick={() => onPageChange(current - 1)} disabled={current === 1} style={{ padding: '8px 20px' }}>Prev</button>
            <div className="flex" style={{ gap: '8px' }}>
                {Array.from({ length: total }).map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => onPageChange(i + 1)}
                        className={`clay-btn ${current === i + 1 ? 'active' : ''}`}
                        style={{ width: '40px', padding: '8px 0', background: current === i + 1 ? 'var(--forest)' : '' }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
            <button className="clay-btn" onClick={() => onPageChange(current + 1)} disabled={current === total} style={{ padding: '8px 20px' }}>Next</button>
        </div>
    );
};
