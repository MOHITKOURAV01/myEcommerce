import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist');
      setWishlist(data.data?.books || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (bookId) => {
    const { data } = await api.post('/wishlist', { bookId });
    setWishlist(data.data?.books || []);
    return data;
  };

  const removeFromWishlist = async (bookId) => {
    const { data } = await api.delete(`/wishlist/${bookId}`);
    setWishlist(data.data?.books || []);
    return data;
  };

  const isInWishlist = (bookId) => {
    return wishlist.some(book => {
      const id = typeof book === 'object' ? book._id : book;
      return id === bookId;
    });
  };

  const toggleWishlist = async (bookId) => {
    if (isInWishlist(bookId)) {
      return removeFromWishlist(bookId);
    }
    return addToWishlist(bookId);
  };

  const value = {
    wishlist,
    loading,
    wishlistCount: wishlist.length,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};

export default WishlistContext;
