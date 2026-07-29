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
    <div className="flex flex-col items-center justify-center mt-20 gap-6">
      <h1 className="text-4xl font-bold">RAG Chatbot</h1>
      <p className="text-gray-500 text-lg">Upload PDFs and ask questions about them</p>
      <div className="flex gap-4 mt-4">
        {cards.map(({ icon: Icon, label, color, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border w-40 hover:shadow-md hover:border-blue-300 transition cursor-pointer"
          >
            <Icon className={`text-3xl ${color} mb-2`} />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
