import { useNavigate } from 'react-router'
import { FiUpload, FiMessageSquare, FiArrowRight } from 'react-icons/fi'

const cards = [
  { icon: FiUpload, label: 'Upload a document', desc: 'Add PDFs to your reading list', path: '/upload' },
  { icon: FiMessageSquare, label: 'Ask your documents', desc: 'Get answers traced to their source', path: '/chat' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-8.5rem)] px-4 gap-10">
      <div className="text-center max-w-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">RAG Chatbot</p>
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight text-ink mt-4">
          Ask your documents.<br />Trace every answer.
        </h1>
        <p className="text-mute text-[15px] leading-relaxed mt-5">
          Upload PDFs and ask questions in plain language. The assistant answers only from
          your files, and marks the passage each answer came from.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {cards.map(({ icon: Icon, label, desc, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="group flex items-center gap-5 p-5 sm:p-6 bg-card border border-line rounded-md hover:border-pine/40 transition text-left cursor-pointer w-full sm:w-72"
          >
            <span className="shrink-0 w-10 h-10 bg-pine-tint text-pine flex items-center justify-center rounded-[4px] transition group-hover:bg-pine group-hover:text-paper">
              <Icon size={18} />
            </span>
            <span className="min-w-0">
              <span className="block font-serif text-lg text-ink">{label}</span>
              <span className="block text-sm text-mute mt-0.5">{desc}</span>
            </span>
            <FiArrowRight className="ml-auto text-mute shrink-0 transition group-hover:text-pine group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  )
}
