import React from 'react';

export default function About() {
  return (
    <div className="home-bg" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px' }}>
      <div className="clay-card" style={{ maxWidth: '800px', width: '100%', padding: '60px', borderRadius: '32px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="door-window" style={{ margin: '0 auto 20px', width: '80px', height: '80px' }}>
            <div className="window-glow" />
          </div>
          <h1 style={{ fontSize: '48px', color: 'var(--amber)' }}>About Book<em>Smart</em></h1>
          <p style={{ fontSize: '18px', opacity: 0.8, marginTop: '10px' }}>
            Your cozy corner for discovering books.
          </p>
        </div>

        <div style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--text-warm)' }}>
          <p style={{ marginBottom: '20px' }}>
            BookSmart was created to help Indian readers find exactly what they need, when they need it. 
            We believe that the right book at the right time can change your life.
          </p>
          <p style={{ marginBottom: '20px' }}>
            But finding that book should not feel like a chore. It should feel like stepping into a warm, 
            cozy bookshop where the bookseller already knows what you're looking for. Our platform uses 
            smart tagging, mood mapping, and life-stage curation to bring the perfect book straight to your hands.
          </p>
          <p>
            So take a seat, browse the shelves, and remember: your next great adventure is just one page away.
          </p>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          <button className="clay-btn" style={{ background: 'var(--terra)', color: 'white', '--shadow-color': 'var(--terra-dk)', fontSize: '18px' }} onClick={() => window.history.back()}>
            ← Back to the Shop
          </button>
        </div>

      </div>
    </div>
  );
}
