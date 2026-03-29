import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      height: '100%'
    }}>
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        style={{
          width: '60px',
          height: '80px',
          background: 'var(--amber)',
          borderRadius: '4px 12px 12px 4px',
          borderLeft: '8px solid var(--wood-dk)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          marginBottom: '20px'
        }}
      />
      <div style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--text-warm)' }}>
        {text}
      </div>
    </div>
  );
}
