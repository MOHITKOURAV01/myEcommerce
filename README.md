# BookSmart – Smart Book Discovery Platform

> **ShopSmart Project**
> MERN Stack (React.js, Node.js, MongoDB)

---

## About the Project

**BookSmart** is a smart book discovery platform designed to help users choose the *right book for their life situation*, instead of browsing endless categories or best-seller lists.

Unlike traditional book-selling websites that focus on price and popularity, BookSmart focuses on:

* User problems
* Emotional state (mood)
* Reading level
* Language preference

The platform acts as a **decision-support system for readers**, not a book-selling marketplace.

---

## Problem Statement

Current book platforms:

* Recommend books only by category (Fiction, Biography, Self-Help)
* Overwhelm users with thousands of options
* Do not consider user emotions, life problems, or reading level
* Push English content, ignoring regional language readers

As a result:

* Users choose irrelevant books
* Beginners lose interest in reading
* Students and job seekers feel confused

---

## Proposed Solution

BookSmart solves this problem by recommending books based on:

* Real-life problems (career confusion, lack of focus, low confidence, etc.)
* Mood-based discovery (sad, confused, motivated, burnout)
* Reader experience (beginner, restarting, regular reader)
* Language preference (Hindi, English, Hinglish)

The platform provides **honest, transparent book guidance** instead of promotional listings.

---

## Key Features

* Problem-based book recommendations
* Mood-based discovery system
* Beginner-friendly reading paths
* Honest book descriptions (who should / should not read)
* Language-first experience for Indian readers
* Multi-platform buy links (Amazon / Flipkart – Affiliate model)
* Clean and responsive UI

---

## Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js + Express.js
* **Database:** MongoDB
* **Version Control:** Git & GitHub

---

## Project Structure

```
root/
 ├── client/        # React frontend
 ├── server/        # Node.js backend
 ├── README.md      # Project documentation
 ├── Idea.md        # Detailed project idea & problem statement
 └── .gitignore
```

---

## Installation & Setup

### 1. Clone the Repository

```
git clone https://github.com/your-username/booksmart.git
cd booksmart
```

---

### 2. Backend Setup

```
cd server
npm install
npm start
```

Backend will run on:

```
http://localhost:5000
```

---

### 3. Frontend Setup

```
cd client
npm install
npm start
```

Frontend will run on:

```
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file inside the `server` folder:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

---

## Monetization Model

* Affiliate commissions from book platforms (Amazon, Flipkart)
* Sponsored book recommendations (future scope)
* Premium personalized recommendations (future scope)

---

## Legal & Copyright Disclaimer

* This project does **not** host or distribute copyrighted books
* No PDFs, chapters, or pirated content is shared
* Only summaries, reviews, and recommendations are provided
* All external purchase links are affiliate-based

---

## Project Status

* Idea Submission: Completed
* MVP Development: In Progress
* Future Enhancements Planned

---

## Git & Submission Guidelines

* Full Git commit history is maintained
* Repository history will not be deleted or rewritten
* Project complies with ShopSmart guidelines

---

## Author

Developed as part of the **ShopSmart Project** using the MERN stack.

---

## Future Enhancements & Roadmap

BookSmart is designed with scalability and extensibility in mind. While the current version focuses on core discovery features, the following enhancements are planned for future development:

### Planned Features

* **AI-Powered Book Recommendation Assistant**
  An interactive assistant that asks users about their problems, mood, and goals, and suggests personalized book recommendations using predefined logic and AI APIs.

* **User Accounts & Profiles**
  Users will be able to create accounts, save books, track reading progress, and receive personalized suggestions.

* **Reading Paths & Challenges**
  Curated reading journeys for beginners, students, and professionals, along with weekly or monthly reading challenges.

* **Book Comparison Feature**
  Compare two or more books based on suitability, difficulty level, and reader goals.

* **Community Reviews (Moderated)**
  Allow users to share experiences and recommendations in a controlled and moderated environment.

* **Regional Language Expansion**
  Support for more Indian regional languages to increase accessibility.

* **Notification & Email System**
  Notify users about new recommendations, saved book reminders, and reading progress updates.

* **Premium Features (Optional)**
  Advanced AI recommendations and personalized reading plans for subscribed users.

---

## Conclusion

BookSmart is not just a book discovery website but a **user-centric decision-support platform**.

By focusing on problems, emotions, and reader context, it aims to bridge the gap between readers and the books that truly matter to them.

The project demonstrates practical problem-solving, real-world applicability, and a scalable MERN-based architecture, making it suitable for academic evaluation as well as future expansion.
