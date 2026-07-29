import { Routes, Route, Link } from 'react-router'
import { FiUpload, FiMessageSquare, FiMenu } from 'react-icons/fi'
import { useState } from 'react'
import Home from './pages/Home'
import UploadPage from './pages/UploadPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between p-4 bg-white shadow">
        <Link to="/" className="text-lg font-bold">RAG Chatbot</Link>
        <button className="sm:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
          <FiMenu className="text-xl" />
        </button>
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/upload" className="flex items-center gap-1 text-gray-600 hover:text-gray-900"><FiUpload /> Upload</Link>
          <Link to="/chat" className="flex items-center gap-1 text-gray-600 hover:text-gray-900"><FiMessageSquare /> Chat</Link>
        </div>
      </nav>
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-2 p-4 bg-white border-b shadow-sm">
          <Link to="/upload" className="flex items-center gap-2 text-gray-600" onClick={() => setMenuOpen(false)}><FiUpload /> Upload</Link>
          <Link to="/chat" className="flex items-center gap-2 text-gray-600" onClick={() => setMenuOpen(false)}><FiMessageSquare /> Chat</Link>
        </div>
      )}
      <main className="p-4 sm:p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
    </div>
  )
}
