import { useNavigate } from 'react-router'
import { FiUpload, FiMessageSquare, FiCpu } from 'react-icons/fi'

const cards = [
  { icon: FiUpload, label: 'Upload PDF', desc: 'Add documents to your knowledge base', path: '/upload', gradient: 'from-blue-500 to-cyan-400' },
  { icon: FiMessageSquare, label: 'Chat', desc: 'Ask questions about your documents', path: '/chat', gradient: 'from-violet-500 to-purple-400' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg mb-4">
          <FiCpu size={28} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          RAG Chatbot
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md">
          Upload PDFs and ask intelligent questions about them
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {cards.map(({ icon: Icon, label, desc, path, gradient }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="group relative flex items-center sm:flex-col gap-4 sm:gap-3 p-5 sm:p-7 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 w-full sm:w-56 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left sm:text-center cursor-pointer"
          >
            <div className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
              <Icon size={20} />
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{label}</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
