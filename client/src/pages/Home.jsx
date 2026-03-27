import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import useBooks from '../hooks/useBooks';
import FloatingBooks from '../three/FloatingBooks';
import BookCard3D from '../components/BookCard3D';
import SignboardCard from '../components/SignboardCard';
import ShopDoor from '../components/ShopDoor';
import LoadingSpinner from '../components/LoadingSpinner';

gsap.registerPlugin(ScrollTrigger);

const MOODS = [
  { id: 'focus', name: 'Deep Focus', desc: 'Books for work & study', count: 12, theme: 'terra' },
  { id: 'calm', name: 'Calm Mind', desc: 'Peace & mindfulness', count: 8, theme: 'mint' },
  { id: 'growth', name: 'Growth', desc: 'Self improvement & career', count: 15, theme: 'gold' },
  { id: 'stories', name: 'Stories', desc: 'Escape into another world', count: 20, theme: 'purple' },
];

const PROBLEMS = [
  "Stress", "Career", "Focus", "Finance", "Communication", "Distraction"
];

const PATHS = [
  { id: 'student', name: 'Student Room', desc: 'For exams & learning', count: 24 },
  { id: 'career', name: 'Job Seeker', desc: 'Interview prep & skills', count: 18 },
  { id: 'beginner', name: 'New Reader', desc: 'Easy to read books', count: 32 },
  { id: 'pro', name: 'Professional', desc: 'Leadership & deep work', count: 15 },
];

const CATEGORIES = [
  { id: 'self-help', name: 'Self Help' },
  { id: 'finance', name: 'Finance' },
  { id: 'fiction', name: 'Fiction' },
  { id: 'biography', name: 'Biography' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'philosophy', name: 'Philosophy' },
  { id: 'business', name: 'Business' },
  { id: 'psychology', name: 'Psychology' },
];

export default function Home({ setModalBook }) {
  const { books, loading } = useBooks();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [activeProblem, setActiveProblem] = useState(PROBLEMS[0]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      // 1. Section Title Animations
      const titles = gsap.utils.toArray('.sec-title');
      titles.forEach(title => {
        gsap.from(title, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          scrollTrigger: {
            trigger: title,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      });

      // 2. Shelf Plank Animations
      const planks = gsap.utils.toArray('.shelf-plank');
      planks.forEach(plank => {
        gsap.from(plank, {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: plank,
            start: 'top 95%',
            toggleActions: 'play none none none'
          }
        });
      });

      // 3. Batch Book Card Animations
      ScrollTrigger.batch('.book-card-3d', {
        onEnter: batch => gsap.from(batch, {
          y: 60,
          opacity: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: 'back.out(1.4)',
          overwrite: true
        }),
        start: 'top 90%'
      });
      
      // 4. Animate stat counters
      const counters = gsap.utils.toArray('.stat-number');
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const suffix = counter.getAttribute('data-suffix') || '';
        gsap.to(counter, {
          innerHTML: target,
          duration: 2,
          snap: { innerHTML: 1 },
          scrollTrigger: {
            trigger: counter,
            start: 'top 85%',
          },
          onUpdate: function() {
            counter.innerHTML = Math.ceil(this.targets()[0].innerHTML) + suffix;
          }
        });
      });
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [loading]);

  if (loading) return <LoadingSpinner text="Getting the shop ready..." />;

  const featuredBooks = books.filter(b => b.featured).slice(0, 6);
  const trendingBooks = books.filter(b => b.trending).slice(0, 6);
  const newArrivals = books.filter(b => b.newArrival).slice(0, 6);
  const bestsellers = books.filter(b => b.bestseller).slice(0, 6);

  return (
    <div className="home-container" ref={containerRef} style={{ paddingTop: '100px' }}>
      
      {/* 1. HERO */}
      <section className="section container gsap-section">
        <div className="flex-between">
          <div className="flex-col" style={{ flex: 1, zIndex: 10 }}>
            {/* Hanging Lamp Mock */}
            <div style={{ position: 'absolute', top: -50, left: 100, width: 4, height: 100, background: '#3A1A08' }}>
               <div style={{ position: 'absolute', bottom: -20, left: -28, width: 60, height: 30, background: '#FFE066', borderRadius: '50% 50% 10% 10%' }}></div>
            </div>
            
            <div className="eyebrow inline-block mb-4 relative z-10 bg-interior px-4 py-1 rounded-full border border-borderWarm" style={{ color: 'var(--terra)' }}>
              Welcome to the BookShop
            </div>
            <h1 className="font-fredoka text-6xl text-brown mb-4 leading-tight">
              A Cozy Corner for your <br/>
              <span style={{ color: 'var(--terra)' }}>Perfect Read</span>
            </h1>
            <p className="text-xl text-textMed mb-8 max-w-lg font-nunito">
              Discover books uniquely suited to your mood, goals, and struggles. Step up to the counter!
            </p>
            
            <div className="flex gap-4 p-4 bg-interior rounded-xl border-2 border-borderWarm max-w-lg">
              <input 
                placeholder="Search authors, titles, moods..." 
                className="flex-1 bg-transparent border-none outline-none text-brown"
              />
              <button className="clay-btn btn-primary" onClick={() => navigate('/discover')}>Search</button>
            </div>

            <div className="flex gap-8 mt-12">
              <div>
                <h3 className="font-fredoka text-3xl text-terra"><span className="stat-number" data-target="100" data-suffix="+">0</span></h3>
                <p className="text-sm font-bold text-textMed uppercase">Curated Books</p>
              </div>
              <div className="w-px bg-borderWarm" />
              <div>
                 <h3 className="font-fredoka text-3xl text-mint"><span className="stat-number" data-target="15" data-suffix="+">0</span></h3>
                <p className="text-sm font-bold text-textMed uppercase">Reading Paths</p>
              </div>
            </div>
          </div>
          
          <div style={{ flex: 1, height: '450px', position: 'relative' }}>
            <FloatingBooks onBookClick={(index) => setModalBook(books[index])} />
          </div>
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 2. CATEGORIES STRIP */}
      <section className="section container gsap-section">
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => navigate(`/discover?category=${cat.id}`)}
              className="clay-btn px-6 py-3 rounded-full bg-cream text-brown hover:bg-interior whitespace-nowrap font-bold transition-transform hover:-translate-y-1"
            >
              # {cat.name}
            </button>
          ))}
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 3. TRENDING BOOKS */}
      <section className="section container gsap-section">
        <div className="flex justify-between items-end mb-6">
            <div>
                 <div className="eyebrow" style={{ color: 'var(--amber)' }}>What's Hot</div>
                 <h2 className="sec-title">Trending <em>Now</em></h2>
            </div>
            <button className="text-terra font-bold hover:underline" onClick={()=>navigate('/discover')}>View All →</button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
            {trendingBooks.map(book => (
                <div key={book._id} className="min-w-[200px]">
                     <BookCard3D book={book} onClick={() => setModalBook(book)} />
                </div>
            ))}
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 4. NEW ARRIVALS */}
      <section className="section container gsap-section">
        <div className="eyebrow" style={{ color: 'var(--mint)' }}>Just Arrived</div>
        <h2 className="sec-title mb-8">Fresh on the <em>Shelves</em></h2>
        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
            {newArrivals.map(book => (
                <div key={book._id} className="min-w-[200px]">
                     <BookCard3D book={book} onClick={() => setModalBook(book)} />
                </div>
            ))}
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 5. FEATURED BOOKS (3x2 Grid) */}
      <section className="section container gsap-section wood-panel p-8 rounded-[var(--radius-xl)]">
        <div className="flex-col items-center">
            <div className="eyebrow text-gold">Hand Picked</div>
            <h2 className="sec-title text-center text-cream mb-8">Featured <em>Books</em></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
               {featuredBooks.map(book => (
                   <BookCard3D key={book._id} book={book} onClick={() => setModalBook(book)} />
               ))}
            </div>
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 6. MOOD DISCOVERY */}
      <section className="section container gsap-section">
        <h2 className="sec-title text-center mb-12">Read by <em>Mood</em></h2>
        <div className="relative">
            {/* SVG Rope Line */}
            <svg className="absolute top-4 left-0 w-full h-8 z-[-1]" preserveAspectRatio="none">
                 <path d="M0,15 Q500,-10 1200,20" stroke="#8B5A2B" strokeWidth="4" fill="transparent" strokeDasharray="10 5" />
            </svg>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {MOODS.map(mood => (
                 <SignboardCard key={mood.id} mood={mood} theme={mood.theme} onClick={() => navigate(`/discover?mood=${mood.id}`)} />
               ))}
            </div>
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 7. PROBLEM-BASED */}
      <section className="section container gsap-section text-center">
        <div className="eyebrow text-terra">Tell Us Your Problem</div>
        <h2 className="sec-title mb-6">Find your <em>Cure</em></h2>
        <div className="flex justify-center flex-wrap gap-4 mb-12 max-w-2xl mx-auto">
          {PROBLEMS.map(p => (
            <button 
                key={p} 
                onClick={() => setActiveProblem(p)}
                className={`clay-btn px-6 py-2 rounded-full font-bold transition-all ${activeProblem === p ? 'bg-terra text-white scale-110' : 'bg-interior text-primary hover:bg-cream'}`}
            >
                {p}
            </button>
          ))}
        </div>
        <div className="flex gap-6 justify-center overflow-x-auto pb-4 px-4">
             {books.filter(b => b.problems && b.problems.includes(activeProblem)).slice(0, 4).map(book => (
                <div key={book._id} className="min-w-[180px]">
                     <BookCard3D book={book} onClick={() => setModalBook(book)} />
                </div>
             ))}
             {books.filter(b => b.problems && b.problems.includes(activeProblem)).length === 0 && (
                 <p className="text-textMed italic">Select another problem, our pharmacist is bringing more books.</p>
             )}
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 8. READING PATHS */}
      <section className="section container gsap-section">
        <div className="eyebrow text-mint text-center">Your Reading Journey</div>
        <h2 className="sec-title text-center mb-12">Choose your <em>Door</em></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {PATHS.map(path => (
             <ShopDoor key={path.id} path={path} onClick={() => navigate(`/discover?path=${path.id}`)} />
           ))}
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 9. BESTSELLERS */}
      <section className="section container gsap-section">
        <div className="eyebrow text-gold">Most Loved</div>
        <h2 className="sec-title mb-8">All-time <em>Bestsellers</em></h2>
        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
            {bestsellers.map(book => (
                <div key={book._id} className="min-w-[200px]">
                     <BookCard3D book={book} onClick={() => setModalBook(book)} />
                </div>
            ))}
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 10. WHY BOOKSMART */}
      <section className="section container gsap-section">
        <h2 className="sec-title text-center mb-10">Why <em>BookSmart?</em></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
                 { title: "Problem-Based", desc: "Find books that solve your exact life issues." },
                 { title: "Honest Reviews", desc: "Real reviews from genuine verified purchasers." },
                 { title: "Language Inclusive", desc: "Available in multiple Indian & foreign languages." },
                 { title: "Premium UI", desc: "An unforgettable cozy 3D shopping experience." }
             ].map((feature, i) => (
                 <div key={i} className="bg-interior p-6 rounded-2xl border-2 border-borderWarm shadow-sm relative overflow-hidden transition-transform hover:-translate-y-2">
                     <div className="w-12 h-12 bg-terra/20 rounded-full mb-4 flex items-center justify-center text-terra font-bold">✓</div>
                     <h3 className="font-fredoka text-xl text-brown mb-2">{feature.title}</h3>
                     <p className="text-textMed text-sm">{feature.desc}</p>
                 </div>
             ))}
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 11. TESTIMONIALS */}
      <section className="section container gsap-section">
        <h2 className="sec-title text-center mb-10">From the <em>Readers</em></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
                 { name: "Rahul Sharma", text: "Found the exact book I needed for my career transition. The delivery was super fast too!" },
                 { name: "Priya V.", text: "This UI is gorgeous. I feel like I am standing in a real magical library. Love the collections." },
                 { name: "Arjun K.", text: "The problem-based search is brilliant. I was feeling burned out and it recommended exactly what helped." }
             ].map((review, i) => (
                 <div key={i} className="bg-cream p-6 rounded-2xl relative shadow-md">
                     <div className="flex gap-1 mb-4 text-gold">★★★★★</div>
                     <p className="text-brown italic mb-6">"{review.text}"</p>
                     <p className="font-bold text-primary">- {review.name}</p>
                 </div>
             ))}
        </div>
      </section>

      <div className="shelf-plank my-8 mx-auto w-11/12" />

      {/* 12. NEWSLETTER */}
      <section className="section container gsap-section mb-20 text-center">
         <div className="wood-panel inline-block p-12 rounded-[var(--radius-xl)] w-full max-w-3xl">
             <h2 className="font-fredoka text-4xl text-cream mb-4 drop-shadow-md">Join the Book Club</h2>
             <p className="text-cream/80 mb-8 text-lg">Get weekly recommendations and exclusive discounts.</p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <input type="email" placeholder="Your cozy email..." className="px-6 py-4 rounded-xl border-none outline-none w-full sm:w-auto flex-1 font-bold shadow-inner text-brown" />
                 <button className="clay-btn btn-primary px-8 py-4 !text-lg">Subscribe</button>
             </div>
         </div>
      </section>

    </div>
  );
}
