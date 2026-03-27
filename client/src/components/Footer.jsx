import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--wood)',
      borderTop: '4px solid var(--wood-dk)',
      padding: '24px',
      textAlign: 'center',
      color: 'var(--text-warm)',
      marginTop: 'auto'
    }}>
      <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', marginBottom: '8px' }}>
        BookSmart
      </div>
      <p style={{ fontSize: '14px', opacity: 0.8 }}>
        Made with love for Indian Readers. Stay cozy.
      </p>
    </footer>
  );
}
