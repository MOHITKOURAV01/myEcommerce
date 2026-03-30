import { useState, useCallback, useRef } from 'react';
import bookService from '../services/bookService';

export const useSearch = (debounceMs = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef(null);

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const data = await bookService.search(searchQuery, 8);
      setResults(data.data || []);
      setIsOpen(true);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = useCallback((value) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(value), debounceMs);
  }, [search, debounceMs]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { query, results, loading, isOpen, setIsOpen, handleChange, clear };
};

export default useSearch;
