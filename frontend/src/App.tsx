import { useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router'
import { FiUpload, FiMessageSquare, FiMenu, FiLogIn, FiLogOut, FiHome } from 'react-icons/fi'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth, logout } from './slices/authSlice'
import ThemeToggle from './components/ThemeToggle'
import Home from './pages/Home'
import UploadPage from './pages/UploadPage'
import ChatPage from './pages/ChatPage'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: any) => state.auth.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user])

  return user ? <>{children}</> : null
}

export default function App() {
  const dispatch = useDispatch<any>()
  const user = useSelector((state: any) => state.auth.user)
  const theme = useSelector((state: any) => state.theme.mode)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <nav className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <Link to="/" className="text-lg font-bold tracking-tight">RAG Chatbot</Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
            <FiMenu className="text-xl" />
          </button>
          <div className="hidden sm:flex items-center gap-1">
            {user ? (
              <>
                <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"><FiHome size={15} /> Home</Link>
                <Link to="/upload" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"><FiUpload size={15} /> Upload</Link>
                <Link to="/chat" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"><FiMessageSquare size={15} /> Chat</Link>
                <span className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1" />
                <span className="text-sm text-gray-500 dark:text-gray-400 px-2">{user.name}</span>
                <button onClick={() => dispatch(logout())} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"><FiLogOut size={15} /> Logout</button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"><FiLogIn size={15} /> Login</Link>
            )}
          </div>
        </div>
      </nav>
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-1 p-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          {user ? (
            <>
              <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1">{user.name}</span>
              <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMenuOpen(false)}><FiHome /> Home</Link>
              <Link to="/upload" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMenuOpen(false)}><FiUpload /> Upload</Link>
              <Link to="/chat" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMenuOpen(false)}><FiMessageSquare /> Chat</Link>
              <button onClick={() => { dispatch(logout()); setMenuOpen(false) }} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><FiLogOut /> Logout</button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMenuOpen(false)}><FiLogIn /> Login</Link>
          )}
        </div>
      )}
      <main className="p-4 sm:p-6 max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
