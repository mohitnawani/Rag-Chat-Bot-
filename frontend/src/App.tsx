import { Routes, Route, Link } from 'react-router'
import { FiUpload, FiMessageSquare } from 'react-icons/fi'
import Home from './pages/Home'
import UploadPage from './pages/UploadPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center gap-4 p-4 bg-white shadow">
        <Link to="/" className="text-lg font-bold">RAG Chatbot</Link>
        <Link to="/upload" className="flex items-center gap-1"><FiUpload /> Upload</Link>
        <Link to="/chat" className="flex items-center gap-1"><FiMessageSquare /> Chat</Link>
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
    </div>
  )
}
