# RAG Chatbot

PDF-powered RAG chatbot using Gemini AI, Pinecone vector search, and MongoDB.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Redux Toolkit, React Router v7, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), Pinecone, Gemini AI, Cloudinary
- **Features:** PDF upload, vector embeddings, semantic search, chat history (persisted in MongoDB)

## Setup

### Prerequisites

- Node.js 20+
- MongoDB Atlas URI
- Pinecone account
- Gemini API key
- Cloudinary account

### Environment Variables

Copy `backend/.env` and fill your keys:

```
PORT=3000
MongoDB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX=rag-chatbot
```

### Development

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.  
Vite proxies `/api` requests to the backend automatically.

### Production

```bash
cd frontend && npm run build
cd ../backend && npm start
```

Express serves the built frontend from `frontend/dist` and handles all API routes under `/api`.

## Deployment (Render)

1. Push repo to GitHub
2. Create a **Web Service** on [Render](https://render.com)
3. Configure:

| Field | Value |
|-------|-------|
| **Root Directory** | `Rag_Chatbot` |
| **Build Command** | `cd frontend && npm install && npm run build` |
| **Start Command** | `cd backend && npm install && npm start` |
| **Environment Variables** | Add all keys from `backend/.env` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/upload/getfiles` | List uploaded files |
| POST | `/api/upload` | Upload PDF |
| DELETE | `/api/upload/:id` | Delete file |
| POST | `/api/upload/query` | Ask question (legacy) |
| GET | `/api/chat` | List chat sessions |
| POST | `/api/chat` | Create new chat |
| GET | `/api/chat/:id` | Get chat messages |
| DELETE | `/api/chat/:id` | Delete chat |
| POST | `/api/chat/:id/ask` | Ask question in chat |

## Project Structure

```
Rag_Chatbot/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary
│   │   ├── controllers/     # upload, query, chat
│   │   ├── middleware/       # multer upload
│   │   ├── models/          # File, Chat schemas
│   │   ├── routes/          # upload, chat routes
│   │   └── services/        # embeddings, extraction, retrieval, vector store
│   ├── index.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── lib/             # axios client
│   │   ├── pages/           # Home, UploadPage, ChatPage
│   │   ├── store/           # Redux slice + async thunks
│   │   ├── App.tsx          # Routes + nav layout
│   │   └── main.tsx         # Provider + BrowserRouter
│   ├── vite.config.ts
│   └── package.json
└── README.md
```
