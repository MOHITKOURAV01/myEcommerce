import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar,
         FaWhatsapp, FaLink, FaShoppingCart, FaBolt, FaChevronLeft,
         FaChevronRight, FaCheckCircle, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { useAuth, useCart, useWishlist } from '../hooks/index_hooks';
import api from '../services/api';

export default function BookDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  // Fetch book by slug
  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/books/${slug}`);
        setBook(data.data);
        // Fetch reviews
        const revRes = await api.get(`/reviews/book/${data.data._id}`);
        setReviews(revRes.data.data || []);
        // Fetch related
        const relRes = await api.get(`/books/similar/${data.data._id}`);
        setRelatedBooks(relRes.data.data || []);
      } catch (err) {
        toast.error('Book not found');
        navigate('/discover');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new Event('auth-modal-open'));
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(book._id, quantity);
      toast.success(`"${book.title}" added to cart! 🛒`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleCheckDelivery = () => {
    if (pincode.length !== 6) return toast.error('Enter valid 6-digit pincode');
    // Simulate delivery check
    const days = Math.floor(Math.random() * 3) + 3;
    const date = new Date();
    date.setDate(date.getDate() + days);
    setDeliveryInfo(`Estimated delivery by ${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { window.dispatchEvent(new Event('auth-modal-open')); return; }
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/reviews', { ...reviewForm, book: book._id });
      setReviews(prev => [data.data, ...prev]);
      setReviewForm({ rating: 5, title: '', body: '' });
      toast.success('Review submitted! Thank you 📚');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=Check out "${book.title}" on BookSmart: ${url}`);
    if (platform === 'copy') { navigator.clipboard.writeText(url); toast.success('Link copied!'); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontWeight: 700 }}>
          Fetching book details...
        </p>
      </div>
    </div>
  );

  if (!book) return null;

  const discountPct = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : book.discount || 0;

  const avgRating = book.rating || 0;
  const ratingBreakdown = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
    pct: reviews.length ? Math.round((reviews.filter(r => Math.round(r.rating) === star).length / reviews.length) * 100) : 0
  }));

  return (
    <div style={{ paddingTop: '80px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">

        {/* Breadcrumb */}
        <nav style={{ marginBottom: '32px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>
          <Link to="/home" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/discover" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Discover</Link>
          {book.category && <><span>/</span><Link to={`/category/${book.category.slug}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{book.category.name}</Link></>}
          <span>/</span>
          <span style={{ color: 'var(--text-warm)' }}>{book.title}</span>
        </nav>

        {/* Main 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '48px', alignItems: 'start' }} className="book-detail-grid">

          {/* LEFT: Cover + Share */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', cursor: 'zoom-in', background: 'var(--interior)' }}
            >
              <img
                src={book.coverUrl}
                alt={book.title}
                style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.src = `https://placehold.co/340x510/2C1F0E/F2E4C8?text=${encodeURIComponent(book.title)}`; }}
              />
            </motion.div>

            {/* Share */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center' }}>
              <button onClick={() => handleShare('whatsapp')} className="clay-btn btn-ghost btn-sm" style={{ flex: 1, fontSize: '13px' }}>
                <FaWhatsapp color="#25D366" /> Share
              </button>
              <button onClick={() => handleShare('copy')} className="clay-btn btn-ghost btn-sm" style={{ flex: 1, fontSize: '13px' }}>
                <FaLink /> Copy Link
              </button>
            </div>

            {/* Affiliate Links */}
            {(book.amazonLink || book.flipkartLink) && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'var(--interior2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Also available on</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {book.amazonLink && (
                    <a href={book.amazonLink} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, background: '#FF9900', color: '#111', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 900, textAlign: 'center', textDecoration: 'none' }}>
                      Amazon ↗
                    </a>
                  )}
                  {book.flipkartLink && (
                    <a href={book.flipkartLink} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, background: '#2874F0', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 900, textAlign: 'center', textDecoration: 'none' }}>
                      Flipkart ↗
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: All book info */}
          <div>
            {/* Category + Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {book.category && <span className="badge badge-forest">{book.category.name}</span>}
              {book.bestseller && <span className="badge badge-hot">Bestseller</span>}
              {book.newArrival && <span className="badge badge-new">New</span>}
              {book.trending && <span className="badge badge-amber">Trending</span>}
              <span className="badge badge-sand">{book.language}</span>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--text-warm)', lineHeight: 1.15, margin: '0 0 8px 0' }}>
              {book.title}
            </h1>
            <p style={{ color: 'var(--text-med)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              by <span style={{ color: 'var(--terra-lt)', cursor: 'pointer' }} onClick={() => navigate(`/discover?author=${encodeURIComponent(book.author)}`)}>{book.author}</span>
            </p>

            {/* Rating Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[1,2,3,4,5].map(s => {
                  const filled = avgRating >= s;
                  const half = !filled && avgRating >= s - 0.5;
                  return half
                    ? <FaStarHalfAlt key={s} color="var(--gold)" size={18} />
                    : <FaStar key={s} color={filled ? 'var(--gold)' : 'var(--interior3)'} size={18} />;
                })}
              </div>
              <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '16px' }}>{avgRating.toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>({book.numReviews} reviews)</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>•</span>
              <button onClick={() => setActiveTab('reviews')} style={{ background: 'none', border: 'none', color: 'var(--terra-lt)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                Write a review
              </button>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '20px', background: 'var(--interior2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
              <span style={{ fontFamily: 'var(--font-editorial)', fontSize: '40px', fontWeight: 700, color: 'var(--forest-glow)' }}>
                ₹{book.price.toLocaleString('en-IN')}
              </span>
              {book.originalPrice && (
                <>
                  <span style={{ fontSize: '18px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₹{book.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{ background: 'var(--terra)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '14px', fontWeight: 900 }}>
                    {discountPct}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Book meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
              {book.pages && <span className="badge badge-sand">📄 {book.pages} pages</span>}
              {book.publisher && <span className="badge badge-sand">🏢 {book.publisher}</span>}
              {book.publishedYear && <span className="badge badge-sand">📅 {book.publishedYear}</span>}
              {book.readingTime && <span className="badge badge-sand">⏱ {book.readingTime}</span>}
              {book.readingLevel && <span className="badge badge-forest">{book.readingLevel}</span>}
            </div>

            {/* Stock */}
            <div style={{ marginBottom: '20px' }}>
              {book.inStock ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-glow)', fontWeight: 800, fontSize: '14px' }}>
                  <FaCheckCircle />
                  In Stock{book.stock < 20 ? ` — Only ${book.stock} left!` : ''}
                </div>
              ) : (
                <div style={{ color: 'var(--terra-lt)', fontWeight: 800, fontSize: '14px' }}>⚠ Out of Stock</div>
              )}
            </div>

            {/* Quantity + Buttons */}
            {book.inStock && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty:</span>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--interior2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)', overflow: 'hidden' }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{ padding: '10px 18px', background: 'none', border: 'none', color: 'var(--terra-lt)', fontWeight: 900, fontSize: '20px', cursor: 'pointer' }}>
                      −
                    </button>
                    <span style={{ padding: '10px 16px', fontWeight: 900, color: 'var(--text-warm)', fontSize: '16px', minWidth: '40px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(Math.min(book.stock, 10), q + 1))}
                      style={{ padding: '10px 18px', background: 'none', border: 'none', color: 'var(--forest-glow)', fontWeight: 900, fontSize: '20px', cursor: 'pointer' }}>
                      +
                    </button>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Max 10 per order</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <button
                    className="clay-btn btn-primary btn-lg"
                    style={{ flex: 1, opacity: addingToCart ? 0.7 : 1 }}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    <FaShoppingCart /> {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button
                    className="clay-btn btn-gold btn-lg"
                    style={{ flex: 1 }}
                    onClick={handleBuyNow}
                  >
                    <FaBolt /> Buy Now
                  </button>
                  <button
                    className="clay-btn btn-ghost btn-icon"
                    onClick={() => {
                      if (!isAuthenticated) { window.dispatchEvent(new Event('auth-modal-open')); return; }
                      toggleWishlist(book._id);
                    }}
                    title="Add to Wishlist"
                  >
                    {isInWishlist(book._id)
                      ? <FaHeart color="var(--terra)" size={20} />
                      : <FaRegHeart size={20} />}
                  </button>
                </div>
              </>
            )}

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '20px', padding: '16px', background: 'var(--interior2)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-warm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>
                <FaTruck color="var(--forest-glow)" size={16} /> Free delivery above ₹499
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>
                <FaShieldAlt color="var(--amber)" size={16} /> Secure payments
              </div>
            </div>

            {/* Delivery checker */}
            <div style={{ padding: '16px', background: 'var(--interior2)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-warm)' }}>
              <p style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check Delivery</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="clay-input"
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setDeliveryInfo(null); }}
                  style={{ flex: 1 }}
                />
                <button className="clay-btn btn-ghost btn-sm" onClick={handleCheckDelivery}>Check</button>
              </div>
              {deliveryInfo && (
                <p style={{ color: 'var(--forest-glow)', fontSize: '13px', fontWeight: 700, marginTop: '8px' }}>
                  <FaTruck style={{ marginRight: '6px' }} /> {deliveryInfo}
                </p>
              )}
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '2px solid var(--border-warm)', display: 'flex', gap: '0', marginBottom: '28px' }}>
              {['description', 'insight', 'details', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '14px 24px', background: 'none', border: 'none',
                    fontFamily: 'var(--font-display)', fontSize: '15px',
                    color: activeTab === tab ? 'var(--forest-glow)' : 'var(--text-muted)',
                    borderBottom: activeTab === tab ? '3px solid var(--forest-glow)' : '3px solid transparent',
                    marginBottom: '-2px', cursor: 'pointer', textTransform: 'capitalize',
                    transition: 'all 0.2s', fontWeight: 600
                  }}
                >
                  {tab === 'reviews' ? `Reviews (${book.numReviews})` : tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'description' && (
              <p style={{ color: 'var(--text-med)', lineHeight: '1.9', fontSize: '16px' }}>
                {book.description || 'No description available.'}
              </p>
            )}

            {activeTab === 'insight' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '💡', label: 'Why Read This', text: book.why, color: 'var(--amber)' },
                  { icon: '✅', label: 'Best For', text: book.shouldRead, color: 'var(--forest-glow)' },
                  { icon: '⚠️', label: 'Not Ideal For', text: book.shouldNot, color: 'var(--terra-lt)' },
                  { icon: '🎯', label: 'Expected Outcome', text: book.outcome, color: 'var(--clay-teal)' },
                ].filter(s => s.text).map(section => (
                  <div key={section.label} style={{ padding: '20px', background: 'var(--interior2)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${section.color}` }}>
                    <div style={{ color: section.color, fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                      {section.icon} {section.label}
                    </div>
                    <p style={{ color: 'var(--text-med)', lineHeight: '1.7', margin: 0 }}>{section.text}</p>
                  </div>
                ))}

                {/* Mood + Problem Tags */}
                {(book.moods?.length > 0 || book.problems?.length > 0) && (
                  <div style={{ padding: '20px', background: 'var(--interior2)', borderRadius: 'var(--radius-md)' }}>
                    {book.moods?.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Good for moods</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {book.moods.map(m => <span key={m} className="badge badge-amber">{m}</span>)}
                        </div>
                      </div>
                    )}
                    {book.problems?.length > 0 && (
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Addresses problems</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {book.problems.map(p => <span key={p} className="badge badge-terra">{p}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                {[
                  ['ISBN', book.isbn],
                  ['Publisher', book.publisher],
                  ['Published Year', book.publishedYear],
                  ['Pages', book.pages],
                  ['Language', book.language],
                  ['Edition', book.edition],
                  ['Reading Level', book.readingLevel],
                  ['Reading Time', book.readingTime],
                ].filter(([,v]) => v).map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '1px solid var(--border-warm)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 800, fontSize: '13px', width: '40%' }}>{label}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-warm)', fontWeight: 700, fontSize: '14px' }}>{value}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Rating Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '32px', marginBottom: '32px', padding: '24px', background: 'var(--interior2)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-editorial)', fontSize: '64px', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '8px 0' }}>
                      {[1,2,3,4,5].map(s => <FaStar key={s} color={avgRating >= s ? 'var(--gold)' : 'var(--interior3)'} size={16} />)}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700 }}>{book.numReviews} reviews</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                    {ratingBreakdown.map(({ star, count, pct }) => (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 800, width: '12px' }}>{star}</span>
                        <FaStar color="var(--gold)" size={12} />
                        <div style={{ flex: 1, background: 'var(--interior3)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold)', borderRadius: '4px', transition: 'width 0.5s' }} />
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', width: '24px' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write Review Form */}
                {isAuthenticated && (
                  <form onSubmit={handleSubmitReview} style={{ padding: '24px', background: 'var(--interior2)', borderRadius: 'var(--radius-lg)', marginBottom: '24px', border: '1px solid var(--border-warm)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-warm)', marginBottom: '20px' }}>Write a Review</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Your Rating</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[1,2,3,4,5].map(s => (
                          <FaStar
                            key={s}
                            size={28}
                            color={reviewForm.rating >= s ? 'var(--gold)' : 'var(--interior3)'}
                            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                            onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                          />
                        ))}
                      </div>
                    </div>
                    <input
                      className="clay-input"
                      placeholder="Review title (optional)"
                      value={reviewForm.title}
                      onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                      style={{ marginBottom: '12px' }}
                    />
                    <textarea
                      className="clay-input"
                      placeholder="Share your experience with this book..."
                      value={reviewForm.body}
                      onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                      style={{ minHeight: '100px', resize: 'vertical', marginBottom: '16px' }}
                    />
                    <button className="clay-btn btn-primary" type="submit" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '16px', fontWeight: 700 }}>No reviews yet. Be the first!</p>
                  </div>
                ) : reviews.map(review => (
                  <div key={review._id} style={{ padding: '20px', background: 'var(--interior2)', borderRadius: 'var(--radius-md)', marginBottom: '12px', border: '1px solid var(--border-warm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--mint)' }}>
                          {review.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 900, color: 'var(--text-warm)', fontSize: '14px', margin: 0 }}>{review.user?.name || 'Anonymous'}</p>
                          {review.verified && <span style={{ fontSize: '11px', color: 'var(--forest-glow)', fontWeight: 700 }}>✓ Verified Purchase</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(s => <FaStar key={s} color={review.rating >= s ? 'var(--gold)' : 'var(--interior3)'} size={14} />)}
                      </div>
                    </div>
                    {review.title && <p style={{ fontWeight: 900, color: 'var(--text-warm)', marginBottom: '6px' }}>{review.title}</p>}
                    <p style={{ color: 'var(--text-med)', lineHeight: '1.7', fontSize: '14px' }}>{review.body}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '10px' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div style={{ marginTop: '80px' }}>
            <div className="shelf-plank" />
            <div style={{ padding: '48px 0' }}>
              <div className="eyebrow">You May Also Like</div>
              <h2 className="sec-title">Related <span className="eg">Books</span></h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                {relatedBooks.slice(0, 6).map(b => (
                  <div key={b._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/book/${b.slug}`)}>
                    <img src={b.coverUrl} alt={b.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', marginBottom: '10px' }} onError={(e) => { e.target.src = `https://placehold.co/180x270/2C1F0E/F2E4C8?text=${encodeURIComponent(b.title)}`; }} />
                    <p style={{ fontWeight: 900, color: 'var(--text-warm)', fontSize: '13px', margin: '0 0 4px 0' }}>{b.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{b.author}</p>
                    <p style={{ color: 'var(--forest-glow)', fontWeight: 900, fontSize: '14px' }}>₹{b.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
