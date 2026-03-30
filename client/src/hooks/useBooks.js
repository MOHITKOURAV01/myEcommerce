import { useState, useEffect, useCallback } from 'react';
import bookService from '../services/bookService';

export const useBooks = (filters = {}, deps = []) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const loadBooks = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookService.getBooks(filters);
      setBooks(data.data || []);
      setPagination({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
      });
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        setError(err.response?.data?.message || 'Failed to fetch books');
        setBooks([]);
      }
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks, ...deps]);

  return { books, loading, error, pagination, refetch: loadBooks };
};

export const useFeaturedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await bookService.getFeatured();
        setBooks(data.data || []);
      } catch (err) {
        console.error('Failed to fetch featured books:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { books, loading };
};

export const useBook = (idOrSlug) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idOrSlug) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await bookService.getBook(idOrSlug);
        setBook(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Book not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idOrSlug]);

  return { book, loading, error };
};

export const usePathBooks = (path) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await bookService.getByPath(path);
        setBooks(data.data || []);
      } catch (err) {
        console.error(`Failed to fetch ${path} books:`, err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [path]);

  return { books, loading };
};

export default useBooks;
