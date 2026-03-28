import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Discover from './pages/Discover';
import BookDetailModal from './components/BookDetailModal';
import { Toaster } from 'react-hot-toast';

const ReadingPaths = () => <div className="placeholder-page">Reading Paths (To be built)</div>;
const About = () => <div className="placeholder-page">About BookSmart (To be built)</div>;

function App() {
  const [modalBook, setModalBook] = useState(null);

  return (
    <Router>
      <div className="app-wrapper">
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#16112a', color: '#fff', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' } }} />
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home setModalBook={setModalBook} />} />
            <Route path="/discover" element={<Discover setModalBook={setModalBook} />} />
            <Route path="/paths" element={<ReadingPaths />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <BookDetailModal book={modalBook} onClose={() => setModalBook(null)} />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
