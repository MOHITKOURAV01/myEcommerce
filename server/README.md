# BookSmart Backend

This backend follows MVC architecture and is designed for scalability and future feature expansion.

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))

### Installation Steps
1. Clone the repository
2. Navigate to the `server/` directory
3. Install dependencies: `npm install`
4. Set up your `.env` file:
   - Copy `.env.example` to `.env`
   - Replace `your_mongodb_connection_string` with your MongoDB Atlas connection string
   - Example: `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/booksmart`
5. Start development: `npm run dev` or `npm start`

### MongoDB Atlas Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0 is sufficient)
3. Create a database user with username and password
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string from "Connect" → "Connect your application"
6. Replace `<password>` with your database user password
7. Add the connection string to your `.env` file

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
