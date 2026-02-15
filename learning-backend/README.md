# FastAPI E-commerce Backend

A production-ready e-commerce backend built with FastAPI and MongoDB Atlas.

## Tech Stack
-   **FastAPI**: Modern, fast (high-performance) web framework for building APIs.
-   **MongoDB Atlas**: Cloud-hosted MongoDB database.
-   **PyMongo**: Official Python driver for MongoDB.
-   **Pydantic**: Data validation and settings management.
-   **JWT Authentication**: Secure authentication via JSON Web Tokens.
-   **Bcrypt**: Password hashing for secure storage.

## Project Structure
```text
backend/
├── app/
│   ├── config/       # Database and app configuration
│   ├── middleware/   # Auth and custom middleware
│   ├── models/       # Pydantic schemas (Request/Response)
│   ├── routes/       # API endpoints (Auth, Products, Orders, etc.)
│   ├── utils/        # Security and helper utilities
│   └── main.py       # App entry point
├── .env              # Environment variables
├── requirements.txt  # Project dependencies
└── README.md         # Setup instructions
```

## Setup Instructions

### 1. Prerequisites
-   Python 3.8+
-   MongoDB Atlas Cluster (Free tier works great)

### 2. Environment Variables
Create a `.env` file in the `backend/` directory (or use the one provided):
```env
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=ecommerce_db
SECRET_KEY=generate_a_secure_random_string_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Installation
Create a virtual environment and install dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Running the Application
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.
-   **Interactive API Docs**: `http://localhost:8000/docs`
-   **Alternative Docs**: `http://localhost:8000/redoc`

## API Endpoints Summary

### Auth
-   `POST /auth/register`: Register a new user (`user` or `admin`).
-   `POST /auth/login`: Login to receive JWT token.

### Users
-   `GET /users/profile`: Get current user profile (Protected).

### Products
-   `GET /products`: List all products (Public).
-   `POST /products`: Create new product (Admin only).
-   `GET /products/{id}`: Get product details (Public).
-   `PUT /products/{id}`: Update product (Admin only).
-   `DELETE /products/{id}`: Delete product (Admin only).

### Orders
-   `POST /orders`: Place a new order (User only, auto-deducts stock).
-   `GET /orders`: List orders (Users see own, Admin sees all).
-   `PUT /orders/{id}`: Update order status (Admin only).
