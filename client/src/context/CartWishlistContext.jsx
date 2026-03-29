import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import { cartService } from '../services/api_services';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const WishlistContext = createContext(null);

// --- CartProvider ---
export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState({ items: [], coupon: null });
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const syncTimeoutRef = useRef(null);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        try {
            const data = await cartService.getCart();
            setCart(data.data);
        } catch (err) {
            console.error("Cart fetch error", err);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (bookId, quantity = 1) => {
        // Optimistic update
        setCart(prev => {
            const existing = prev.items.find(i => i.book._id === bookId);
            if (existing) {
                return { ...prev, items: prev.items.map(i => i.book._id === bookId ? { ...i, quantity: i.quantity + quantity } : i) };
            }
            return prev; // Real add handled by API
        });

        try {
            const { data } = await cartService.addItem(bookId, quantity);
            setCart(data);
            setIsOpen(true);
        } catch (err) {
            fetchCart(); // Rollback
        }
    };

    const updateQty = (bookId, quantity) => {
        if (quantity < 1) return removeFromCart(bookId);

        // Optimistic UI
        setCart(prev => ({
            ...prev,
            items: prev.items.map(i => i.book._id === bookId ? { ...i, quantity } : i)
        }));

        // Debounced sync (500ms)
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
            try {
                const { data } = await cartService.updateItem(bookId, quantity);
                setCart(data);
            } catch (err) {
                fetchCart(); // Rollback
            }
        }, 500);
    };

    const removeFromCart = async (bookId) => {
        setCart(prev => ({
            ...prev,
            items: prev.items.filter(i => i.book._id !== bookId)
        }));
        try {
            const { data } = await cartService.removeItem(bookId);
            setCart(data);
        } catch (err) {
            fetchCart();
        }
    };

    const totals = useMemo(() => {
        const subtotal = cart.items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
        const discount = cart.coupon ? (subtotal * (cart.coupon.discount / 100)) : 0;
        return { subtotal, discount, total: subtotal - discount };
    }, [cart]);

    const value = {
        items: cart.items,
        coupon: cart.coupon,
        totals,
        itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
        isOpen,
        isLoading,
        openDrawer: () => setIsOpen(true),
        closeDrawer: () => setIsOpen(false),
        addToCart,
        updateQty,
        removeFromCart,
        clearCart: () => setCart({ items: [], coupon: null }),
        refreshCart: fetchCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// --- WishlistProvider ---
export const WishlistProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [wishlist, setWishlist] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);

    const fetchWishlist = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        try {
            const { data } = await api.get('/wishlist');
            setWishlist(new Set(data.data.map(item => item.book._id)));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = async (bookId) => {
        if (!isAuthenticated) return window.dispatchEvent(new Event('auth-modal-open'));

        // Optimistic
        const wasIn = wishlist.has(bookId);
        setWishlist(prev => {
            const next = new Set(prev);
            if (wasIn) next.delete(bookId);
            else next.add(bookId);
            return next;
        });

        try {
            if (wasIn) await api.delete(`/wishlist/${bookId}`);
            else await api.post('/wishlist', { bookId });
        } catch (err) {
            fetchWishlist(); // Rollback
        }
    };

    const value = {
        wishlist,
        isLoading,
        toggleWishlist,
        isInWishlist: (bookId) => wishlist.has(bookId)
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useCart = () => useContext(CartContext);
export const useWishlist = () => useContext(WishlistContext);
