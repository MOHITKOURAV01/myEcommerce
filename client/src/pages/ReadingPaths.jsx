import React from 'react';
import { motion } from 'framer-motion';
import useBooks from '../hooks/useBooks';
import { FaUserGraduate, FaBriefcase, FaBookOpen, FaCrown, FaArrowRight, FaEye } from 'react-icons/fa';

const PATHS = [
  { id: 'student', name: 'Curriculum of Growth', sub: 'STUDENT ROOM', desc: 'Arcane knowledge for exams & learning', count: 24, icon: <FaUserGraduate />, color: '#4caf50' },
  { id: 'career', name: 'Strategic Advancement', sub: 'JOB SEEKER', desc: 'Vault of interview prep & tactical skills', count: 18, icon: <FaBriefcase />, color: '#ff5722' },
  { id: 'beginner', name: 'Gateway of Wisdom', sub: 'NEW READER', desc: 'The Corridor of foundational curiosities', count: 32, icon: <FaBookOpen />, color: '#d4af37' },
  { id: 'pro', name: 'Imperial Leadership', sub: 'PROFESSIONAL', desc: 'Leadership & the art of deep workflow', count: 15, icon: <FaCrown />, color: '#00bcd4' },
];

export default function ReadingPaths({ setModalBook }) {
  const { books, loading } = useBooks();

  const scrollToRoom = (id) => {
    const el = document.getElementById(id);
    if(el) {
       const offset = 100;
       const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
       window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="min-h-screen flex-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-mint"></div></div>;

  return (
    <div className="min-h-screen bg-interior text-cream" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
      <div className="container mx-auto px-8 max-w-7xl">
        
        {/* REFINED HEADER */}
        <div className="text-center mb-24">
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-4"
          >
            Curated Archives
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-fredoka font-black mb-8 tracking-tight"
          >
            Discovery <em className="text-primary not-italic">Chapters</em>
          </motion.h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-8 opacity-50"></div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-cream/50 font-bold text-lg max-w-xl mx-auto leading-relaxed"
          >
            Shed light upon specialized sectors of our library, organized for your current pursuit.
          </motion.p>
        </div>

        {/* ELEGANT SANCTUARY SEALS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-32">
          {PATHS.map((path, i) => (
            <motion.div 
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={() => scrollToRoom(path.id)}
              className="wood-panel p-8 cursor-pointer group relative bg-white/2 border border-white/5 hover:border-primary/40 transition-all rounded-[32px] overflow-hidden"
            >
              <div className="text-3xl mb-6 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" style={{ color: path.color }}>
                {path.icon}
              </div>
              <h3 className="font-black text-lg mb-1">{path.name}</h3>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-cream/30 mb-8">{path.sub}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-primary tracking-widest uppercase">Select Path</span>
                <FaArrowRight className="text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* GALLERIES CONTENT */}
        <div className="space-y-48">
          {PATHS.map((path, idx) => {
            const booksForPath = books.slice(idx * 4, idx * 4 + 4);
            
            return (
              <div key={path.id} id={path.id} className="relative group/sector">
                {/* Chapter Header */}
                <div className="flex items-center gap-12 mb-16 px-2">
                   <div className="shrink-0">
                      <p className="text-[9px] font-black text-primary tracking-[0.4em] uppercase mb-3">{path.sub}</p>
                      <h3 className="text-4xl font-fredoka font-black flex items-center gap-6">
                        {path.name}
                      </h3>
                   </div>
                   <div className="flex-1 h-px bg-white/10"></div>
                   <div className="text-right hidden md:block">
                      <p className="text-[10px] font-black text-cream/20 tracking-[0.3em] uppercase italic">{path.count} Curations</p>
                      <p className="text-[9px] text-cream/40 font-bold max-w-xs ml-auto mt-2 leading-relaxed">{path.desc}</p>
                   </div>
                </div>

                {/* Corridor of Books */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 px-2">
                  {booksForPath.map((book) => {
                    const coverImg = book.coverUrl || `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
                    
                    return (
                      <motion.div 
                        key={book._id} 
                        whileHover={{ y: -10 }}
                        onClick={() => setModalBook(book)}
                        className="cursor-pointer group flex flex-col"
                      >
                        {/* Robust Aspect Ratio Container - Slightly more compact */}
                        <div className="relative mb-4 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-primary/40 bg-white/5 border border-white/10 mx-auto w-full max-w-[200px] group-hover:border-primary/30">
                           <div className="relative w-full" style={{ paddingTop: '150%' /* 2:3 Aspect Ratio */ }}>
                              <img 
                                src={coverImg} 
                                alt={book.title} 
                                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => e.target.src = 'https://placehold.co/400x600/231f20/d4af37?text=Book+Smart'}
                              />
                              {/* Sophisticated Glass Overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[3px] flex-center flex-col gap-3">
                                 <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex-center text-primary text-lg transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <FaEye />
                                  </div>
                                  <span className="text-[9px] font-black text-primary tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity delay-200">Enlarge Archive</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="px-1 text-center lg:text-left">
                          <h4 className="font-black text-cream text-[15px] mb-1 group-hover:text-primary transition-colors line-clamp-1 leading-tight">{book.title}</h4>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{book.author}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Archaic Shelf Detail */}
                <div className="absolute -bottom-16 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
            );
          })}
        </div>

        <div className="mt-48 text-center opacity-10">
           <p className="text-[10px] font-black tracking-[2em] uppercase">End of Discovery Corridors</p>
        </div>

      </div>
    </div>
  );
}
