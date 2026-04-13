import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], coupon: null });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], coupon: null });
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data.data || { items: [], coupon: null });
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (bookId, quantity = 1) => {
    try {
      const data = await cartService.addToCart(bookId, quantity);
      setCart(data.data);
      toast.success('Item added to your library vault! 🏺', {
        style: {
          background: 'var(--mint)',
          color: 'var(--forest)',
          fontWeight: 'bold',
          borderRadius: '12px',
          border: '2px solid var(--forest-glow)'
        }
      });
      return data;
    } catch (err) {
      toast.error('Failed to update archives. Please try again.');
      throw err;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    const data = await cartService.updateQuantity(itemId, quantity);
    setCart(data.data);
    return data;
  };

  const removeFromCart = async (itemId) => {
    const data = await cartService.removeFromCart(itemId);
    setCart(data.data);
    return data;
  };

  const clearCart = async () => {
    await cartService.clearCart();
    setCart({ items: [], coupon: null });
  };

  const applyCoupon = async (code) => {
    const data = await cartService.applyCoupon(code);
    setCart(data.data);
    return data;
  };

  const removeCoupon = async () => {
    const data = await cartService.removeCoupon();
    setCart(data.data);
    return data;
  };

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const totals = {
    subtotal: cart.subtotal || 0,
    tax: cart.tax || 0,
    shipping: cart.shipping || 0,
    total: cart.total || 0
  };

  const value = {
    cart,
    items: cart.items || [],
    loading,
    itemCount,
    totals,
    subtotal: totals.subtotal,
    addToCart,
    updateQty: updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    fetchCart,
    isOpen,
    openDrawer: () => setIsOpen(true),
    closeDrawer: () => setIsOpen(false)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export default CartContext;
