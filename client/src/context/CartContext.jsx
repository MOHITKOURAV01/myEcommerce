import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], coupon: null });
  const [loading, setLoading] = useState(false);

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
    const data = await cartService.addToCart(bookId, quantity);
    setCart(data.data);
    return data;
  };

  const updateQuantity = async (itemId, quantity) => {
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

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.book?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const value = {
    cart,
    loading,
    itemCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    fetchCart,
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
