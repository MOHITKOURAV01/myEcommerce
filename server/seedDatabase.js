const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book');

dotenv.config();

const books = [
  { title: "Atomic Habits", author: "James Clear", isbn: "9780735211292", language: "English", moods: ["Motivated", "Burned Out"], problems: ["Procrastination", "Lack of focus"], readingTime: "4h 30m", why: "To build good habits and break bad ones.", bestFor: "Anyone looking to improve themselves.", notFor: "People who want quick fixes.", outcome: "A systematic approach to personal growth.", amazonLink: "#", flipkartLink: "#" },
  { title: "Ikigai", author: "Héctor García", isbn: "9780525559474", language: "English", moods: ["Feeling Low", "Confused"], problems: ["Lack of purpose", "Stress"], readingTime: "3h 15m", why: "To find your purpose in life.", bestFor: "People feeling lost or stressed.", notFor: "Those already fulfilled.", outcome: "A sense of peace and direction.", amazonLink: "#", flipkartLink: "#" },
  { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", isbn: "9781612680194", language: "English", moods: ["Motivated"], problems: ["Financial instability"], readingTime: "5h", why: "To learn the difference between working for money and having money work for you.", bestFor: "Beginner investors.", notFor: "Finance experts.", outcome: "Financial literacy.", amazonLink: "#", flipkartLink: "#" },
  { title: "Deep Work", author: "Cal Newport", isbn: "9781455586691", language: "English", moods: ["Burned Out", "Confused"], problems: ["Distraction", "Low productivity"], readingTime: "4h 45m", why: "To learn how to focus without distraction.", bestFor: "Students and professionals.", notFor: "People who thrive in chaos.", outcome: "Increased productivity and focus.", amazonLink: "#", flipkartLink: "#" },
  { title: "How to Win Friends", author: "Dale Carnegie", isbn: "9780671027032", language: "English", moods: ["Feeling Low"], problems: ["Social anxiety", "Poor communication"], readingTime: "6h", why: "To improve interpersonal skills.", bestFor: "Anyone wanting better relationships.", notFor: "Hermits.", outcome: "Better social interactions.", amazonLink: "#", flipkartLink: "#" },
  { title: "You Can Win", author: "Shiv Khera", isbn: "9780070481718", language: "English", moods: ["Feeling Low", "Motivated"], problems: ["Low self-esteem"], readingTime: "5h 30m", why: "To gain confidence and a positive attitude.", bestFor: "Students, Job seekers.", notFor: "Cynics.", outcome: "A winning mindset.", amazonLink: "#", flipkartLink: "#" },
  { title: "The Psychology of Money", author: "Morgan Housel", isbn: "9780857197689", language: "English", moods: ["Confused"], problems: ["Financial anxiety"], readingTime: "4h 10m", why: "To understand how people think about money.", bestFor: "Everyone.", notFor: "Day traders.", outcome: "A healthier relationship with wealth.", amazonLink: "#", flipkartLink: "#" },
  { title: "Think and Grow Rich", author: "Napoleon Hill", isbn: "9781585424337", language: "English", moods: ["Motivated"], problems: ["Lack of wealth"], readingTime: "7h", why: "To discover the secrets of success.", bestFor: "Entrepreneurs.", notFor: "Skeptics.", outcome: "A roadmap to achievement.", amazonLink: "#", flipkartLink: "#" },
  { title: "The Alchemist", author: "Paulo Coelho", isbn: "9780062315007", language: "English", moods: ["Feeling Low", "Confused"], problems: ["Feeling stuck"], readingTime: "3h 45m", why: "To follow your dreams.", bestFor: "Dreamers and wanderers.", notFor: "Strictly analytical minds.", outcome: "Inspiration to pursue your personal legend.", amazonLink: "#", flipkartLink: "#" },
  { title: "Wings of Fire", author: "APJ Abdul Kalam", isbn: "9788173711466", language: "English", moods: ["Motivated"], problems: ["Lack of inspiration"], readingTime: "5h 20m", why: "To read the inspiring journey of a great leader.", bestFor: "Students and young professionals.", notFor: "Those looking for fiction.", outcome: "Resilience and patriotism.", amazonLink: "#", flipkartLink: "#" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/booksmart');
    console.log('MongoDB connected for seeding...');
    await Book.deleteMany();
    await Book.insertMany(books);
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
