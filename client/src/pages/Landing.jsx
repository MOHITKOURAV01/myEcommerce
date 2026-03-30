import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const compositeRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!compositeRef.current) return;
      
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 2;
      const yPos = (clientY / window.innerHeight - 0.5) * 2;

      // Premium 3D Tilt Effect
      gsap.to(compositeRef.current, {
        rotateY: xPos * 8, // Subtler horizontal tilt
        rotateX: -yPos * 8, // Subtler vertical tilt
        x: xPos * 20,
        y: yPos * 20,
        duration: 0.8,
        ease: 'power2.out',
      });

      // Shift the logo slightly differently for "depth"
      gsap.to(logoRef.current, {
        x: xPos * -15,
        y: yPos * -15,
        duration: 1,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="landing-root"
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0A0912',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '60px 20px',
        perspective: '1500px', // Crucial for 3D tilt
      }}
    >
      {/* ─── COMPOSITE BACKGROUND LAYER ─── */}
      <div 
        ref={compositeRef}
        className="composite-layer"
        style={{
          position: 'absolute',
          inset: '-10%', // Larger than screen for parallax buffer
          backgroundImage: "url('/bookshop-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          filter: 'brightness(0.9) contrast(1.1)',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(10,9,18,0.7) 100%)'
        }} />
      </div>

      {/* ─── UI OVERLAY ─── */}
      <div 
        ref={logoRef}
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ 
            fontFamily: "'Fredoka One', cursive",
            fontSize: 'max(60px, 10vw)',
            color: '#FFB347',
            lineHeight: 0.85,
            margin: '0 0 10px 0',
            textShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(255,179,71,0.3)',
            WebkitTextStroke: '2px rgba(44, 24, 16, 0.4)',
            textTransform: 'uppercase'
          }}
        >
          BookSmart
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{
            color: '#fff',
            fontSize: '12px',
            letterSpacing: '0.6em',
            fontWeight: 900,
            textTransform: 'uppercase',
            margin: 0
          }}
        >
          Step up to your next adventure
        </motion.p>
      </div>

      {/* ─── CTA BUTTON ─── */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '350px',
          paddingBottom: '40px',
        }}
      >
        <button 
          onClick={() => navigate('/home')}
          className="clay-cta-btn"
          style={{
            width: '100%',
            padding: '24px 0',
            borderRadius: '40px',
            border: 'none',
            fontSize: '28px',
            fontFamily: "'Fredoka One', cursive",
            color: '#fff',
            cursor: 'pointer',
            backgroundColor: '#C8603A',
            backgroundImage: 'linear-gradient(to bottom, #E07850, #C8603A)',
            borderBottom: '14px solid #8A3A1A',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 2px 10px rgba(255,255,255,0.4)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(14px)';
            e.currentTarget.style.borderBottomWidth = '0';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(6px)';
            e.currentTarget.style.borderBottomWidth = '8px';
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderBottomWidth = '14px';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <span>Step Inside</span>
          <span style={{ fontSize: '1.2em' }}>→</span>
        </button>

        <p style={{
          marginTop: '40px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '10px',
          letterSpacing: '0.5em',
          fontWeight: 900,
          textTransform: 'uppercase',
          textAlign: 'center'
        }}>
          Hand-crafted curiosity for you
        </p>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        
        body { margin: 0; padding: 0; background-color: #0A0912; }
        
        .clay-cta-btn:hover {
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        
        /* Shimmer effect simulation */
        .clay-cta-btn:after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-30deg);
          transition: 0.5s;
        }
        .clay-cta-btn:hover:after {
          left: 100%;
        }
      `}} />
    </div>
  );
};

export default Landing;
