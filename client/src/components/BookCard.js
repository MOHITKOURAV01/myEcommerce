import React from 'react';
import './BookCard.css';

function BookCard({ book }) {
    const handleBuy = () => {
        console.log(`Buy Now clicked for: ${book.title}`);
    };

    return (
        <div className="book-card">
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">By {book.author}</p>
            <p className="book-description">{book.description || "No description available."}</p>
            <p className="book-price">${book.price}</p>
            <button className="buy-button" onClick={handleBuy}>Buy Now</button>
        </div>
    );
}

export default BookCard;
