import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useBooks from '../hooks/useBooks';
import BookCard3D from '../components/BookCard3D';
import LoadingSpinner from '../components/LoadingSpinner';

const FilterSidebar = ({ filters, setFilters, availableOptions, onClear }) => {
  return (
    <div className="bg-interior p-6 rounded-2xl border-2 border-borderWarm sticky top-24 w-[280px] shrink-0 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-6 border-b border-borderWarm pb-4">
        <h3 className="font-fredoka text-xl text-brown">Filters</h3>
        <button onClick={onClear} className="text-sm text-terra font-bold hover:underline">Clear All</button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-bold text-primary mb-3">Category</h4>
        <select 
          className="w-full p-2 bg-cream rounded-lg border-2 border-borderWarm text-brown outline-none"
          value={filters.category || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          {availableOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Moods */}
      <div className="mb-6">
        <h4 className="font-bold text-primary mb-3">Mood</h4>
        <div className="flex flex-wrap gap-2">
          {availableOptions.moods.slice(0, 8).map(m => (
            <button 
              key={m}
              onClick={() => setFilters(prev => ({ ...prev, mood: prev.mood === m ? '' : m }))}
              className={`text-xs px-3 py-1 rounded-full border-2 transition-colors ${filters.mood === m ? 'bg-mint text-white border-mint' : 'bg-transparent text-textMed border-borderWarm hover:border-mint'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-bold text-primary mb-3">Max Price: ₹{filters.price}</h4>
        <input 
          type="range" 
          min="100" max="1000" step="50"
          value={filters.price}
          onChange={(e) => setFilters(prev => ({ ...prev, price: Number(e.target.value) }))}
          className="w-full accent-terra"
        />
      </div>

      {/* Minimum Rating */}
      <div className="mb-6">
        <h4 className="font-bold text-primary mb-3">Min Rating</h4>
        <div className="flex gap-2">
          {[4, 4.5, 4.8].map(r => (
            <button 
              key={r}
              onClick={() => setFilters(prev => ({ ...prev, minRating: r }))}
              className={`flex-1 text-sm py-1 rounded-lg border-2 ${filters.minRating === r ? 'bg-gold text-white border-gold' : 'border-borderWarm'}`}
            >
              {r} ★
            </button>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div className="mb-6 flex items-center gap-3">
         <input 
            type="checkbox" 
            id="inStock"
            checked={filters.inStock}
            onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
            className="w-5 h-5 accent-primary"
         />
         <label htmlFor="inStock" className="font-bold text-primary cursor-pointer">In Stock Only</label>
      </div>
    </div>
  );
};

export default function Discover({ setModalBook }) {
  const { books, loading } = useBooks();
  const location = useLocation();
  const navigate = useNavigate();

  // Initial filters from URL params
  const [filters, setFilters] = useState({
    category: '',
    mood: '',
    problem: '',
    path: '',
    price: 1000,
    minRating: 0,
    inStock: false,
    search: ''
  });

  const [sort, setSort] = useState('-createdAt');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Sync URL params to state on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters(prev => ({
      ...prev,
      category: params.get('category') || '',
      mood: params.get('mood') || '',
      problem: params.get('problem') || '',
      path: params.get('path') || '',
      search: params.get('q') || ''
    }));
  }, [location.search]);

  // Derived Options
  const availableOptions = useMemo(() => {
    const categories = [...new Set(books.map(b => b.category))].filter(Boolean);
    const moods = [...new Set(books.flatMap(b => b.moods || []))].filter(Boolean);
    return { categories, moods };
  }, [books]);

  // Filter & Sort Logic
  const processedBooks = useMemo(() => {
    let result = [...books];

    // Filter
    if (filters.category) result = result.filter(b => b.category === filters.category);
    if (filters.mood) result = result.filter(b => b.moods?.includes(filters.mood));
    if (filters.problem) result = result.filter(b => b.problems?.includes(filters.problem));
    if (filters.path) result = result.filter(b => b.readingPaths?.includes(filters.path));
    if (filters.search) result = result.filter(b => b.title.toLowerCase().includes(filters.search.toLowerCase()) || b.author.toLowerCase().includes(filters.search.toLowerCase()));
    
    result = result.filter(b => b.price <= filters.price);
    if (filters.minRating > 0) result = result.filter(b => b.rating >= filters.minRating);
    if (filters.inStock) result = result.filter(b => b.stock > 0);

    // Sort
    if (sort === '-createdAt') result.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sort === 'price') result.sort((a,b) => a.price - b.price);
    if (sort === '-price') result.sort((a,b) => b.price - a.price);
    if (sort === '-rating') result.sort((a,b) => b.rating - a.rating);

    return result;
  }, [books, filters, sort]);

  const paginatedBooks = processedBooks.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(processedBooks.length / itemsPerPage);

  const clearFilters = () => {
    setFilters({ category: '', mood: '', problem: '', path: '', price: 1000, minRating: 0, inStock: false, search: '' });
    navigate('/discover');
    setPage(1);
  };

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: key === 'price' ? 1000 : key === 'minRating' ? 0 : key === 'inStock' ? false : '' }));
  };

  if (loading) return <LoadingSpinner text="Dusting off the shelves..." />;

  // Getting active badge objects
  const activeBadges = Object.entries(filters).filter(([k, v]) => {
     if(k === 'price' && v === 1000) return false;
     if(k === 'minRating' && v === 0) return false;
     if(k === 'inStock' && v === false) return false;
     return v;
  });

  return (
    <div className="container min-h-screen pt-[100px] pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-2 border-borderWarm pb-6">
        <div>
           <div className="eyebrow text-terra">Discovery Engine</div>
           <h1 className="font-fredoka text-4xl text-brown">Find Your <em>Next Read</em></h1>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0 items-center">
            <span className="text-textMed font-bold">{processedBooks.length} results</span>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="bg-cream border-2 border-borderWarm rounded-xl px-4 py-2 text-primary font-bold outline-none"
            >
                <option value="-createdAt">Newest First</option>
                <option value="-rating">Top Rated</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
            </select>
            <div className="flex bg-borderWarm rounded-lg p-1">
                <button onClick={()=>setViewMode('grid')} className={`p-2 rounded ${viewMode==='grid'?'bg-white shadow-sm':'text-textMed'}`}>⊞</button>
                <button onClick={()=>setViewMode('list')} className={`p-2 rounded ${viewMode==='list'?'bg-white shadow-sm':'text-textMed'}`}>☰</button>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <FilterSidebar filters={filters} setFilters={setFilters} availableOptions={availableOptions} onClear={clearFilters} />

        {/* Main Content */}
        <div className="flex-1 w-full">
            
            {/* Active Badges */}
            {activeBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {activeBadges.map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2 bg-interior border border-borderWarm px-3 py-1 rounded-full text-sm">
                            <span className="text-textMed uppercase text-[10px] font-bold">{key}:</span>
                            <span className="font-bold text-primary">{val === true ? 'Yes' : val}</span>
                            <button onClick={() => removeFilter(key)} className="text-terra hover:text-red-600 font-bold ml-1">×</button>
                        </div>
                    ))}
                    <button onClick={clearFilters} className="text-sm underline text-textMed ml-2">Clear All</button>
                </div>
            )}

            {/* Results Grid/List */}
            {processedBooks.length === 0 ? (
                <div className="wood-panel text-center p-16 rounded-[var(--radius-xl)] flex flex-col items-center">
                    <span className="text-6xl mb-4">🌪️</span>
                    <h3 className="font-fredoka text-2xl text-cream mb-2">Shelf is Empty!</h3>
                    <p className="text-cream/80 max-w-md mx-auto">We couldn't find any books matching your exact criteria. Try removing some filters or asking the librarian.</p>
                </div>
            ) : (
                <>
                    <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8" 
                        : "flex flex-col gap-6"
                    }>
                        {paginatedBooks.map(book => (
                            <div key={book._id} className={viewMode === 'list' ? 'w-full max-w-3xl' : ''}>
                                {/* Assuming BookCard3D handles list mode gracefully or we adapt it, for now grid wrapper controls size */}
                                 <BookCard3D book={book} onClick={() => setModalBook(book)} listView={viewMode === 'list'} />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-12 pb-8">
                            <button 
                                disabled={page === 1} 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="clay-btn bg-interior border-2 border-borderWarm px-4 py-2 disabled:opacity-50"
                            >
                                ← Prev
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl font-bold border-2 ${page === i + 1 ? 'bg-primary border-primary text-white' : 'bg-interior border-borderWarm text-primary hover:border-primary'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button 
                                disabled={page === totalPages} 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="clay-btn bg-interior border-2 border-borderWarm px-4 py-2 disabled:opacity-50"
                            >
                                Next →
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
