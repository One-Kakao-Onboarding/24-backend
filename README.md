# TalkLog Backend

Backend server for TalkLog - AI-powered picture diary from chat messages using Google Gemini and Nanobanana (Imagen 3).

## Features

- 🤖 Chat with Gemini AI in KakaoTalk-style interface
- 🎨 Generate picture diaries using Google Nanobanana (Imagen 3)
- 💾 Store messages and diaries in Supabase
- 🔒 CORS configured for secure frontend communication

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `GEMINI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `FRONTEND_URL`: Your frontend URL (default: http://localhost:5173)

### 3. Setup Supabase Database

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the SQL script in `supabase-schema.sql`

### 4. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

### Chat API

**POST** `/api/chat/send`
- Send a message and get AI response
- Body: `{ message: string, userId?: string }`
- Returns: `{ message: string, messageId: string }`

**GET** `/api/chat/messages?userId=xxx`
- Get today's chat messages
- Returns: `{ messages: Array }`

### Diary API

**POST** `/api/diary/generate`
- Generate picture diary from today's messages
- Body: `{ userId?: string }`
- Returns: `{ diary: { id, summary, imageUrl, messageCount, createdAt } }`

**GET** `/api/diary/list?userId=xxx`
- Get user's diary entries
- Returns: `{ diaries: Array }`

### Health Check

**GET** `/health`
- Check server status
- Returns: `{ status: 'ok', message: string }`

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── gemini.js    # Google Gemini setup
│   │   └── supabase.js  # Supabase client
│   ├── controllers/     # Business logic
│   │   ├── chatController.js
│   │   └── diaryController.js
│   ├── middleware/      # Express middleware
│   │   └── cors.js      # CORS configuration
│   ├── routes/          # API routes
│   │   ├── chat.js
│   │   └── diary.js
│   └── server.js        # Main server file
├── .env.example
├── package.json
└── README.md
```

## Deployment

### Deploy to Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables: `railway variables`
5. Deploy: `railway up`

### Deploy to Render

1. Create new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

## CORS Configuration

CORS is configured in `src/middleware/cors.js` to allow:
- Credentials: true
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Origins: Frontend URL from environment variable

For production, update `FRONTEND_URL` in your deployment environment variables.

## Technologies

- **Express**: Web framework
- **Google Gemini**: AI chat responses
- **Google Nanobanana (Imagen 3)**: Picture generation
- **Supabase**: Database and storage
- **CORS**: Cross-origin resource sharing
