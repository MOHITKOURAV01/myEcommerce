import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider, WishlistProvider } from './context/CartWishlistContext';

import Navbar from './components/Navbar';
import { Footer, BookDetailModal, AuthModal } from './components/ModalUI';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { CartDrawer } from './components/ShopComponents';
import { LoadingSpinner } from './components/InteractiveUI';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home'));
const Discover = lazy(() => import('./pages/Discover'));
const ReadingPaths = lazy(() => import('./pages/ReadingPaths'));
const About = lazy(() => import('./pages/About'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
// Admin
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminBooks     = lazy(() => import('./admin/AdminBooks'));
const AdminOrders    = lazy(() => import('./admin/AdminOrders'));
const AdminUsers     = lazy(() => import('./admin/AdminUsers'));

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function AnimatedRoutes({ setModalBook }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5, ease: 'circOut' }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}
      >
        <Suspense fallback={<LoadingSpinner label="Opening the library..." />}>
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home setModalBook={setModalBook} />} />
            <Route path="/discover" element={<Discover setModalBook={setModalBook} />} />
            <Route path="/search" element={<Discover setModalBook={setModalBook} />} />
            <Route path="/category/:slug" element={<Discover setModalBook={setModalBook} />} />
            <Route path="/book/:slug" element={<BookDetail />} />
            <Route path="/paths" element={<ReadingPaths setModalBook={setModalBook} />} />
            <Route path="/about" element={<About />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/books"     element={<AdminRoute><AdminBooks /></AdminRoute>} />
            <Route path="/admin/orders"    element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function MainLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [modalBook, setModalBook] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, type: 'login' });
  const [forgotPassOpen, setForgotPassOpen] = useState(false);

  useEffect(() => {
    const handleAuthModal = (e) => {
        const type = e.detail?.type || 'login';
        setAuthModal({ open: true, type });
    };
    window.addEventListener('auth-modal-open', handleAuthModal);
    return () => window.removeEventListener('auth-modal-open', handleAuthModal);
  }, []);

  useEffect(() => {
    const handler = () => { setAuthModal(a => ({...a, open: false})); setForgotPassOpen(true); };
    window.addEventListener('open-forgot-password', handler);
    return () => window.removeEventListener('open-forgot-password', handler);
  }, []);

  // Listen for openAuth state from Redirects
  useEffect(() => {
    if (location.state?.openAuth) {
      setTimeout(() => {
        setAuthModal({ open: true, type: location.state.openAuth });
      }, 0);
      // Clear state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: 'var(--interior)' }}>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--clay-cream)',
            color: 'var(--text-dark)',
            borderRadius: '12px',
            border: '2px solid #3A1A08',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700
          }
        }}
      />
      
      {!isLanding && <Navbar onAuthClick={(type) => setAuthModal({ open: true, type })} />}
      <CartDrawer />
      
      <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
        <AnimatedRoutes setModalBook={setModalBook} />
      </main>
      
      {!isLanding && <Footer />}

      <BookDetailModal 
        book={modalBook} 
        isOpen={!!modalBook} 
        onClose={() => setModalBook(null)} 
      />

      <AuthModal 
        isOpen={authModal.open} 
        type={authModal.type}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        onSwitch={() => setAuthModal({ ...authModal, type: authModal.type === 'login' ? 'register' : 'login' })}
      />

      <ForgotPasswordModal 
        isOpen={forgotPassOpen} 
        onClose={() => setForgotPassOpen(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <MainLayout />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
