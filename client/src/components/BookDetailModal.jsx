import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookDetailModal({ book, onClose }) {
  if (!book) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="open-book-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
        >
          {/* Left page — cover */}
          <div className="book-left-page">
            <img src={book.coverUrl || `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`} alt={book.title} />
          </div>

          {/* Center spine */}
          <div className="book-center-spine" />

          {/* Right page — details */}
          <div className="book-right-page">
            <h2>{book.title}</h2>
            <p className="book-author">by {book.author}</p>
            
            <div className="book-tags">
              {book.moods && book.moods.map(m => (
                <span key={m} className="book-tag">{m}</span>
              ))}
              {book.problems && book.problems.map(p => (
                <span key={p} className="book-tag">{p}</span>
              ))}
            </div>

            <div className="detail-section why">
              <div className="section-stamp">Why Read?</div>
              <p>{book.why || "This book offers incredible insights that will change your perspective."}</p>
            </div>
            
            <div className="detail-section for">
              <div className="section-stamp">Best For</div>
              <p>{book.shouldRead || "Anyone looking to improve their understanding of this topic."}</p>
            </div>
            
            <div className="detail-section not">
              <div className="section-stamp">Not For</div>
              <p>{book.shouldNot || "Those who are not ready for deep analytical concepts."}</p>
            </div>

            <div className="buy-btns">
              {book.amazonLink && (
                <button className="clay-btn amz-btn" onClick={() => window.open(book.amazonLink, '_blank')}>
                  Buy on Amazon
                </button>
              )}
              {book.flipkartLink && (
                <button className="clay-btn flip-btn" onClick={() => window.open(book.flipkartLink, '_blank')}>
                  Buy on Flipkart
                </button>
              )}
            </div>
            
            <button className="close-book" onClick={onClose}>Close</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
