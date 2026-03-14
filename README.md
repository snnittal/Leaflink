# LeafLink

A full-stack web application for book enthusiasts to connect, share, and discuss books through social features like posts, comments, and real-time chat in book clubs.

## Features

- **User Authentication**: Register, login with JWT.
- **Book Management**: Add and search books.
- **Social Posts**: Share thoughts on books with ratings and comments.
- **Book Clubs**: Create/join clubs, real-time chat, pinned messages.
- **Recommendations**: AI-powered book suggestions (basic implementation).

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB, Socket.IO
- **Frontend**: React, Vite, TypeScript, React Router
- **Real-Time**: Socket.IO for club chats

## Setup

### Prerequisites

- Node.js 18+
- MongoDB

### Backend

1. `cd backend`
2. `npm install`
3. Copy `.env` and update values
4. `npm run dev`

### Frontend

1. `cd Frontend`
2. `npm install`
3. Copy `.env` and update values
4. `npm run dev`

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/posts` - Get feed
- `POST /api/posts` - Create post
- `GET /api/clubs` - List clubs
- `POST /api/clubs` - Create club
- And more...

## Deployment

- Backend: Deploy to Railway/Heroku
- Frontend: Deploy to Vercel/Netlify
- Database: MongoDB Atlas

## License

MIT
