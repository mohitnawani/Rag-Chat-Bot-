import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  listChats, createChat, getChat, deleteChat, askInChat, getFiles, clearActiveChat,
} from '../store/apiSlice'
import { FiSend, FiMessageSquare, FiPlus, FiTrash2, FiChevronLeft, FiChevronRight, FiFile } from 'react-icons/fi'
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
            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm" {...props}>
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
    setSidebarOpen(false)
  }

  const handleSelectChat = (id: string) => {
    dispatch(getChat(id))
    setSidebarOpen(false)
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
    <div className="flex h-[calc(100vh-80px)] sm:h-[calc(100vh-88px)] gap-0 relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      {sidebarOpen && (
        <div className="absolute sm:relative z-10 inset-0 sm:inset-auto w-full sm:w-72 border-r border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm sm:bg-gray-50 dark:sm:bg-gray-950 flex flex-col shrink-0">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={handleNewChat}
              className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition mr-2"
            >
              <FiPlus size={16} /> New Chat
            </button>
            <button onClick={() => setSidebarOpen(false)} className="sm:hidden p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <FiChevronRight />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.map((chat: any) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-sm transition ${
                  activeChat?._id === chat._id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="truncate flex-1">{chat.title}</span>
                <button
                  onClick={(e) => handleDeleteChat(e, chat._id)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition"
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

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <FiChevronLeft className={`${sidebarOpen ? '' : 'rotate-180'} transition`} />
          </button>
          <div className="relative flex-1 sm:flex-none">
            <FiFile size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-full sm:w-48"
            >
              <option value="">All files</option>
              {files?.map((f: any) => (
                <option key={f._id} value={f._id}>{f.originalName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!activeChat ? (
            <div className="flex flex-col items-center text-gray-400 mt-20">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <FiMessageSquare className="text-3xl" />
              </div>
              <p className="text-center text-lg font-medium text-gray-500 dark:text-gray-400">Select a chat or start a new one</p>
            </div>
          ) : activeChat.messages?.length === 0 ? (
            <div className="flex flex-col items-center text-gray-400 mt-20">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <FiMessageSquare className="text-2xl" />
              </div>
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Ask a question to begin</p>
            </div>
          ) : (
            activeChat.messages?.map((msg: any, i: number) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 text-white flex items-center justify-center text-xs font-bold mr-3 mt-1 shrink-0 shadow-sm">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                  }`}
                >
                  {msg.role === 'user' ? msg.text : <ChatMessage text={msg.text} />}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center text-xs font-bold ml-3 mt-1 shrink-0 shadow-sm">
                    U
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
                AI
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3.5 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              placeholder={activeChat ? 'Ask a follow-up...' : 'Type your question...'}
              className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
              disabled={sending}
            />
            <button
              onClick={handleSubmit}
              disabled={sending || !question.trim()}
              className="p-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 transition shadow-sm"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
