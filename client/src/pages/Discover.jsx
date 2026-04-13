import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useBooks from '../hooks/useBooks';
import { BookCard3D } from '../components/ShopComponents';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaThLarge, FaList, FaTimes, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const MOODS = ['Motivated', 'Confused', 'Feeling Low', 'Burned Out', 'Inspired', 'Relaxed'];
const PROBLEMS = ['Focus', 'Career', 'Stress', 'Finance', 'Confidence', 'Sleep', 'Anxiety'];
const LANGUAGES = ['English', 'Hindi', 'Sanskrit', 'Spanish', 'French'];

const FilterSidebar = ({ filters, setFilters, availableOptions, onClear }) => {
  return (
    <div className="bg-interior p-8 rounded-[32px] border-2 border-borderWarm sticky top-24 w-full lg:w-[320px] shrink-0 max-h-[calc(100vh-140px)] overflow-y-auto hide-scrollbar shadow-2xl">
      <div className="flex justify-between items-center mb-8 border-b-2 border-borderWarm pb-4">
        <h3 className="font-fredoka text-2xl text-cream flex items-center gap-3">
          <FaFilter className="text-sm text-primary" /> Filters
        </h3>
        <button onClick={onClear} className="text-[10px] font-black uppercase tracking-widest text-terra hover:underline">Clear All</button>
      </div>

      {/* Categories */}
      <div className="mb-10">
        <h4 className="eyebrow text-primary mb-4">Arcane Category</h4>
        <select 
          className="clay-input w-full !py-4 !text-sm !bg-interior-2 border-borderWarm"
          value={filters.category || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="">All Collections</option>
          {availableOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Moods */}
      <div className="mb-10">
        <h4 className="eyebrow text-mint mb-4">Vibration / Mood</h4>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button 
              key={m}
              onClick={() => setFilters(prev => ({ ...prev, mood: prev.mood === m ? '' : m }))}
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border-2 transition-all duration-300 ${filters.mood === m ? 'bg-mint border-mint text-night shadow-lg shadow-mint/20' : 'bg-interior-2 text-textMed border-borderWarm hover:border-mint/30'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Problems */}
      <div className="mb-10">
        <h4 className="eyebrow text-terra mb-4">The Struggle</h4>
        <div className="flex flex-wrap gap-2">
          {PROBLEMS.map(p => (
            <button 
              key={p}
              onClick={() => setFilters(prev => ({ ...prev, problem: prev.problem === p ? '' : p }))}
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border-2 transition-all duration-300 ${filters.problem === p ? 'bg-terra border-terra text-night shadow-lg shadow-terra/20' : 'bg-interior-2 text-textMed border-borderWarm hover:border-terra/30'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-10">
        <div className="flex-between mb-4">
           <h4 className="eyebrow text-primary">Sacrifice (Price)</h4>
           <span className="font-fredoka text-xl text-primary">₹{filters.price}</span>
        </div>
        <input 
          type="range" 
          min="100" max="2500" step="50"
          value={filters.price}
          onChange={(e) => setFilters(prev => ({ ...prev, price: Number(e.target.value) }))}
          className="w-full accent-primary h-1.5 rounded-full appearance-none cursor-pointer bg-interior-2"
        />
        <div className="flex-between text-[10px] font-black text-textMuted mt-3 uppercase tracking-widest opacity-60">
           <span>₹100</span>
           <span>₹2.5k</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="mb-10">
        <h4 className="eyebrow text-gold mb-4">Soul Rating</h4>
        <div className="grid grid-cols-4 gap-2">
          {[0, 3, 4, 4.5].map(r => (
            <button 
              key={r}
              onClick={() => setFilters(prev => ({ ...prev, minRating: r }))}
              className={`text-[10px] font-black py-3 rounded-xl border-2 transition-all ${filters.minRating === r ? 'bg-gold border-gold text-night shadow-lg shadow-gold/20' : 'bg-interior-2 border-borderWarm text-textMed hover:border-gold/30'}`}
            >
              {r === 0 ? 'ALL' : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div className="flex items-center gap-4 p-5 bg-interior-2 rounded-[20px] border border-borderWarm/30 hover:border-mint/30 transition-colors cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, inStock: !prev.inStock }))}>
         <input 
            type="checkbox" 
            id="inStock"
            checked={filters.inStock}
            readOnly
            className="w-5 h-5 accent-mint rounded-lg ring-offset-night transition-all"
         />
         <label htmlFor="inStock" className="text-[10px] font-black uppercase tracking-widest text-cream cursor-pointer select-none">Available Now</label>
      </div>
    </div>
  );
};

export default function Discover({ setModalBook }) {
  const { books, loading } = useBooks();
  const location = useLocation();
  const navigate = useNavigate();

  // Initial filters from URL params
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get('category') || '',
      mood: params.get('mood') || '',
      problem: params.get('problem') || '',
      path: params.get('path') || '',
      language: '',
      price: 2500,
      minRating: 0,
      inStock: false,
      search: params.get('q') || ''
    };
  });

  const [sort, setSort] = useState('-createdAt');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Sync state to URL for shareability
  useEffect(() => {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.mood) params.set('mood', filters.mood);
      if (filters.problem) params.set('problem', filters.problem);
      if (filters.path) params.set('path', filters.path);
      if (filters.search) params.set('q', filters.search);
      
      const newSearch = params.toString();
      const currentSearch = location.search.replace('?', '');
      if (newSearch !== currentSearch) {
          navigate({ search: newSearch }, { replace: true });
      }
  }, [filters, navigate, location.search]);

  // Derived Options for filter counts etc
  const availableOptions = useMemo(() => {
    // Handle both cases: category as string or category as object { name, slug }
    const catList = books.map(b => typeof b.category === 'object' ? b.category.name : b.category);
    const categories = [...new Set(catList)].filter(Boolean);
    return { categories };
  }, [books]);

  // Filter & Sort Logic
  const processedBooks = useMemo(() => {
    let result = [...books];

    if (filters.category) {
      result = result.filter(b => {
        const catValue = typeof b.category === 'object' ? b.category.name : b.category;
        return catValue === filters.category;
      });
    }
    if (filters.mood) result = result.filter(b => b.moods?.includes(filters.mood));
    if (filters.problem) result = result.filter(b => b.problems?.includes(filters.problem));
    if (filters.path) result = result.filter(b => b.readingPaths?.includes(filters.path));
    if (filters.language) result = result.filter(b => b.language === filters.language);
    
    if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(b => 
            b.title.toLowerCase().includes(q) || 
            b.author.toLowerCase().includes(q) ||
            b.description?.toLowerCase().includes(q)
        );
    }
    
    result = result.filter(b => b.price <= filters.price);
    if (filters.minRating > 0) result = result.filter(b => b.rating >= filters.minRating);
    if (filters.inStock) result = result.filter(b => b.stock > 0);

    // Sort
    if (sort === '-createdAt') result.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sort === 'price') result.sort((a,b) => a.price - b.price);
    if (sort === '-price') result.sort((a,b) => b.price - a.price);
    if (sort === '-rating') result.sort((a,b) => b.rating - a.rating);
    if (sort === 'trending') result.sort((a,b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));

    return result;
  }, [books, filters, sort]);

  const paginatedBooks = processedBooks.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(processedBooks.length / itemsPerPage);

  const clearFilters = () => {
    setFilters({ category: '', mood: '', problem: '', path: '', language: '', price: 2500, minRating: 0, inStock: false, search: '' });
    setPage(1);
  };

  if (loading) return <LoadingSpinner text="Dusting off the archives..." />;

  const activeBadges = Object.entries(filters).filter(([k, v]) => {
     if(k === 'price' && v === 2500) return false;
     if(k === 'minRating' && v === 0) return false;
     if(k === 'inStock' && v === false) return false;
     return v && k !== 'search';
  });

  return (
    <div className="container min-h-screen pt-[120px] pb-32">
      
      {/* Cinematic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-end mb-16 border-b-8 border-wood/30 pb-12 gap-8">
        <div className="max-w-xl">
           <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(200,96,58,0.8)]" /> Discovery Engine v2.0
           </div>
           <h1 className="font-fredoka text-6xl md:text-8xl text-cream leading-[0.8] tracking-tighter">
             The <span className="text-primary italic">Great</span> <br/>Catalog
           </h1>
           <p className="text-textMuted mt-6 font-medium max-w-sm leading-relaxed">Sift through centuries of encoded wisdom and modern insights.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 lg:mt-0 w-full lg:w-auto items-center">
            {/* SEARCH BAR (Large screens only) */}
            <div className="hidden lg:block relative w-[350px]">
               <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/50" />
               <input 
                 type="text" 
                 placeholder="Search by title, author, vibe..." 
                 className="clay-input w-full pl-14 !py-4 rounded-[20px] !bg-interior-2 border-borderWarm focus:border-primary/50"
                 value={filters.search}
                 onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
               />
            </div>

            <div className="flex gap-4 items-center w-full sm:w-auto">
               <select 
                 value={sort} 
                 onChange={(e) => setSort(e.target.value)}
                 className="flex-1 sm:flex-none bg-interior-2 border-2 border-borderWarm text-cream font-black uppercase tracking-widest text-[10px] rounded-[20px] px-8 py-4 outline-none hover:border-primary transition-all cursor-pointer shadow-lg"
               >
                   <option value="-createdAt">Newest Arrivals</option>
                   <option value="trending">Trending Now</option>
                   <option value="-rating">Highest Rated</option>
                   <option value="price">Price: Low → High</option>
                   <option value="-price">Price: High → Low</option>
               </select>

               <div className="flex bg-interior-2 border-2 border-borderWarm rounded-[20px] p-1.5 shadow-xl">
                   <button 
                     onClick={()=>setViewMode('grid')} 
                     className={`w-11 h-11 flex-center rounded-xl transition-all duration-300 ${viewMode==='grid'?'bg-primary text-night shadow-lg shadow-primary/30 scale-105':'text-textMuted hover:text-cream'}`}
                   >
                     <FaThLarge size={18} />
                   </button>
                   <button 
                     onClick={()=>setViewMode('list')} 
                     className={`w-11 h-11 flex-center rounded-xl transition-all duration-300 ${viewMode==='list'?'bg-primary text-night shadow-lg shadow-primary/30 scale-105':'text-textMuted hover:text-cream'}`}
                   >
                     <FaList size={18} />
                   </button>
               </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Sidebar */}
        <FilterSidebar filters={filters} setFilters={setFilters} availableOptions={availableOptions} onClear={clearFilters} />

        {/* Results Area */}
        <div className="flex-1 w-full">
            
            {/* Active Filters Feed */}
            <div className="flex flex-wrap items-center gap-3 mb-10 min-h-[40px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-textMuted mr-2">{processedBooks.length} Relics Found</span>
                <AnimatePresence>
                    {activeBadges.map(([key, val]) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          key={key} 
                          className="flex items-center gap-2 bg-interior border border-borderWarm px-4 py-2 rounded-full shadow-sm"
                        >
                            <span className="text-textMuted uppercase text-[9px] font-black tracking-widest">{key}:</span>
                            <span className="font-bold text-mint text-xs uppercase">{val}</span>
                            <button onClick={() => setFilters(p => ({...p, [key]: key === 'price' ? 2500 : key === 'minRating' ? 0 : ''}))} className="text-primary hover:scale-125 transition-transform"><FaTimes size={10} /></button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {activeBadges.length > 0 && (
                    <button onClick={clearFilters} className="text-[10px] font-black uppercase text-terra underline tracking-widest ml-4 hover:italic">Burn All Filters</button>
                )}
            </div>

            {/* Results Rendering */}
            {processedBooks.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="wood-panel text-center p-20 rounded-[40px] border-4 border-dashed border-borderWarm/30 flex flex-col items-center"
                >
                    <div className="w-24 h-24 bg-interior rounded-full flex-center text-5xl mb-8 animate-pulse shadow-inner">🌪️</div>
                    <h3 className="font-fredoka text-3xl text-cream mb-4">The Archives are Silent</h3>
                    <p className="text-textMed max-w-md mx-auto leading-relaxed italic">No books in our collection resonate with these specific vibrations. Try broadening your search or choosing a different path.</p>
                    <button onClick={clearFilters} className="clay-btn btn-primary mt-10">Reset Search Protocols</button>
                </motion.div>
            ) : (
                <>
                    <motion.div 
                        layout
                        className={viewMode === 'grid' 
                            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-16" 
                            : "flex flex-col gap-10"
                        }
                    >
                        {paginatedBooks.map(book => (
                            <motion.div layout key={book._id}>
                                <BookCard3D book={book} view={viewMode} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Industrial Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-center gap-3 mt-24 pb-12">
                            <button 
                                disabled={page === 1} 
                                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }}
                                className="w-12 h-12 rounded-2xl flex-center bg-interior border-2 border-borderWarm text-cream disabled:opacity-30 hover:border-primary transition-all"
                            >
                                <FaChevronLeft />
                            </button>
                            
                            <div className="flex gap-3">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    // Logic to show limited page numbers if many
                                    if (totalPages > 7 && Math.abs(page - p) > 2 && p !== 1 && p !== totalPages) return null;
                                    return (
                                        <button 
                                            key={p} 
                                            onClick={() => { setPage(p); window.scrollTo(0, 500); }}
                                            className={`w-14 h-14 rounded-2xl font-fredoka text-2xl border-2 transition-all duration-300 ${page === p ? 'bg-primary border-primary text-night shadow-xl shadow-primary/40 scale-110' : 'bg-interior-2 border-borderWarm text-cream hover:border-primary/50'}`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>

                            <button 
                                disabled={page === totalPages} 
                                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }}
                                className="w-12 h-12 rounded-2xl flex-center bg-interior border-2 border-borderWarm text-cream disabled:opacity-30 hover:border-primary transition-all"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    )}
                </>
            )}

        </div>
      </div>
    </div>
  );
}
