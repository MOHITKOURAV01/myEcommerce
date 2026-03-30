import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth as useAuthContext } from '../context/AuthContext';
import { useCart as useCartContext, useWishlist as useWishlistContext } from '../context/CartWishlistContext';
import { orderService } from '../services/api_services';

// --- useLocalStorage(key, initialValue) ---
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
};

// --- useBooks(filters) ---
export const useBooks = (filters = {}) => {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBooks = useCallback(async (signal) => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/books', { params: filters, signal });
            setBooks(data.data);
        } catch (err) {
            if (err.name !== 'CanceledError') setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        const controller = new AbortController();
        fetchBooks(controller.signal);
        return () => controller.abort();
    }, [fetchBooks]);

    return { books, isLoading, error, refetch: () => fetchBooks() };
};

// --- useSearch(delay = 300) ---
export const useSearch = (delay = 300) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ books: [], authors: [], categories: [] });
    const [isSearching, setIsSearching] = useState(false);
    const timeoutRef = useRef(null);
    const controllerRef = useRef(null);

    const search = async (q) => {
        if (!q) {
            setResults({ books: [], authors: [], categories: [] });
            return;
        }

        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController();

        setIsSearching(true);
        try {
            const { data } = await api.get(`/books/search?q=${q}`, { signal: controllerRef.current.signal });
            setResults(data.data);
        } catch (err) {
            if (err.name !== 'CanceledError') console.error("Search error", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleQueryChange = (newQuery) => {
        setQuery(newQuery);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => search(newQuery), delay);
    };

    return { query, results, isSearching, handleQueryChange };
};

// --- Export Context Hooks directly ---
export const useAuth = () => useAuthContext();
export const useCart = () => useCartContext();
export const useWishlist = () => useWishlistContext();

// --- useOrders ---
export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await orderService.getOrders();
            setOrders(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return { orders, isLoading, fetchOrders };
};
