import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFiles, askQuestion } from '../store/apiSlice'
import { FiSend, FiMessageSquare } from 'react-icons/fi'

export default function ChatPage() {
  const dispatch = useDispatch<any>()
  const { files } = useSelector((state: any) => state.api)
  const [question, setQuestion] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])

  useEffect(() => {
    dispatch(getFiles())
  }, [dispatch])

  const handleSubmit = async () => {
    if (!question.trim()) return
    const userMsg = { role: 'user', text: question }
    setMessages((prev) => [...prev, userMsg])
    setQuestion('')

    try {
      const res: any = await dispatch(askQuestion({ question, fileId: selectedFile || undefined }))
      const answer = res.payload?.answer || res.payload?.text || 'No response'
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Something went wrong.' }])
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="mb-4">
        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="">All files</option>
          {files?.map((f: any) => (
            <option key={f._id} value={f._id}>{f.originalName}</option>
          ))}
        </select>
      </div>

      <div className="h-[500px] overflow-y-auto border rounded-lg p-4 bg-white space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-gray-400 mt-20">
            <FiMessageSquare className="text-4xl mb-2" />
            <p>Ask a question about your documents</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Type your question..."
          className="flex-1 p-3 border rounded-lg"
        />
        <button onClick={handleSubmit} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiSend />
        </button>
      </div>
    </div>
  )
}
