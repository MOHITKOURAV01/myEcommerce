import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { BookCard3D } from './ShopComponents';
import { StarRating } from './InteractiveUI';
import { formatPrice, formatDate } from '../utils/site_utils';
import bookService from '../services/bookService';

// --- BookReviews.jsx ---
export const BookReviews = ({ reviews = [], rating, totalReviews }) => {
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    
    // Rating Breakdown Simulation
    const breakdown = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => Math.floor(r.rating) === star).length,
        percent: reviews.length > 0 ? (reviews.filter(r => Math.floor(r.rating) === star).length / reviews.length) * 100 : 0
    }));

    return (
        <section className="section-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="grid-2" style={{ gap: '60px', alignItems: 'flex-start' }}>
                {/* Breakdown & Form */}
                <div className="flex-col" style={{ gap: '40px' }}>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clay-cream)', marginBottom: '20px' }}>Reader Feedback</h3>
                        <div className="flex" style={{ gap: '30px', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>{rating}</div>
                                <StarRating rating={rating} size={14} />
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{totalReviews} reviews</div>
                            </div>
                            <div className="flex-col" style={{ flex: 1, gap: '8px' }}>
                                {breakdown.map(b => (
                                    <div key={b.star} className="flex" style={{ alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '20px' }}>{b.star}★</span>
                                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${b.percent}%` }} style={{ height: '100%', background: 'var(--amber)', borderRadius: '3px' }} />
                                        </div>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '30px', textAlign: 'right' }}>{Math.round(b.percent)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Write Review */}
                    <div className="wood-panel" style={{ padding: '30px' }}>
                        <h4 style={{ fontWeight: 900, marginBottom: '20px' }}>Write a Review</h4>
                        <div className="flex-col" style={{ gap: '16px' }}>
                            <div className="flex" style={{ alignItems: 'center', gap: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 700, opacity: 0.6 }}>Your Rating:</label>
                                <StarRating rating={reviewForm.rating} interactive onRate={(r) => setReviewForm({...reviewForm, rating: r})} />
                            </div>
                            <textarea 
                                className="clay-input" 
                                placeholder="Share your experience..." 
                                style={{ minHeight: '100px', resize: 'none' }}
                                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                            />
                            <button className="clay-btn" style={{ background: 'var(--forest)' }}>Submit Review</button>
                        </div>
                    </div>
                </div>

                {/* Review List */}
                <div className="flex-col" style={{ gap: '24px' }}>
                    {reviews.length === 0 ? (
                        <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.4 }}>
                            <FaStar size={32} style={{ marginBottom: '12px' }} />
                            <p>Be the first to leave a review!</p>
                        </div>
                    ) : (
                        reviews.map((r, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <div className="flex-between" style={{ marginBottom: '10px' }}>
                                    <div className="flex" style={{ alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', background: 'var(--terra)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{r.user.name[0]}</div>
                                        <span style={{ fontWeight: 800 }}>{r.user.name}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', opacity: 0.5 }}>{formatDate(r.createdAt)}</span>
                                </div>
                                <StarRating rating={r.rating} size={12} />
                                <p style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '12px', color: 'var(--text-med)' }}>{r.comment}</p>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

// --- RelatedBooks.jsx ---
export const RelatedBooks = ({ currentBookId }) => {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const data = await bookService.getSimilar(currentBookId);
                setBooks(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSimilar();
    }, [currentBookId]);

    return (
        <section className="section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex-between" style={{ marginBottom: '40px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clay-cream)' }}>Related Curiosities</h3>
                <div className="flex" style={{ gap: '12px' }}>
                    <button className="clay-btn btn-sm" style={{ background: 'transparent' }}><FaChevronLeft /></button>
                    <button className="clay-btn btn-sm" style={{ background: 'transparent' }}><FaChevronRight /></button>
                </div>
            </div>
            <div className="flex-wrap" style={{ gap: '30px' }}>
                {books.slice(0, 4).map(book => (
                    <div key={book._id} style={{ width: 'calc(25% - 23px)', minWidth: '220px' }}>
                        <BookCard3D book={book} />
                    </div>
                ))}
            </div>
        </section>
    );
};
