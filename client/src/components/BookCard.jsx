import toast from 'react-hot-toast';

const BookCard = ({ book, onClick }) => {
  const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;

  return (
    <div className="book-card reveal" onClick={onClick}>
      <div className="book-img-wrap">
        <img
          className="book-3d"
          src={coverUrl}
          alt={book.title}
          onError={(e) => { e.target.src = `https://via.placeholder.com/110x160/16112a/f5a623?text=${encodeURIComponent(book.title)}`; }}
        />
        <div className="book-overlay"></div>
        <span className="book-lang tag" style={{ color: book.langC, background: book.langBg }}>{book.lang}</span>
      </div>
      <div className="book-body">
        <div className="book-cat">{book.cat}</div>
        <div className="book-title">{book.title}</div>
        <div className="book-author">by {book.author}</div>
        <div className="book-tags">
          {book.tags?.map((t, i) => (
            <span key={i} className="tag" style={{ color: t.c, background: t.bg }}>{t.l}</span>
          ))}
        </div>
        <div className="book-footer">
          <span className="book-time">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {book.time}
          </span>
          <div className="buy-row" onClick={(e) => e.stopPropagation()}>
            <button className="buy-btn amz" onClick={() => toast.success('Opening Amazon...')}>Amazon</button>
            <button className="buy-btn flip" onClick={() => toast.success('Opening Flipkart...')}>Flipkart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
