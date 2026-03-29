import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');

  return (
    <nav>
      <Link to="/" className="logo">BookSmart</Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
        <Link to="/discover" className={`nav-link${location.pathname === '/discover' ? ' active' : ''}`}>Discover</Link>
        <Link to="/paths" className={`nav-link${location.pathname === '/paths' ? ' active' : ''}`}>Reading Paths</Link>
        <Link to="/about" className={`nav-link${location.pathname === '/about' ? ' active' : ''}`}>About</Link>
      </div>
      <div className="nav-right">
        <div className="nav-search">
          <FiSearch size={14} color="var(--muted)" />
          <input
            placeholder="Search books, moods..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Link to="/discover">
          <button className="btn-cta">Find My Book →</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
