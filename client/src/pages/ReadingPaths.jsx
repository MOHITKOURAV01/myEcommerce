import React, { useState } from 'react';
import useBooks from '../hooks/useBooks';
import ShopDoor from '../components/ShopDoor';
import BookCard3D from '../components/BookCard3D';

const PATHS = [
  { id: 'student', name: 'Student Room', desc: 'For exams & learning', count: 24 },
  { id: 'career', name: 'Job Seeker', desc: 'Interview prep & skills', count: 18 },
  { id: 'beginner', name: 'New Reader', desc: 'Easy to read books', count: 32 },
  { id: 'pro', name: 'Professional', desc: 'Leadership & deep work', count: 15 },
];

export default function ReadingPaths({ setModalBook }) {
  const { books } = useBooks();

  return (
    <div className="container section" style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 className="sec-title">Explore Reading <em>Rooms</em></h2>
        <p style={{ opacity: 0.8, fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Open a door to find curated collections specifically for your current life phase.
        </p>
        <div className="grid-4" style={{ marginBottom: '60px' }}>
          {PATHS.map(path => (
            <ShopDoor key={path.id} path={path} />
          ))}
        </div>
      </div>

      <div className="divider" style={{ opacity: 0.5, marginBottom: '60px' }} />

      {/* Path details */}
      <div className="flex-col" style={{ gap: '60px' }}>
        {PATHS.map((path, idx) => {
          // Just mock filtering: display random slice
          const booksForPath = books.slice(idx * 4, idx * 4 + 4);
          
          return (
            <div key={path.id} id={path.id} className="wood-panel" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className="flex" style={{ alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--wood)', padding: '12px 24px', borderRadius: '12px', border: '3px solid var(--wood-lt)', boxShadow: 'var(--clay-shadow-md)' }}>
                  <h3 style={{ fontSize: '24px', color: 'var(--clay-cream)', margin: 0, padding: 0 }}>{path.name}</h3>
                </div>
                <div style={{ flex: 1, height: '4px', background: 'var(--wood-dk)', borderRadius: '2px' }} />
              </div>
              
              <div style={{ padding: '0 20px' }}>
                <div className="grid-4" style={{ marginBottom: '16px' }}>
                  {booksForPath.map(book => (
                    <BookCard3D key={book._id || book.isbn} book={book} onClick={() => setModalBook(book)} />
                  ))}
                </div>
                <div className="shelf-plank" style={{ width: '100%' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
