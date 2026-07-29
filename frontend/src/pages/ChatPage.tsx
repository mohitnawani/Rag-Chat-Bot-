import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  listChats, createChat, getChat, deleteChat, askInChat, getFiles, clearActiveChat,
} from '../store/apiSlice'
import { FiSend, FiMessageSquare, FiPlus, FiTrash2, FiChevronLeft } from 'react-icons/fi'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

function ChatMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          if (match) {
            return (
              <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          }
          return (
            <code className="bg-gray-200 px-1 rounded text-sm" {...props}>
              {children}
            </code>
          )
        },
      }}
    >
      {text}
    </ReactMarkdown>
  )
}

export default function ChatPage() {
  const dispatch = useDispatch<any>()
  const chats = useSelector((state: any) => state.api.chats)
  const activeChat = useSelector((state: any) => state.api.activeChat)
  const files = useSelector((state: any) => state.api.files)
  const [question, setQuestion] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dispatch(listChats())
    dispatch(getFiles(undefined))
  }, [dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages])

  const handleNewChat = () => {
    dispatch(clearActiveChat())
  }

  const handleSelectChat = (id: string) => {
    dispatch(getChat(id))
  }

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    dispatch(deleteChat(id))
  }

  const handleSubmit = async () => {
    if (!question.trim() || sending) return
    setSending(true)
    const q = question
    setQuestion('')

    try {
      if (activeChat) {
        await dispatch(askInChat({ chatId: activeChat._id, question: q, fileId: selectedFile || undefined }))
      } else {
        const { payload: newChat }: any = await dispatch(createChat())
        if (newChat) {
          await dispatch(askInChat({ chatId: newChat._id, question: q, fileId: selectedFile || undefined }))
        }
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0">
      {sidebarOpen && (
        <div className="w-72 border-r bg-white flex flex-col shrink-0">
          <div className="p-3 border-b">
            <button
              onClick={handleNewChat}
              className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <FiPlus /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.map((chat: any) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm ${
                  activeChat?._id === chat._id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                <span className="truncate flex-1">{chat.title}</span>
                <button
                  onClick={(e) => handleDeleteChat(e, chat._id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
            {chats.length === 0 && (
              <p className="text-gray-400 text-center text-sm mt-8">No chats yet</p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 p-3 border-b bg-white">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <FiChevronLeft className={sidebarOpen ? '' : 'rotate-180'} />
          </button>
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="p-1.5 border rounded-lg text-sm"
          >
            <option value="">All files</option>
            {files?.map((f: any) => (
              <option key={f._id} value={f._id}>{f.originalName}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeChat ? (
            <div className="flex flex-col items-center text-gray-400 mt-20">
              <FiMessageSquare className="text-5xl mb-3" />
              <p>Select a chat or start a new one</p>
            </div>
          ) : activeChat.messages?.length === 0 ? (
            <div className="flex flex-col items-center text-gray-400 mt-20">
              <FiMessageSquare className="text-4xl mb-2" />
              <p>Ask a question to begin</p>
            </div>
          ) : (
            activeChat.messages?.map((msg: any, i: number) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg prose prose-sm max-w-none ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {msg.role === 'user' ? msg.text : <ChatMessage text={msg.text} />}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg text-gray-500">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={activeChat ? 'Ask a follow-up...' : 'Type your question to start a new chat...'}
              className="flex-1 p-3 border rounded-lg"
              disabled={sending}
            />
            <button
              onClick={handleSubmit}
              disabled={sending}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
