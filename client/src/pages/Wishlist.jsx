import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { useWishlist, useCart, useAuth } from '../hooks/index_hooks';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch full book details for wishlisted IDs
  useEffect(() => {
    if (!isAuthenticated) { navigate('/home'); return; }
    const fetchWishlistBooks = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/wishlist');
        // API returns {data: {books: [...]}} or {data: [...]}
        const booksData = data.data?.books || data.data || [];
        setBooks(booksData);
      } catch (err) {
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistBooks();
  }, [isAuthenticated]);

  // Remove from wishlist
  const handleRemove = async (bookId) => {
    await toggleWishlist(bookId);
    setBooks(prev => prev.filter(b => b._id !== bookId));
    toast.success('Removed from wishlist');
  };

  // Move to cart
  const handleMoveToCart = async (book) => {
    try {
      await addToCart(book._id);
      await handleRemove(book._id);
      toast.success(`"${book.title}" moved to cart!`);
    } catch (err) {
      toast.error('Failed to move to cart');
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Loading your wishlist...</p>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '100px', maxWidth: '1200px' }}>
      <div className="flex flex-col items-center text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-terra/10 text-terra px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-6 border border-terra/20"
        >
          Your Personal Collection
        </motion.div>
        <h1 className="sec-title text-center text-5xl mb-4 font-black">
          The <em className="text-terra">Archive</em> Vault
        </h1>
        <p className="text-cream/40 font-bold text-sm tracking-widest uppercase">
          {books.length} Saved Relics in your possession
        </p>
      </div>

      {books.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-20 wood-panel rounded-[40px] border-2 border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="w-24 h-24 bg-forest/20 rounded-full flex-center mb-8 border-2 border-white/5">
            <FaHeart className="text-terra/40 text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-cream mb-4">Your archives are silent</h2>
          <p className="text-cream/40 mb-10 max-w-md text-center">Save the books that speak to your soul and they shall await you here in the vault.</p>
          <button className="clay-btn btn-primary px-10 py-5" onClick={() => navigate('/discover')}>
            EXPLORE THE LIBRARY
          </button>
        </motion.div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '30px' 
        }}>
          {books.map((book, i) => (
            <motion.div
              key={book._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, ease: "circOut" }}
              className="group relative"
            >
              <div 
                className="wood-panel rounded-[24px] overflow-hidden border-2 border-white/5 transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                style={{ background: 'rgba(58,26,8,0.3)' }}
              >
                {/* Book Cover Container */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: book.inStock ? 'none' : 'grayscale(0.8) sepia(0.5)' }}
                  />
                  
                  {/* Stock Badge Overlay */}
                  {!book.inStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex-center">
                      <span className="bg-terra text-white px-3 py-1.5 rounded-full font-black text-[9px] tracking-widest uppercase shadow-xl">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}

                  {/* Quick Removal Seal */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(book._id); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/40 backdrop-blur-md text-white/50 hover:text-terra hover:bg-black/60 transition-all border border-white/10 flex-center"
                    title="Erase from archives"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>

                {/* Content Panel */}
                <div className="p-5">
                  <h3 className="text-base font-black text-cream truncate leading-tight mb-0.5 cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/book/${book.slug}`)}>
                    {book.title}
                  </h3>
                  <p className="text-cream/40 text-[9px] font-black tracking-[0.2em] uppercase mb-3 italic">
                    {book.author}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-black text-mint">₹{book.price}</span>
                    </div>
                    {book.inStock && (
                      <button
                        className="w-9 h-9 rounded-xl bg-forest/20 text-mint border border-mint/20 flex-center hover:bg-mint hover:text-forest transition-all"
                        onClick={() => handleMoveToCart(book)}
                        title="Add to Shelf"
                      >
                        <FaShoppingCart size={14} />
                      </button>
                    )}
                  </div>

                  <button
                    className="clay-btn btn-primary py-3 text-[12px] font-black w-full tracking-[0.2em] mt-auto"
                    onClick={async () => {
                      await addToCart(book._id);
                      navigate('/checkout');
                    }}
                  >
                    BUY NOW
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
     </div>
  );
}
