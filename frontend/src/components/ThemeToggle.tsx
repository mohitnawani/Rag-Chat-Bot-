import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../slices/themeSlice'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function ThemeToggle() {
  const dispatch = useDispatch()
  const mode = useSelector((state: any) => state.theme.mode)

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-mute hover:text-ink border border-line rounded-md hover:border-pine/40 transition"
      aria-label={mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {mode === 'light' ? <FiMoon size={14} /> : <FiSun size={14} />}
      <span className="hidden md:inline">{mode === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
