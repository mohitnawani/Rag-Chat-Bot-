import { useNavigate } from 'react-router'
import { FiFileText, FiUpload, FiMessageSquare } from 'react-icons/fi'

const cards = [
  { icon: FiUpload, label: 'Upload', color: 'text-blue-500', path: '/upload' },
  { icon: FiFileText, label: 'Manage Files', color: 'text-green-500', path: '/upload' },
  { icon: FiMessageSquare, label: 'Chat', color: 'text-purple-500', path: '/chat' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center mt-10 sm:mt-20 gap-6 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center">RAG Chatbot</h1>
      <p className="text-gray-500 text-base sm:text-lg text-center">Upload PDFs and ask questions about them</p>
      <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
        {cards.map(({ icon: Icon, label, color, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex items-center sm:flex-col gap-4 sm:gap-2 p-4 sm:p-6 bg-white rounded-xl shadow-sm border w-full sm:w-40 hover:shadow-md hover:border-blue-300 transition cursor-pointer"
          >
            <Icon className={`text-2xl sm:text-3xl ${color}`} />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
