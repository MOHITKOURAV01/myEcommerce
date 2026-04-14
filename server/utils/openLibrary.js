/**
 * Fetch books from Open Library and transform them to BookSmart format (Native Fetch Engine)
 */
const searchOpenLibrary = async (query, limit = 12) => {
    try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
        const response = await fetch(url);
        
        if (!response.ok) return [];
        const data = await response.json();
        
        if (!data || !data.docs) return [];

        return data.docs.map(book => {
            const isbn = (book.isbn && book.isbn.length > 0) ? book.isbn[0] : '9781000000000';
            const price = Math.floor(Math.random() * 500) + 250;
            const originalPrice = price + Math.floor(Math.random() * 200) + 100;

            return {
                _id: `ol_${book.key.split('/').pop()}`,
                title: book.title,
                author: book.author_name ? book.author_name[0] : 'Ancient Scholar',
                isbn: isbn,
                category: { name: (book.subject && book.subject.length > 0) ? book.subject[0] : 'General', slug: 'general' },
                slug: book.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
                description: `This archival relic titled "${book.title}" contains ${book.number_of_pages_median || 'timeless'} pages of wisdom. Found in the ${book.first_publish_year || 'ancient'} era.`,
                coverUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
                price: price,
                originalPrice: originalPrice,
                rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
                numReviews: Math.floor(Math.random() * 1000) + 10,
                inStock: true,
                moods: ['Growth', 'Wisdom'],
                problem: 'Lack of Wisdom',
                isGlobal: true, // Internal flag for identification
                openLibraryKey: book.key
            };
        });
    } catch (error) {
        console.error('Open Library Fetch Error: 🏺', error.message);
        return [];
    }
};

module.exports = { searchOpenLibrary };
