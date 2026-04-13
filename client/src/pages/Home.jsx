import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/index_hooks';
import useBooks from '../hooks/useBooks';
import FloatingBooks from '../three/FloatingBooks';
import { BookCard3D } from '../components/ShopComponents';
import SignboardCard from '../components/SignboardCard';
import ShopDoor from '../components/ShopDoor';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaMagic, FaFire, FaClock, FaStar } from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger);

const MOODS = [
  { id: 'Motivated', name: 'Highly Motivated', desc: 'Fuel your fire', theme: 'terra' },
  { id: 'Confused', name: 'Feeling Confused', desc: 'Find your clarity', theme: 'mint' },
  { id: 'Feeling Low', name: 'Feeling Low', desc: 'Healing through pages', theme: 'gold' },
  { id: 'Burned Out', name: 'Burned Out', desc: 'Rest and recover', theme: 'purple' },
];

const CATEGORIES = [
  { id: 'Self Help', name: 'Self Help', color: 'var(--terra)' },
  { id: 'Finance', name: 'Finance', color: 'var(--mint)' },
  { id: 'Productivity', name: 'Productivity', color: 'var(--amber)' },
  { id: 'Philosophy', name: 'Philosophy', color: 'var(--primary)' },
  { id: 'Psychology', name: 'Psychology', color: 'var(--forest)' },
  { id: 'Business', name: 'Business', color: 'var(--wood)' },
];

const HERO_BOOKS = [
  { id: 1, title: 'Atomic Habits', img: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', float: { y: [-60, 0], r: -15 }, grid: { t: '10%', l: '0%' }, color: 'rgba(200,96,58,0.2)' },
  { id: 2, title: 'Ikigai', img: 'https://covers.openlibrary.org/b/isbn/9781786330895-L.jpg', float: { y: [50, 0], r: 10 }, grid: { t: '10%', l: '35%' }, color: 'rgba(46,125,50,0.1)' },
  { id: 3, title: 'Deep Work', img: 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg', float: { y: [-40, 0], r: -5 }, grid: { t: '10%', l: '70%' }, color: 'rgba(255,193,7,0.2)' },
  { id: 4, title: 'Rich Dad Poor Dad', img: 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg', float: { y: [30, 0], r: -20 }, grid: { t: '55%', l: '0%' }, color: 'rgba(200,96,58,0.1)' },
  { id: 5, title: 'Range', img: 'https://covers.openlibrary.org/b/isbn/9780735214484-L.jpg', float: { y: [-20, 0], r: 5 }, grid: { t: '55%', l: '35%' }, color: 'rgba(46,125,50,0.1)' },
  { id: 6, title: 'Creative Selection', img: 'https://covers.openlibrary.org/b/isbn/9781250194466-L.jpg', float: { y: [-30, 0], r: -10 }, grid: { t: '55%', l: '70%' }, color: 'rgba(46,125,50,0.05)' },
];

export default function Home() {
  const { books, loading } = useBooks();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [activeProblem, setActiveProblem] = useState('Focus');
  const [isSpread, setIsSpread] = useState(false);

  // Personalized Logic
  const personalizedBooks = useMemo(() => {
    if (!user?.preferences || !books.length) return [];
    const { moods = [], problems = [], languages = [] } = user.preferences;

    return books.filter(book => {
      const matchesMood = moods.some(m => book.moods?.includes(m));
      const matchesProblem = problems.some(p => book.problems?.includes(p));
      const matchesLang = languages.some(l => book.language === l);
      return matchesMood || matchesProblem || matchesLang;
    }).slice(0, 8);
  }, [user, books]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      // Refresh ScrollTrigger
      ScrollTrigger.refresh();

      // Section Title Animations
      gsap.utils.toArray('.sec-title').forEach(title => {
        gsap.from(title, {
          y: 40,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: title,
            start: 'top 90%',
          }
        });
      });

      // Shelf Plank Animations
      gsap.utils.toArray('.shelf-plank').forEach(plank => {
        gsap.from(plank, {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: plank,
            start: 'top 95%',
          }
        });
      });
    }
  }, [loading, books]);

  if (loading) return <LoadingSpinner text="Consulting the library records..." />;

  const featuredBooks = books.filter(b => b.isFeatured).slice(0, 6);
  const trendingBooks = books.filter(b => b.trending).slice(0, 8);
  const newArrivals = books.filter(b => b.newArrival).slice(0, 8);

  return (
    <div className="home-container bg-interior min-h-screen" ref={containerRef}>

      {/* 1. ARCHIVAL HERO */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-interior">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,rgba(200,96,58,0.12),transparent_60%)] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_70%_50%,rgba(46,125,50,0.05),transparent_70%)] opacity-50 pointer-events-none"></div>

        <div className="container mx-auto px-8 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "circOut" }}
            >
              <div className="inline-flex items-center gap-3 bg-forest/10 border border-forest/20 px-6 py-2 rounded-full mb-10">
                <span className="w-2 h-2 bg-mint rounded-full animate-pulse shadow-[0_0_10px_var(--mint)]" />
                <span className="text-[10px] font-black uppercase tracking-[5px] text-mint">{isSpread ? 'ARCHIVAL SHELF VIEW' : 'FLOATING ARCHIVES'}</span>
              </div>

              <h1 className="font-fredoka text-7xl md:text-9xl text-cream mb-10 leading-[0.85] tracking-tighter">
                Curating <br />
                <span className="text-primary italic">The Soul's</span> <br />
                Library
              </h1>

              <p className="text-xl md:text-2xl text-textMed mb-14 max-w-lg leading-relaxed font-bold opacity-70">
                Step into a sanctuary where books aren't just paper, but prescriptions for the modern heart.
              </p>

              <div className="flex flex-wrap gap-8 items-center mb-24">
                <button 
                  onClick={() => navigate('/discover')} 
                  className="clay-btn btn-primary px-14 py-7 text-xl shadow-[0_20px_60px_rgba(46,125,50,0.25)] flex items-center gap-4 group"
                >
                  Enter the Gallery <FaArrowRight className="group-hover:translate-x-3 transition-transform" />
                </button>
                
                <button 
                  onClick={() => setIsSpread(!isSpread)} 
                  className="text-cream font-black uppercase tracking-[4px] text-xs border-b-2 border-primary/30 hover:border-primary pb-2 transition-all cursor-pointer"
                >
                  {isSpread ? 'Release to Orbit' : 'Organize Shelf'}
                </button>
              </div>

              <div className="flex items-center gap-16 pt-12 border-t border-white/5">
                <div className="flex flex-col">
                  <p className="font-fredoka text-5xl text-primary font-black">1.2k+</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted mt-2">Artifacts Found</p>
                </div>
                <div className="w-px h-16 bg-white/10" />
                <div className="flex flex-col">
                  <p className="font-fredoka text-5xl text-mint font-black">4.9/5</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted mt-2">Soul Rating</p>
                </div>
              </div>
            </motion.div>

            {/* THE INTERACTIVE ARTIFACTS CLUSTER - DYNAMIC STRUCTURE */}
            <div 
              className="relative h-[600px] lg:h-[800px] w-full mt-20 lg:mt-0 cursor-pointer"
              onClick={() => setIsSpread(!isSpread)}
            >
               {HERO_BOOKS.map((book, idx) => (
                 <motion.div 
                   key={book.id}
                   layout
                   animate={isSpread ? { top: book.grid.t, left: book.grid.l, rotate: 0 } : { y: book.float.y, rotate: book.float.r }}
                   transition={{ duration: 0.8, ease: "circOut", delay: isSpread ? idx * 0.05 : 0 }}
                   className="absolute z-20"
                   style={{ 
                     top: !isSpread ? `${idx * 15}%` : book.grid.t, 
                     left: !isSpread ? `${(idx % 2) * 40 + 5}%` : book.grid.l 
                   }}
                 >
                    <div className="absolute inset-0 blur-[60px] rounded-full opacity-40" style={{ backgroundColor: book.color }} />
                    <img 
                      src={book.img} 
                      className={`object-cover rounded-xl shadow-2xl border border-white/10 transition-all ${isSpread ? 'w-40 h-56' : 'w-56 h-80'}`} 
                      alt={book.title} 
                    />
                 </motion.div>
               ))}
            </div>

          </div>
        </div>
      </section>

      {/* 2. CATEGORY SIGNS */}
      <section className="py-12 bg-interior-2 border-y border-borderWarm/30">
        <div className="container">
          <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
            {CATEGORIES.map(cat => (
              <motion.button
                whileHover={{ y: -5, scale: 1.05 }}
                key={cat.id}
                onClick={() => navigate(`/discover?category=${cat.id}`)}
                className="group relative flex items-center gap-4 bg-interior border-2 border-borderWarm p-4 rounded-2xl min-w-[200px] transition-all hover:border-primary/50"
              >
                <div className="w-10 h-10 rounded-xl flex-center bg-forest/10 text-primary font-black" style={{ color: cat.color }}>#</div>
                <span className="font-fredoka text-lg text-cream">{cat.name}</span>
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PERSONALIZED SECTION (Visible if user has preferences) */}
      {isAuthenticated && personalizedBooks.length > 0 && (
        <section className="py-24 relative overflow-hidden">
          <div className="container">
            <div className="flex-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaMagic className="text-mint animate-bounce" />
                  <span className="eyebrow text-mint">For Your Vibe</span>
                </div>
                <h2 className="sec-title">Personalized <em>Cures</em></h2>
              </div>
              <button onClick={() => navigate('/profile')} className="text-xs font-black text-textMuted uppercase hover:text-mint tracking-widest">Update Prefs</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {personalizedBooks.map(book => (
                <BookCard3D key={book._id} book={book} />
              ))}
            </div>
          </div>
          <div className="shelf-plank mt-20 mx-auto w-11/12" />
        </section>
      )}

      {/* 4. TRENDING NOW */}
      <section className="py-24">
        <div className="container">
          <div className="flex-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaFire className="text-terra" />
                <span className="eyebrow text-terra">Archaic Pulse</span>
              </div>
              <h2 className="sec-title">Trending <em>Relics</em></h2>
            </div>
            <button onClick={() => navigate('/discover?sort=trending')} className="btn-ghost text-cream font-bold group">
              Explore All <FaArrowRight className="inline ml-2 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {trendingBooks.map(book => (
              <BookCard3D key={book._id} book={book} />
            ))}
          </div>
        </div>
        <div className="shelf-plank mt-20 mx-auto w-11/12" />
      </section>

      {/* 5. FRESH FROM PRESS */}
      <section className="py-24 bg-interior-2">
        <div className="container">
          <div className="flex-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaClock className="text-mint" />
                <span className="eyebrow text-mint">Arrived Today</span>
              </div>
              <h2 className="sec-title">Fresh <em>Parchments</em></h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {newArrivals.map(book => (
              <BookCard3D key={book._id} book={book} />
            ))}
          </div>
        </div>
        <div className="shelf-plank mt-20 mx-auto w-11/12" />
      </section>

      {/* 6. THE GRID (Featured) */}
      <section className="py-32 relative">
        <div className="container">
          <div className="text-center mb-20">
            <span className="eyebrow text-primary">Sacred Picks</span>
            <h2 className="sec-title !text-6xl mt-4">Hall of <em>Masterpieces</em></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {featuredBooks.map(book => (
              <div key={book._id} className="flex-center">
                <BookCard3D book={book} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. DISCOVER BY MOOD */}
      <section className="py-24 bg-interior-2 border-y border-borderWarm/30">
        <div className="container">
          <h2 className="sec-title text-center mb-16">Filter by <em>Vibration</em></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOODS.map(mood => (
              <SignboardCard
                key={mood.id}
                mood={mood}
                theme={mood.theme}
                onClick={() => navigate(`/discover?mood=${mood.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 8. PROBLEM SOLVERS */}
      <section className="py-32">
        <div className="container text-center">
          <span className="eyebrow text-terra">Archival Solutions</span>
          <h2 className="sec-title mb-12">What defines your <em>Struggle?</em></h2>

          <div className="flex justify-center flex-wrap gap-4 mb-20 max-w-4xl mx-auto">
            {['Focus', 'Career', 'Stress', 'Finance', 'Confidence', 'Sleep'].map(p => (
              <button
                key={p}
                onClick={() => setActiveProblem(p)}
                className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all border-2 ${activeProblem === p ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(183,28,28,0.3)]' : 'bg-interior border-borderWarm text-textMed hover:border-primary/50'}`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {books.filter(b => b.problems?.includes(activeProblem)).slice(0, 4).map(book => (
              <BookCard3D key={book._id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. THE VAULT (Reading Paths) */}
      <section className="py-32 bg-night border-t-8 border-wood">
        <div className="container">
          <div className="text-center mb-24">
            <h2 className="sec-title !text-white !text-5xl mb-4">The Secret <em>Passages</em></h2>
            <p className="text-cream/50 uppercase tracking-[4px] font-black text-xs">Curated reading journeys for every soul</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { id: 'apprentice', name: 'Apprentice', desc: 'Begin your journey', count: 42 },
              { id: 'titan', name: 'Alchemist', desc: 'Transform your work', count: 28 },
              { id: 'sage', name: 'The Sage', desc: 'Deep philosophy', count: 19 },
              { id: 'warrior', name: 'The Warrior', desc: 'Career & Discipline', count: 35 },
            ].map(path => (
              <ShopDoor key={path.id} path={path} onClick={() => navigate(`/discover?path=${path.id}`)} />
            ))}
          </div>
        </div>
      </section>

      {/* 10. STATISTICS */}
      <section className="py-24 bg-primary text-white">
        <div className="container grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { val: '1.2k', label: 'Relics Cataloged' },
            { val: '45k', label: 'Soul Connections' },
            { val: '15+', label: 'Sacred Paths' },
            { val: '24/7', label: 'Vault Access' },
          ].map((s, i) => (
            <div key={i}>
              <p className="font-fredoka text-5xl mb-2">{s.val}</p>
              <p className="text-[10px] font-black uppercase tracking-[3px] opacity-70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 11. NEWSLETTER */}
      <section className="py-32 bg-interior border-t border-borderWarm/30">
        <div className="container">
          <div className="wood-panel p-16 max-w-5xl mx-auto rounded-[40px] text-center border-4 border-wood relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            <div className="relative z-10">
              <h2 className="font-fredoka text-5xl text-cream mb-6">Join the Inner <em>Sanctum</em></h2>
              <p className="text-xl text-textMed mb-10 max-w-lg mx-auto">Get exclusive archival recommendations and member-only treasures every full moon.</p>

              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <input type="email" placeholder="Your archaic email address..." className="clay-input flex-1 !py-5" />
                <button className="clay-btn btn-primary px-12 !py-5">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
