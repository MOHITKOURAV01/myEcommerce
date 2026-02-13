# BookSmart Backend

This backend follows MVC architecture and is designed for scalability and future feature expansion.

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)

## Getting Started
1. Clone the repository
2. Navigate to the `server/` directory
3. Install dependencies: `npm install`
4. Set up your `.env` file (see `.env.example`)
5. Start development: `npm run dev` or `npm start`

## API Endpoints

### General
- `GET /`: API Status
- `GET /health`: Health Check

### Books
- `GET /api/books`: Get all books
  - **Filtering**: `?language=English`, `?mood=Motivation`, `?problem=Stress`
- `POST /api/books`: Create a new book
  - **Body**: `{ title, author, language, description, moods, problems, buyLinks }`
- `GET /api/books/:id`: Get a single book by ID
- `PUT /api/books/:id`: Update a book
- `DELETE /api/books/:id`: Delete a book
- `POST /api/books/seed`: Populate database with sample data
