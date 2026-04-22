const REAL_ISBNS = [
  '9780735211292', '9781455586691', '9780525559474', '9781612680194',
  '9780671027032', '9780070481718', '9780062315007', '9788173711466',
  '9781585424337', '9780735204553', '9780804139021', '9780008312831',
  '9780345472328', '9780062316097', '9780062457714', '9781544512266',
  '9781591846444', '9780857197689', '9780743269513', '9780066620992',
  '9788179921623', '9781626569416', '9780671791544'
];

const generateBook = (
  title, author, isbn, category, price,
  originalPrice, ds, moods, problems,
  paths, ft = false, bs = false, na = false, tr = false, rating = 4.5
) => {
  const encTitle = encodeURIComponent(title);
  function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  // Use a real ISBN cover if this is a dummy ISBN to ensure images show up
  const displayIsbn = REAL_ISBNS.includes(isbn)
    ? isbn
    : REAL_ISBNS[Math.floor(Math.random() * REAL_ISBNS.length)];

  return {
    title,
    author,
    isbn,
    category,
    slug: slugify(title),
    language: 'English',
    description: `A phenomenal read about ${title.toLowerCase()} that will change your perspective. Essential for anyone interested in ${category}.`,
    coverUrl: `https://covers.openlibrary.org/b/isbn/${displayIsbn}-L.jpg`,
    price,
    originalPrice,
    discount: ds,
    stock: Math.floor(Math.random() * 200) + 10,
    moods: Array.isArray(moods) ? moods : [moods],
    problems: Array.isArray(problems) ? problems : [problems],
    readingLevel: 'Intermediate',
    readingTime: Math.floor(Math.random() * 8) + 4,
    why: `Because it is highly regarded.`,
    shouldRead: `If you want to master ${category}.`,
    shouldNot: `If you are looking for light fiction.`,
    outcome: `You will master the concepts.`,
    readingPaths: Array.isArray(paths) ? paths : [paths],
    amazonLink: `https://www.amazon.in/s?k=${encTitle}`,
    flipkartLink: `https://www.flipkart.com/search?q=${encTitle}`,
    featured: ft,
    bestseller: bs,
    newArrival: na,
    trending: tr,
    rating,
    numReviews: Math.floor(Math.random() * 100) + 5
  };
};

const books = [
  // The 23 Must-Haves
  generateBook('Atomic Habits', 'James Clear', '9780735211292', 'self-help', 399, 599, 33, ['Growth', 'Focus'], ['Procrastination', 'Bad Habits'], ['student', 'pro'], true, true, false, true, 4.9),
  generateBook('Deep Work', 'Cal Newport', '9781455586691', 'productivity', 349, 499, 30, ['Deep Focus'], ['Distraction'], ['student', 'career', 'pro'], true, true, false, false, 4.8),
  generateBook('Ikigai', 'Hector Garcia', '9780525559474', 'philosophy', 299, 499, 40, ['Calm Mind', 'Stories'], ['Lack of Purpose'], ['beginner', 'pro'], true, true, false, true, 4.7),
  generateBook('Rich Dad Poor Dad', 'Robert Kiyosaki', '9781612680194', 'finance', 349, 499, 30, ['Wealth', 'Growth'], ['Debt', 'Poverty'], ['career', 'pro'], true, true, false, true, 4.7),
  generateBook('How to Win Friends and Influence People', 'Dale Carnegie', '9780671027032', 'communication', 299, 399, 25, ['Charisma', 'Leadership'], ['Shyness', 'Social Anxiety'], ['career', 'pro', 'student'], true, true, false, true, 4.8),
  generateBook('You Can Win', 'Shiv Khera', '9780070481718', 'self-help', 249, 399, 38, ['Motivation'], ['Self-Doubt'], ['student'], false, true, false, false, 4.6),
  generateBook('The Alchemist', 'Paulo Coelho', '9780062315007', 'fiction', 249, 399, 38, ['Stories', 'Adventure'], ['Lost'], ['beginner'], true, true, false, true, 4.8),
  generateBook('Wings of Fire', 'A.P.J. Abdul Kalam', '9788173711466', 'biography', 299, 450, 34, ['Inspiration'], ['Lack of Purpose'], ['student'], true, true, false, false, 4.9),
  generateBook('Think and Grow Rich', 'Napoleon Hill', '9781585424337', 'finance', 399, 599, 33, ['Wealth', 'Motivation'], ['Poverty'], ['pro', 'career'], true, true, false, true, 4.8),
  generateBook('The Power of Your Subconscious Mind', 'Joseph Murphy', '9788194790830', 'spirituality', 249, 399, 38, ['Calm Mind'], ['Anxiety'], ['beginner'], false, true, false, false, 4.6),
  generateBook('Zero to One', 'Peter Thiel', '9780804139021', 'business', 499, 699, 29, ['Innovation'], ['Stuck Business'], ['pro', 'career'], true, true, false, true, 4.7),
  generateBook('The 5 AM Club', 'Robin Sharma', '9780008312831', 'productivity', 349, 499, 30, ['Discipline'], ['Laziness'], ['student', 'pro'], false, true, false, true, 4.6),
  generateBook('Mindset', 'Carol S. Dweck', '9780345472328', 'psychology', 349, 599, 42, ['Growth'], ['Fixed Mindset'], ['student', 'career'], false, true, false, true, 4.8),
  generateBook('Sapiens', 'Yuval Noah Harari', '9780062316097', 'history', 699, 999, 30, ['Curiosity'], ['Ignorance'], ['pro'], true, true, false, true, 4.9),
  generateBook('The Subtle Art of Not Giving a F*ck', 'Mark Manson', '9780062457714', 'psychology', 349, 499, 30, ['Realism'], ['Overthinking'], ['beginner', 'career'], true, true, false, true, 4.6),
  generateBook('Can\'t Hurt Me', 'David Goggins', '9781544512266', 'biography', 499, 799, 38, ['Motivation'], ['Weakness'], ['student', 'career'], false, true, false, true, 4.9),
  generateBook('Start With Why', 'Simon Sinek', '9781591846444', 'business', 399, 599, 33, ['Leadership'], ['Lack of Purpose'], ['pro', 'career'], true, true, false, true, 4.8),
  generateBook('The Psychology of Money', 'Morgan Housel', '9780857197689', 'finance', 399, 599, 33, ['Wealth'], ['Bad Spending'], ['student', 'career'], true, true, false, true, 4.8),
  generateBook('The 7 Habits of Highly Effective People', 'Stephen R. Covey', '9780743269513', 'self-help', 449, 699, 36, ['Growth', 'Leadership'], ['Inefficiency'], ['pro', 'student'], true, true, false, false, 4.7),
  generateBook('Good to Great', 'Jim Collins', '9780066620992', 'business', 599, 899, 33, ['Leadership'], ['Mediocrity'], ['pro'], false, true, false, false, 4.8),
  generateBook('The Monk Who Sold His Ferrari', 'Robin Sharma', '9788179921623', 'spirituality', 299, 450, 34, ['Stories', 'Calm Mind'], ['Stress'], ['beginner'], false, true, false, false, 4.6),
  generateBook('Eat That Frog', 'Brian Tracy', '9781626569416', 'productivity', 249, 399, 38, ['Focus', 'Motivation'], ['Procrastination'], ['student', 'career'], false, true, false, true, 4.7),
  generateBook('Awaken the Giant Within', 'Tony Robbins', '9780671791544', 'self-help', 549, 899, 39, ['Motivation'], ['Self-Doubt'], ['pro', 'student'], false, true, false, false, 4.7),
];

// Dynamically generate the remaining to reach exactly 10,000 books
const categoryMap = {
  'self-help': 2000,
  'finance': 1500,
  'fiction': 1000,
  'biography': 1000,
  'productivity': 1000,
  'philosophy': 800,
  'communication': 800,
  'business': 800,
  'psychology': 600,
  'spirituality': 500
};

// Deduct the counts from the initial 23 manually or dynamically
const currentCounts = {};
books.forEach(b => {
  currentCounts[b.category] = (currentCounts[b.category] || 0) + 1;
});

let dummyIsbnCounter = 9783000000000;
const fillerMoods = ['Deep Focus', 'Calm Mind', 'Growth', 'Stories', 'Adventure', 'Motivation', 'Resilience', 'Clarity', 'Energy', 'Inspiration', 'Wisdom'];
const fillerProblems = ['Stress', 'Anxiety', 'Poverty', 'Laziness', 'Distraction', 'Lost', 'Overthinking', 'Mediocrity', 'Chaos', 'Doubt'];
const fillerPaths = ['student', 'career', 'pro', 'beginner', 'parent', 'entrepreneur', 'leader', 'artist'];

const baseTitles = [
  "Mastering", "Wealth", "The Silent", "Beyond", "Future", "Habit", "The Resilient", "Digital", "Echoes", "Stoic",
  "Conversational", "Agile", "Blueprints", "Zen", "Financial", "Startup", "Emotional", "Art of", "Chronicles", "Pioneers",
  "Minimalist", "Unbreakable", "Modern", "Data", "Compassionate", "Persuasion", "Infinite", "Focused", "Wanderer",
  "Inventing", "Joy", "Cashflow", "Empathy", "Limitless", "Organized", "Corporate", "Mindfulness", "Words", "Equation",
  "Brain", "Scaling", "Assertive", "Ethic", "Cultivation", "Warrior", "Paradox", "Independence", "Neuroscience", "Code"
];

const suffixes = [
  "Secrets", "Code", "Dynamics", "Paths", "Victory", "Wisdom", "Manual", "Guide", "Legacy", "Protocol",
  "Empire", "Foundations", "Masterclass", "Paradigm", "Shift", "Evolution", "Revolution", "Hacks", "Engine", "Blueprint"
];

for (const [cat, targetCount] of Object.entries(categoryMap)) {
  const current = currentCounts[cat] || 0;
  const needed = targetCount - current;
  
  for (let i = 0; i < needed; i++) {
    const titleVal = `${baseTitles[Math.floor(Math.random() * baseTitles.length)]} ${cat} ${suffixes[Math.floor(Math.random() * suffixes.length)]} #${i + current + 1}`;
    
    books.push(generateBook(
      titleVal, 
      `Author ${Math.floor(Math.random() * 5000)}`, 
      (dummyIsbnCounter++).toString(), 
      cat, 
      Math.floor(Math.random() * 800) + 250, 
      Math.floor(Math.random() * 500) + 1200, 
      30, 
      [fillerMoods[Math.floor(Math.random() * fillerMoods.length)], fillerMoods[Math.floor(Math.random() * fillerMoods.length)]], 
      [fillerProblems[Math.floor(Math.random() * fillerProblems.length)]], 
      [fillerPaths[Math.floor(Math.random() * fillerPaths.length)]],
      Math.random() > 0.9, 
      Math.random() > 0.6, 
      Math.random() > 0.7, 
      Math.random() > 0.8, 
      parseFloat((Math.random() * (5 - 3.0) + 3.0).toFixed(1))
    ));
  }
}

// Slice to exactly 10,000 if we slightly overshot
const exact10000Books = books.slice(0, 10000);

module.exports = exact10000Books;
