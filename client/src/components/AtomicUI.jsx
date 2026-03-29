import React from 'react';
import { motion } from 'framer-motion';

// --- SignboardCard.jsx ---
export const SignboardCard = ({ title, subtitle, variant = 'terra', icon: Icon, onClick }) => {
    const colors = {
        terra: 'var(--terra)',
        forest: 'var(--forest)',
        sand: 'var(--sand)',
        purple: 'var(--purple)'
    };

    return (
        <motion.div 
            whileHover={{ rotate: -3, y: -8 }}
            onClick={onClick}
            className="signboard-card"
            style={{ 
                background: `linear-gradient(135deg, ${colors[variant]}, #2C1810)`,
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--clay-cream)',
                position: 'relative',
                cursor: 'pointer',
                border: '4px solid #2C1810',
                boxShadow: 'var(--shadow-lg)'
            }}
        >
            {/* Hanging Ropes Simulation */}
            <div style={{ position: 'absolute', top: '-15px', left: '20px', width: '2px', height: '15px', background: '#2C1810' }} />
            <div style={{ position: 'absolute', top: '-15px', right: '20px', width: '2px', height: '15px', background: '#2C1810' }} />
            
            {Icon && <Icon size={32} style={{ opacity: 0.8, marginBottom: '12px' }} />}
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.6, marginTop: '8px' }}>{subtitle}</p>}
        </motion.div>
    );
};

// --- ShopDoor.jsx ---
export const ShopDoor = ({ label, glowColor = 'var(--amber)', onClick }) => {
    return (
        <motion.div 
            whileHover={{ scale: 1.05, y: -6 }}
            onClick={onClick}
            style={{
                width: '180px',
                height: '260px',
                background: '#3A1A08',
                borderRadius: '70px 70px 8px 8px',
                border: '6px solid #F2E4C8',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '40px',
                cursor: 'pointer',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}
        >
            {/* Window */}
            <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: glowColor,
                boxShadow: `0 0 30px ${glowColor}`,
                opacity: 0.8,
                animation: 'pulse 3s infinite'
            }} />
            
            <div style={{ marginTop: 'auto', marginBottom: '20px', textAlign: 'center' }}>
                <span style={{ 
                    background: '#F2E4C8', 
                    color: '#3A1A08', 
                    padding: '4px 12px', 
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 900,
                    fontSize: '10px',
                    textTransform: 'uppercase'
                }}>
                    {label}
                </span>
            </div>
            
            {/* Knob */}
            <div style={{ position: 'absolute', top: '150px', right: '30px', width: '12px', height: '12px', borderRadius: '50%', background: '#D4A96A' }} />
        </motion.div>
    );
};

// --- PriceTag.jsx ---
export const PriceTag = ({ price, active }) => {
    return (
        <motion.div 
            whileHover={{ rotate: 2, y: -4 }}
            className="flex-center"
            style={{
                background: active ? 'var(--forest)' : 'var(--clay-cream)',
                color: active ? '#fff' : 'var(--text-dark)',
                padding: '6px 16px',
                clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)',
                borderRadius: '4px',
                fontWeight: 900,
                fontSize: '16px',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
            }}
        >
            <div style={{ position: 'absolute', top: '12px', left: '4px', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }} />
            {price}
        </motion.div>
    );
};

// --- Badge.jsx ---
export const Badge = ({ children, variant = 'new' }) => {
    const styles = {
        new: { bg: 'var(--terra)', color: '#fff' },
        sale: { bg: 'var(--forest)', color: '#fff' },
        hot: { bg: 'var(--amber)', color: 'var(--text-dark)' },
        amber: { bg: '--amber', color: 'var(--text-dark)' }
    };
    const s = styles[variant] || styles.new;
    
    return (
        <span style={{
            background: s.bg,
            color: s.color,
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
        }}>
            {children}
        </span>
    );
};
