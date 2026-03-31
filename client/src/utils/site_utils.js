// --- constants.js ---
export const MOODS = ['Adventurous', 'Nostalgic', 'Melancholy', 'Exciting', 'Peaceful', 'Curious', 'Inspirational', 'Mysterious'];
export const PROBLEMS = ['Lack of focus', 'Creative block', 'Daily stress', 'Sleeplessness', 'Grief', 'Anxiety', 'Loneliness', 'Finding purpose'];
export const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Gujarati', 'Kannada'];
export const READING_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Scholar'];
export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
export const SORT_OPTIONS = [
    { label: 'Newest Arrivals', value: '-createdAt' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Most Popular', value: '-rating' }
];

// --- formatPrice.js ---
export const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// --- formatDate.js ---
export const formatDate = (date, type = 'medium') => {
    const d = new Date(date);
    if (type === 'relative') {
        const diff = Date.now() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 30) return `${days} days ago`;
        return d.toLocaleDateString();
    }
    const options = type === 'short' 
        ? { month: 'short', day: 'numeric', year: 'numeric' }
        : { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-IN', options);
};

// --- validators.js ---
export const validators = {
    validateEmail: (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    validatePhone: (phone) => {
        return /^[6-9]\d{9}$/.test(phone);
    },
    validatePincode: (pin) => {
        return /^\d{6}$/.test(pin);
    },
    validatePassword: (password) => {
        return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
    }
};

export default { MOODS, PROBLEMS, LANGUAGES, READING_LEVELS, ORDER_STATUSES, SORT_OPTIONS, formatPrice, formatDate, validators };
