import React from 'react';

export default function BookCard3D({ book, onClick }) {
  if (!book) return null;
  const cover = book.coverUrl || `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;

  return (
    <div 
      className="book-card-3d" 
      onClick={() => onClick(book)}
      style={{ backgroundImage: `url(${cover})` }}
    >
      <div className="book-spine" />
      <div className="book-pages" />
      
      <div className="book-tooltip">
        <h4>{book.title}</h4>
        <p>by {book.author}</p>
        {book.moods && book.moods.length > 0 && <p style={{ marginTop: '4px', color: 'var(--amber)' }}>{book.moods[0]}</p>}
      </div>
    </div>
  );
}
