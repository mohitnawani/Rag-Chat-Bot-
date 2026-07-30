import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../slices/themeSlice'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function ThemeToggle() {
  const dispatch = useDispatch()
  const mode = useSelector((state: any) => state.theme.mode)

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition"
      aria-label="Toggle theme"
    >
      {mode === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
    </button>
  )
}
