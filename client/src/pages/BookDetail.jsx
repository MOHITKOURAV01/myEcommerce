import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart, useWishlist } from '../hooks/index_hooks';
import LoadingSpinner from '../components/LoadingSpinner';
import BookCard3D from '../components/BookCard3D';

export default function BookDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/books/${slug}`);
        setBook(data.data);
        
        // Fetch similar
        const simRes = await api.get(`/api/books/similar/${data.data._id}`);
        setSimilarBooks(simRes.data.data || []);

        // Fetch reviews
        const revRes = await api.get(`/api/reviews/book/${data.data._id}`);
        setReviews(revRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBook();
  }, [slug]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing book: ${book?.title} on BookSmart!`;
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const checkPincode = () => {
    if (pincode.length === 6) {
      setDeliveryEstimate('Guaranteed delivery by ' + new Date(Date.now() + 3*24*60*60*1000).toDateString());
    } else {
      setDeliveryEstimate('Please enter a valid 6-digit Pincode');
    }
  };

  if (loading) return <LoadingSpinner text="Pulling record from the archives..." />;
  if (!book) return <div className="pt-[120px] text-center text-terra font-bold text-2xl">Book not found</div>;

  const inWishlist = wishlist?.books?.some(b => b._id === book._id);

  return (
    <div className="container min-h-screen pt-[120px] pb-20">
      {/* Breadcrumb */}
      <div className="text-sm text-textMed mb-8 font-bold">
        <span className="cursor-pointer hover:text-terra" onClick={()=>navigate('/')}>Home</span> &gt; 
        <span className="cursor-pointer hover:text-terra ml-2" onClick={()=>navigate(`/discover?category=${book.category}`)}>{book.category}</span> &gt; 
        <span className="text-primary ml-2">{book.title}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Left Col: Image & Share */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="relative group overflow-hidden rounded-xl shadow-2xl mb-6 w-full max-w-[300px] border-4 border-interior bg-borderWarm">
                <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-125 origin-center cursor-zoom-in"
                />
            </div>
            
            <div className="flex gap-4">
                <button onClick={()=>handleShare('whatsapp')} className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">W</button>
                <button onClick={()=>handleShare('twitter')} className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">T</button>
                <button onClick={()=>handleShare('copy')} className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">🔗</button>
            </div>
        </div>

        {/* Right Col: Details */}
        <div className="w-full md:w-2/3">
            <h1 className="font-fredoka text-4xl md:text-5xl text-brown mb-2">{book.title}</h1>
            <h2 className="text-xl text-terra font-bold mb-4 font-nunito">by {book.author}</h2>
            
            <div className="flex items-center gap-4 mb-6">
                <span className="text-gold text-lg">{'★'.repeat(Math.round(book.rating))} <span className="text-textMed text-sm">({book.numReviews} ratings)</span></span>
                <span className="w-1 h-1 bg-borderWarm rounded-full"></span>
                <span className="text-primary font-bold">{book.soldCount || Math.floor(Math.random() * 500) + 50} Sold</span>
            </div>

            <div className="flex items-end gap-3 mb-6">
                <span className="font-fredoka text-4xl text-primary">₹{book.price}</span>
                {book.originalPrice && (
                    <span className="text-textMed line-through text-lg mb-1">₹{book.originalPrice}</span>
                )}
                {book.discount && (
                    <span className="text-mint font-bold text-lg mb-1">({book.discount}% OFF)</span>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-3 py-1 bg-interior border border-borderWarm rounded text-sm text-brown font-bold">📖 {book.language || 'English'}</span>
                <span className="px-3 py-1 bg-interior border border-borderWarm rounded text-sm text-brown font-bold">📄 {book.pages || Math.floor(Math.random()*300+150)} Pages</span>
                <span className="px-3 py-1 bg-interior border border-borderWarm rounded text-sm text-brown font-bold">🏢 BookSmart Verified</span>
            </div>

            <div className="mb-8">
                {book.stock > 0 ? (
                    <p className="text-mint font-bold text-lg mb-4">✓ In Stock</p>
                ) : (
                    <p className="text-terra font-bold text-lg mb-4">✗ Out of Stock</p>
                )}

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center border-2 border-borderWarm rounded-xl bg-interior overflow-hidden">
                        <button onClick={()=>setQty(q => Math.max(1, q-1))} className="px-4 py-3 text-primary font-bold hover:bg-borderWarm">-</button>
                        <span className="px-4 py-3 text-brown font-bold min-w-[50px] text-center">{qty}</span>
                        <button onClick={()=>setQty(q => Math.min(book.stock, q+1))} className="px-4 py-3 text-primary font-bold hover:bg-borderWarm">+</button>
                    </div>

                    <button 
                        onClick={() => addToCart(book._id, qty)} 
                        disabled={book.stock < 1}
                        className="clay-btn btn-primary px-8 py-3 !text-lg flex-1 md:flex-none disabled:opacity-50"
                    >
                        Add to Cart 🛒
                    </button>
                    
                    <button 
                         onClick={() => {
                             addToCart(book._id, qty);
                             navigate('/checkout');
                         }}
                         disabled={book.stock < 1}
                         className="clay-btn btn-secondary !bg-gold !text-white px-8 py-3 !text-lg flex-1 md:flex-none disabled:opacity-50"
                    >
                        Buy Now ⚡
                    </button>

                    <button 
                        onClick={() => toggleWishlist(book._id)}
                        className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl transition-colors ${inWishlist ? 'bg-terra/10 border-terra text-terra' : 'bg-interior border-borderWarm text-textMed hover:border-terra hover:text-terra'}`}
                    >
                        ♥
                    </button>
                </div>
            </div>

            {/* Delivery Estimate */}
            <div className="bg-cream border-2 border-borderWarm rounded-2xl p-6 max-w-md">
                <h4 className="font-bold text-brown mb-2">Check Delivery Estimate</h4>
                <div className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        placeholder="Enter Pincode" 
                        maxLength={6}
                        value={pincode}
                        onChange={(e)=>setPincode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 bg-white border-2 border-borderWarm rounded-lg px-3 outline-none"
                    />
                    <button onClick={checkPincode} className="bg-primary text-white px-4 py-2 rounded-lg font-bold">Check</button>
                </div>
                {deliveryEstimate && <p className="text-sm font-bold text-mint">{deliveryEstimate}</p>}
            </div>

        </div>
      </div>

      <div className="shelf-plank my-16 mx-auto w-full" />

      {/* Tabs Section */}
      <div className="mb-16">
          <div className="flex gap-8 border-b-2 border-borderWarm mb-8">
              {['description', 'insight', 'reviews'].map(tab => (
                 <button 
                    key={tab}
                    onClick={()=>setActiveTab(tab)}
                    className={`pb-4 text-xl font-fredoka capitalize transition-colors ${activeTab === tab ? 'text-terra border-b-4 border-terra' : 'text-textMed hover:text-primary'}`}
                 >
                    {tab === 'insight' ? 'BookSmart Insight' : tab}
                 </button>
              ))}
          </div>

          <div className="min-h-[200px]">
              {activeTab === 'description' && (
                  <div className="text-brown text-lg leading-relaxed max-w-4xl font-nunito bg-interior p-8 rounded-2xl border border-borderWarm">
                      {book.description}
                  </div>
              )}
              {activeTab === 'insight' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                      <div className="bg-mint/10 p-6 rounded-2xl border border-mint/20">
                          <h4 className="font-bold text-mint mb-2">Why you should read this:</h4>
                          <p className="text-brown">{book.why}</p>
                      </div>
                      <div className="bg-amber/10 p-6 rounded-2xl border border-amber/20">
                          <h4 className="font-bold text-amber mb-2">Outcome:</h4>
                          <p className="text-brown">{book.outcome}</p>
                      </div>
                      <div className="bg-gold/10 p-6 rounded-2xl border border-gold/20">
                          <h4 className="font-bold text-gold mb-2">Ideal if you want:</h4>
                          <p className="text-brown">{book.shouldRead}</p>
                      </div>
                      <div className="bg-terra/10 p-6 rounded-2xl border border-terra/20">
                          <h4 className="font-bold text-terra mb-2">Maybe skip if:</h4>
                          <p className="text-brown">{book.shouldNot}</p>
                      </div>
                  </div>
              )}
              {activeTab === 'reviews' && (
                  <div className="max-w-4xl">
                      {reviews.length === 0 ? (
                          <p className="text-textMed italic">No reviews yet. Be the first to share your thoughts!</p>
                      ) : (
                          <div className="flex flex-col gap-4">
                              {reviews.map(rev => (
                                  <div key={rev._id} className="bg-cream border border-borderWarm p-6 rounded-xl">
                                      <div className="flex justify-between items-start mb-2">
                                          <div>
                                              <p className="font-bold text-primary">{rev.user?.name || 'Anonymous Reader'}</p>
                                              <span className="text-gold">{'★'.repeat(rev.rating)}</span>
                                          </div>
                                          <span className="text-sm text-textMed">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      <h4 className="font-bold text-brown mb-1">{rev.title}</h4>
                                      <p className="text-brown/80">{rev.comment}</p>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>

      <div className="shelf-plank my-16 mx-auto w-full" />

      {/* Similar Books */}
      {similarBooks.length > 0 && (
          <section>
              <h2 className="sec-title mb-8">You might also <em>like</em></h2>
              <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                  {similarBooks.map(b => (
                      <div key={b._id} className="min-w-[200px]">
                           <BookCard3D book={b} onClick={() => navigate(`/book/${b.slug}`)} />
                      </div>
                  ))}
              </div>
          </section>
      )}

    </div>
  );
}
