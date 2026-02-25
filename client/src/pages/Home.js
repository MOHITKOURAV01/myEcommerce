import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import './Home.css';

function Home() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ language: '', mood: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchBooks();
        // eslint-disable-next-line
    }, [filters, currentPage]);

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:5000/api/books', {
                params: {
                    language: filters.language || undefined,
                    mood: filters.mood || undefined,
                    page: currentPage,
                    limit: 8 // Displaying 8 books per page
                }
            });

            setBooks(response.data.data.books || []);
            setTotalPages(response.data.data.totalPages || 1);
        } catch (err) {
            console.error("Error fetching books:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    if (loading) return <p>Loading books...</p>;

    return (
        <div className="home-container">
            <header className="home-header">
                <p>Find your next great read.</p>
            </header>

            <main className="home-main">
                <FilterBar filters={filters} setFilters={setFilters} />

                {error && <p className="error-message">{error}</p>}

                {!loading && !error && books.length === 0 && (
                    <p className="empty-message">No books found for selected filters.</p>
                )}

                {!loading && !error && books.length > 0 && (
                    <>
                        <div className="books-grid">
                            {books.map((book) => (
                                <BookCard key={book._id || book.id} book={book} />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            setCurrentPage={setCurrentPage}
                        />
                    </>
                )}
            </main>
        </div>
    );
}

export default Home;
