import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router'
import { FiUpload, FiMessageSquare, FiMenu, FiLogIn, FiLogOut, FiHome, FiX } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth, logout } from './slices/authSlice'
import ThemeToggle from './components/ThemeToggle'
import Home from './pages/Home'
import UploadPage from './pages/UploadPage'
import ChatPage from './pages/ChatPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'


const navItems = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/upload', label: 'Upload', icon: FiUpload },
  { to: '/chat', label: 'Chat', icon: FiMessageSquare },
]

function NavLinkItem({ to, label, icon: Icon, onNavigate, showUnderline = true }: { to: string; label: string; icon: React.ElementType; onNavigate?: () => void; showUnderline?: boolean }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative flex items-center gap-1.5 px-3 py-1.5 text-sm transition ${
          isActive ? 'text-pine' : 'text-mute hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={15} />
          {label}
          {isActive && showUnderline && <span className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 h-[3px] w-4 bg-pine" />}
        </>
      )}
    </NavLink>
  )
}

let authChecked = false

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: any) => state.auth.user)
  const checked = useSelector((state: any) => state.auth.checked)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (checked && !user) navigate('/login', { replace: true, state: { from: location.pathname } })
  }, [checked, user])

  if (!checked) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-5 h-5 border-2 border-line border-t-pine rounded-full animate-spin" />
      </div>
    )
  }
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
    if (authChecked) return
    authChecked = true
    dispatch(checkAuth())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-paper text-ink">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 bg-paper/90 backdrop-blur border-b border-line sticky top-0 z-50">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <span className="w-2.5 h-3 bg-pine group-hover:bg-pine-deep transition-colors" />
          <span className="font-serif text-lg font-semibold tracking-tight">RAG Chatbot</span>
        </NavLink>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="sm:hidden p-2 text-mute hover:text-ink transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
          <div className="hidden sm:flex items-center gap-1">
            {user ? (
              <>
                {navItems.map((item) => (
                  <NavLinkItem key={item.to} {...item} />
                ))}
                <span className="h-5 w-px bg-line mx-2" />
                <span className="text-sm text-mute px-2">{user.name}</span>
                <button
                  onClick={() => dispatch(logout())}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-mute hover:text-error transition"
                >
                  <FiLogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-mute hover:text-ink transition">
                <FiLogIn size={15} /> Login
              </NavLink>
            )}
          </div>
        </div>
      </nav>
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-1 p-3 bg-paper border-b border-line shadow-sm">
          {user ? (
            <>
              <span className="text-sm text-mute px-3 py-1">{user.name}</span>
              {navItems.map((item) => (
                <NavLinkItem key={item.to} {...item} onNavigate={() => setMenuOpen(false)} showUnderline={false} />
              ))}
              <button
                onClick={() => { dispatch(logout()); setMenuOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-mute hover:text-error transition"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-mute hover:text-ink transition"
            >
              <FiLogIn /> Login
            </NavLink>
          )}
        </div>
      )}
      <main className="p-4 sm:p-6 max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
