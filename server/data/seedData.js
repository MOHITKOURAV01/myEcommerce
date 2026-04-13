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
  function slugify(text) { return text.toString().toLowerCase()
    .replace(/\s+/g,'-')
    .replace(/[^\w-]+/g,'')
    .replace(/--+/g,'-')
    .replace(/^-+/,'')
    .replace(/-+$/,'');
  }

  // Use a real ISBN cover if this is a dummy ISBN to ensure images show up
  const displayIsbn = isbn.startsWith('978100') 
    ? REAL_ISBNS[Math.floor(Math.random() * REAL_ISBNS.length)] 
    : isbn;

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

// Dynamically generate the remaining 77 to reach exactly 100 books 
// (We have 23, need 77 more to meet criteria of 100 total)
const categoryMap = {
  'self-help': 20,
  'finance': 12,
  'fiction': 10,
  'biography': 10,
  'productivity': 10,
  'philosophy': 8,
  'communication': 8,
  'business': 8,
  'psychology': 8,
  'spirituality': 6
};

// Deduct the counts from the initial 23 manually or dynamically
const currentCounts = {};
books.forEach(b => {
  currentCounts[b.category] = (currentCounts[b.category] || 0) + 1;
});

let dummyIsbnCounter = 9781000000000;
const fillerMoods = ['Deep Focus', 'Calm Mind', 'Growth', 'Stories', 'Adventure', 'Motivation'];
const fillerProblems = ['Stress', 'Anxiety', 'Poverty', 'Laziness', 'Distraction', 'Lost', 'Overthinking'];
const fillerPaths = ['student', 'career', 'pro', 'beginner'];

const titles = [
  "Mastering the Mind", "Wealth Dynamics", "The Silent Leader", "Beyond Happiness", "Future Driven",
  "Habit Loops", "The Resilient Soul", "Digital Ascendance", "Echoes of Time", "Stoic Paths",
  "Conversational Mastery", "The Agile Business", "Subconscious Blueprints", "Zen Focus", "Financial Fortress",
  "The Startup Code", "Emotional Agility", "The Art of Listening", "Chronicles of Earth", "Pioneers of Tech",
  "Minimalist Living", "The Wealth Blueprint", "Unbreakable Will", "The Modern Philosopher", "Data Driven Decisions",
  "The Compassionate Mind", "Persuasion Methods", "Infinite Growth", "The Focused Life", "Wanderer's Tale",
  "Inventing the Future", "The Stoic Joy", "Cashflow Secrets", "The Empathy Advantage", "Limitless Energy",
  "The Organized Mind", "Corporate Titans", "The Mindfulness Guide", "Words That Win", "The Success Equation",
  "The Happy Brain", "Startup Scaling", "The Assertive Speaker", "The Deep Work Ethic", "Wealth Cultivation",
  "The Peaceful Warrior", "The Leadership Paradox", "Financial Independence", "The Neuroscience of Habit", "The Charisma Code",
  "The Creative Spark", "The Productivity Ninja", "The Stoic Mindset", "The Emotional Bank Account", "The Negotiation Playbook",
  "The Resilient Mind", "The Wealth Planner", "The Business Thinker", "The Awakened Soul", "The Communication Gap",
  "The Philosophy of Success", "The Agile Mind", "The Personal Finance Guide", "The Innovation Strategy", "The Emotional Leader",
  "The Startup Mentality", "The Focused Entrepreneur", "The Philosophy of Wealth", "The Communication Masterclass", "The Resilient Entrepreneur",
  "The Wealth Formula", "The Awakened Leader", "The Emotional Entrepreneur", "The Success Blueprint", "The Agile Leader", "The Resilient Leader", "The Awakened Entrepreneur"
];

let titleIdx = 0;

for (const [cat, targetCount] of Object.entries(categoryMap)) {
  const current = currentCounts[cat] || 0;
  const needed = targetCount - current;
  
  for (let i = 0; i < needed; i++) {
    const titleVal = titles[titleIdx] || `${cat.charAt(0).toUpperCase() + cat.slice(1)} Mastery Vol. ${i+1}`;
    titleIdx++;
    
    books.push(generateBook(
      titleVal, 
      `Author ${Math.floor(Math.random() * 100)}`, 
      (dummyIsbnCounter++).toString(), 
      cat, 
      Math.floor(Math.random() * 500) + 150, 
      Math.floor(Math.random() * 500) + 650, 
      30, 
      [fillerMoods[Math.floor(Math.random() * fillerMoods.length)]], 
      [fillerProblems[Math.floor(Math.random() * fillerProblems.length)]], 
      [fillerPaths[Math.floor(Math.random() * fillerPaths.length)]],
      Math.random() > 0.8, 
      Math.random() > 0.5, 
      Math.random() > 0.6, 
      Math.random() > 0.7, 
      parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1))
    ));
  }
}

// Slice to exactly 100 if we slightly overshot
const exact100Books = books.slice(0, 100);

module.exports = exact100Books;
