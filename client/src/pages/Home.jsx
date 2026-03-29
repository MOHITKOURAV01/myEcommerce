import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BOOKS_DATA } from '../data/books';
import BookCard from '../components/BookCard';

const Home = ({ setModalBook }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div className="orb orb1"></div>
      <div className="orb orb2"></div>
      <div className="orb orb3"></div>

      {/* HERO */}
      <div className="hero">
        <div className="hero-left">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Smart Book Discovery for Indian Readers
          </div>
          <h1 className="hero-title">
            Find the book<br />that fits your<br /><span className="grad">life right now</span>
          </h1>
          <p className="hero-desc">Not just bestsellers. Not just categories. BookSmart recommends books based on your real problems, mood, and where you are in life — in Hindi &amp; English.</p>
          <div className="hero-search-box">
            <input placeholder="What's bothering you? Career? Focus? Confidence?..." />
            <button className="hero-search-btn" onClick={() => navigate('/discover')}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              Search
            </button>
          </div>
          <div className="hero-stats">
            <div><div className="stat-n">200+</div><div className="stat-l">Curated Books</div></div>
            <div><div className="stat-n">8</div><div className="stat-l">Life Problems</div></div>
            <div><div className="stat-n">3</div><div className="stat-l">Languages</div></div>
          </div>
        </div>

        <div className="hero-right">
          <div className="book-stack">
            <div className="floating-book book1" onClick={() => setModalBook(BOOKS_DATA[0])}>
              <img src="https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" alt="Atomic Habits" onError={(e) => { e.target.src = 'https://via.placeholder.com/140x210/1a1030/f5a623?text=Atomic+Habits' }} />
            </div>
            <div className="floating-book book2" onClick={() => setModalBook(BOOKS_DATA[1])}>
              <img src="https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg" alt="Ikigai" onError={(e) => { e.target.src = 'https://via.placeholder.com/155x230/0f0820/00e5a0?text=Ikigai' }} />
            </div>
            <div className="floating-book book3" onClick={() => setModalBook(BOOKS_DATA[2])}>
              <img src="https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg" alt="Rich Dad Poor Dad" onError={(e) => { e.target.src = 'https://via.placeholder.com/130x200/0a0618/4f8dff?text=Rich+Dad' }} />
            </div>
            <div className="floating-book book4" onClick={() => setModalBook(BOOKS_DATA[3])}>
              <img src="https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg" alt="Deep Work" onError={(e) => { e.target.src = 'https://via.placeholder.com/120x180/110d1e/ff5fa0?text=Deep+Work' }} />
            </div>
            <div className="floating-book book5" onClick={() => setModalBook(BOOKS_DATA[4])}>
              <img src="https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg" alt="How to Win Friends" onError={(e) => { e.target.src = 'https://via.placeholder.com/125x190/0d1a0a/00e5a0?text=Win+Friends' }} />
            </div>
          </div>
        </div>
      </div>

      {/* MOOD */}
      <div className="section reveal">
        <div className="sec-eyebrow">How are you feeling?</div>
        <h2 className="sec-title">Discover by <span style={{ color: 'var(--amber)' }}>Mood</span></h2>
        <p className="sec-sub">Tell us your emotional state and we'll find the perfect book for this moment</p>
        <div className="mood-grid">
          {[
            { img: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=128&h=128&fit=crop', name: '😔 Feeling Low', desc: 'Sadness, stress or emotional exhaustion pulling you down', count: '12 books →', mc: 'rgba(255,95,160,0.2)' },
            { img: 'https://images.unsplash.com/photo-1555374018-13a8994ab246?w=128&h=128&fit=crop', name: '😕 Confused', desc: 'Lost about life direction, career or relationships', count: '18 books →', mc: 'rgba(79,141,255,0.2)' },
            { img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=128&h=128&fit=crop', name: '🔥 Motivated', desc: 'Ready to take on the world and level up fast', count: '24 books →', mc: 'rgba(0,229,160,0.2)' },
            { img: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=128&h=128&fit=crop', name: '😴 Burned Out', desc: 'Exhausted, overwhelmed, need to reset and breathe', count: '15 books →', mc: 'rgba(245,166,35,0.2)' },
          ].map((m, i) => (
            <div key={i} className="mood-card" style={{ '--mc': m.mc }} onClick={() => navigate('/discover')}>
              <img className="mood-img" src={m.img} alt={m.name} onError={(e) => { e.target.style.display = 'none' }} />
              <div className="mood-name">{m.name}</div>
              <div className="mood-desc">{m.desc}</div>
              <div className="mood-count">{m.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED BOOKS */}
      <div className="section reveal">
        <div className="sec-eyebrow">Hand Picked</div>
        <h2 className="sec-title">Featured <span style={{ color: 'var(--amber)' }}>Books</span></h2>
        <p className="sec-sub">Curated for real-life Indian readers — students, job seekers &amp; beginners</p>
        <div className="books-row">
          {BOOKS_DATA.slice(0, 3).map((book, i) => (
            <BookCard key={i} book={book} onClick={() => setModalBook(book)} />
          ))}
        </div>
      </div>

      {/* PROBLEM SECTION */}
      <div className="section reveal">
        <div className="problem-wrap">
          <div>
            <div className="sec-eyebrow">Problem-Based Discovery</div>
            <h2 className="sec-title">Tell us your <span style={{ color: 'var(--amber)' }}>problem</span></h2>
            <p className="sec-sub" style={{ marginBottom: '1.75rem' }}>Select what you're going through and we'll recommend the exact books that helped thousands of others overcome it</p>
            <div className="prob-chips">
              {['Career Confusion', 'Low Confidence', 'Lack of Focus', 'Emotional Stress', 'Money & Finance', 'Communication'].map((p, i) => (
                <div key={i} className={`prob-chip${i === 0 ? ' active' : ''}`}>{p}</div>
              ))}
            </div>
            <button className="btn-cta" onClick={() => navigate('/discover')}>Show Matching Books →</button>
          </div>
          <div className="prob-visual">
            <img className="prob-img"
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=450&fit=crop"
              alt="Books"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600x450/16112a/f5a623?text=Books' }} />
          </div>
        </div>
      </div>

      {/* READING PATHS */}
      <div className="section reveal">
        <div className="sec-eyebrow">Curated Journeys</div>
        <h2 className="sec-title">Reading <span style={{ color: 'var(--amber)' }}>Paths</span></h2>
        <p className="sec-sub">Tailored book journeys for your life stage — not random lists</p>
        <div className="paths-grid">
          {[
            { img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop', name: 'Student', desc: 'Exams, placements & career beginnings', count: '24 books' },
            { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop', name: 'Job Seeker', desc: 'Interviews, skills & confidence', count: '18 books' },
            { img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop', name: 'Beginner Reader', desc: 'Build the habit, start easy', count: '15 books' },
            { img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop', name: 'Professional', desc: 'Leadership, focus & executive growth', count: '30 books' },
          ].map((p, i) => (
            <div key={i} className="path-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <img className="path-img" src={p.img} alt={p.name} onError={(e) => { e.target.src = `https://via.placeholder.com/400x250/16112a/f5a623?text=${p.name}` }} />
              <div className="path-body">
                <div className="path-name">{p.name}</div>
                <div className="path-desc">{p.desc}</div>
                <div className="path-count">{p.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
