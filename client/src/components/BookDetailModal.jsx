import toast from 'react-hot-toast';

const BookDetailModal = ({ book, onClose }) => {
  if (!book) return null;
  const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-hero">
          <img
            className="modal-book-img"
            src={coverUrl}
            alt={book.title}
            onError={(e) => { e.target.src = `https://via.placeholder.com/125x180/16112a/f5a623?text=${encodeURIComponent(book.title)}`; }}
          />
          <div className="modal-overlay-grad"></div>
        </div>
        <div className="modal-body">
          <div className="modal-title">{book.title}</div>
          <div className="modal-author">by {book.author}</div>
          <div className="modal-tags">
            {book.tags?.map((t, i) => (
              <span key={i} className="tag" style={{ color: t.c, background: t.bg }}>{t.l}</span>
            ))}
          </div>
          <div className="info-card">
            <div className="info-label" style={{ color: 'var(--amber)' }}>💡 Why Read This?</div>
            <div className="info-text">{book.why}</div>
          </div>
          <div className="info-card">
            <div className="info-label" style={{ color: 'var(--green)' }}>✅ Best For</div>
            <div className="info-text">{book.shouldRead}</div>
          </div>
          <div className="info-card">
            <div className="info-label" style={{ color: '#ff5f5f' }}>⚠️ Who Should NOT Read</div>
            <div className="info-text">{book.shouldNot}</div>
          </div>
          <div className="info-card">
            <div className="info-label" style={{ color: 'var(--blue)' }}>🎯 Expected Outcome</div>
            <div className="info-text">{book.outcome}</div>
          </div>
          <p className="modal-time">⏱ Reading time: <span>{book.time}</span></p>
          <div className="modal-buy">
            <button className="modal-buy-btn amz" style={{ boxShadow: '0 0 20px rgba(255,153,0,0.2)' }} onClick={() => toast.success('Redirecting to Amazon...')}>🛒 Buy on Amazon</button>
            <button className="modal-buy-btn flip" style={{ boxShadow: '0 0 20px rgba(40,116,240,0.2)' }} onClick={() => toast.success('Redirecting to Flipkart...')}>🛒 Buy on Flipkart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
