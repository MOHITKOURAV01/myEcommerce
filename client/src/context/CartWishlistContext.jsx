import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import { cartService } from '../services/api_services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const WishlistContext = createContext(null);

// --- CartProvider ---
export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : { items: [], coupon: null };
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const syncTimeoutRef = useRef(null);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        try {
            const { data } = await cartService.getCart();
            // Merge with local items if needed, but here we trust server data
            setCart(data);
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
        if (!isAuthenticated) {
            return window.dispatchEvent(new CustomEvent('auth-modal-open', { detail: { type: 'login' } }));
        }
        
        // Better Optimistic update
        setCart(prev => {
            const items = [...(prev.items || [])];
            const existingIdx = items.findIndex(i => (i.book?._id || i._id) === bookId);
            if (existingIdx > -1) {
                items[existingIdx] = { ...items[existingIdx], quantity: items[existingIdx].quantity + quantity };
                return { ...prev, items };
            }
            // For new items, we can't fully populate here, but we can show a placeholder
            return prev; 
        });

        try {
            const { data } = await cartService.addItem(bookId, quantity);
            const cartData = data.data || data;
            setCart(cartData);
            setIsOpen(true);
            toast.success("Shelf updated! 🏺");
        } catch (err) {
            fetchCart(); // Rollback
            toast.error("Failed to update shelf");
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
        const items = cart.items || [];
        const subtotal = items.reduce((sum, item) => {
            const price = item.price || item.book?.price || 0;
            return sum + (price * item.quantity);
        }, 0);
        const couponDiscount = cart.coupon
            ? (cart.coupon.type === 'percent'
                ? Math.min(Math.round(subtotal * cart.coupon.value / 100), cart.coupon.maxDiscount || Infinity)
                : (cart.coupon.value || 0))
            : 0;
        const shipping = subtotal > 0 && subtotal < 499 ? 49 : 0;
        const tax = Math.round((subtotal - couponDiscount) * 0.18);
        const total = Math.max(0, subtotal - couponDiscount + shipping + tax);
        return { subtotal, couponDiscount, shipping, tax, total };
    }, [cart.items, cart.coupon]);

    const applyCoupon = async (code) => {
        const { data } = await cartService.applyCoupon(code);
        setCart(data);
        return data;
    };

    const removeCoupon = async () => {
        try {
            const { data } = await cartService.removeCoupon();
            setCart(data);
        } catch (err) {
            fetchCart();
        }
    };

    const value = {
        items: cart.items || [],
        coupon: cart.coupon || null,
        totals,
        itemCount: (cart.items || []).reduce((sum, i) => sum + i.quantity, 0),
        isOpen,
        isLoading,
        openDrawer: () => setIsOpen(true),
        closeDrawer: () => setIsOpen(false),
        addToCart,
        updateQty,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart: async () => {
            await cartService.clearCart();
            setCart({ items: [], coupon: null });
            setIsOpen(false);
        },
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
            const books = data.data?.books || data.data || [];
            const ids = books.map(b => (typeof b === 'object' ? (b.book?._id || b._id) : b));
            setWishlist(new Set(ids));
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
            if (wasIn) {
                await api.delete(`/wishlist/${bookId}`);
                toast.success("Removed from Desire Vault");
            } else {
                await api.post('/wishlist', { bookId });
                toast.success("Added to Desire Vault! ❤️🏺", {
                    style: {
                        background: 'var(--mint)',
                        color: 'var(--forest)',
                        fontWeight: 'bold'
                    }
                });
            }
        } catch (err) {
            fetchWishlist(); // Rollback
            toast.error("Failed to update vault");
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
