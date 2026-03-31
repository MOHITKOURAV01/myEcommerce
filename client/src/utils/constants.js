/** App-wide constants */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const MOODS = [
  'Curious', 'Motivated', 'Relaxed', 'Adventurous', 'Nostalgic',
  'Inspired', 'Focused', 'Emotional', 'Philosophical', 'Playful',
];

export const PROBLEMS = [
  'Procrastination', 'Anxiety', 'Career Growth', 'Relationships',
  'Self-Confidence', 'Financial Literacy', 'Loneliness', 'Creativity Block',
  'Burnout', 'Decision Making',
];

export const READING_PATHS = [
  'Deep Focus', 'Calm Mind', 'Growth Mindset', 'Storytelling',
  'Leadership', 'Emotional Intelligence', 'Productivity',
  'Spiritual Awakening', 'Financial Freedom', 'Creative Writing',
];

export const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
  'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu',
];

export const ORDER_STATUSES = {
  placed: { label: 'Placed', color: 'amber' },
  confirmed: { label: 'Confirmed', color: 'teal' },
  processing: { label: 'Processing', color: 'sand' },
  shipped: { label: 'Shipped', color: 'forest' },
  delivered: { label: 'Delivered', color: 'forest' },
  cancelled: { label: 'Cancelled', color: 'terra' },
  returned: { label: 'Returned', color: 'terra' },
};

export const READING_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Rating: High to Low' },
  { value: 'title', label: 'Title: A to Z' },
  { value: '-title', label: 'Title: Z to A' },
];
