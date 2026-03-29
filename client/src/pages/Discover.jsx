import { useState, useEffect } from 'react';
import { BOOKS_DATA } from '../data/books';
import BookCard from '../components/BookCard';

const Discover = ({ setModalBook }) => {
  const [activeMood, setActiveMood] = useState('All');
  const moods = ['All', 'Motivated', 'Confused', 'Feeling Low', 'Burned Out'];

  const filteredBooks = activeMood === 'All'
    ? BOOKS_DATA
    : BOOKS_DATA.filter(b => b.moods?.includes(activeMood));

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [filteredBooks]);

  return (
    <div className="section" style={{ paddingTop: '6rem' }}>
      <div className="sec-eyebrow">All Books</div>
      <h2 className="sec-title">Discover <span style={{ color: 'var(--amber)' }}>Your Book</span></h2>
      <div className="filter-pills">
        {moods.map(m => (
          <div
            key={m}
            className={`prob-chip${activeMood === m ? ' active' : ''}`}
            onClick={() => setActiveMood(m)}
          >
            {m}
          </div>
        ))}
      </div>
      <div className="books-row">
        {filteredBooks.map((book, i) => (
          <BookCard key={i} book={book} onClick={() => setModalBook(book)} />
        ))}
      </div>
    </div>
  );
};

export default Discover;
