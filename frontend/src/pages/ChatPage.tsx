import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  listChats, createChat, getChat, deleteChat, askInChat, getFiles, clearActiveChat,
} from '../store/apiSlice'
import { FiSend, FiPlus, FiTrash2, FiChevronLeft, FiChevronRight, FiFile } from 'react-icons/fi'
import MessageBubble, { ChatEmptyState } from '../components/MessageBubble'

function formatDate(ts?: string) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const EXAMPLE_QUESTIONS = [
  'What is this document about?',
  'Summarize the key points',
  'What are the main conclusions?',
]

export default function ChatPage() {
  const dispatch = useDispatch<any>()
  const chats = useSelector((state: any) => state.api.chats)
  const activeChat = useSelector((state: any) => state.api.activeChat)
  const files = useSelector((state: any) => state.api.files)
  const chatError = useSelector((state: any) => state.api.chatError)
  const chatLoading = useSelector((state: any) => state.api.chatLoading)
  const [question, setQuestion] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dispatch(listChats())
    dispatch(getFiles(undefined))
    const storedId = localStorage.getItem('activeChatId')
    if (storedId) dispatch(getChat(storedId))
  }, [dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages, sending])

  const handleNewChat = () => {
    dispatch(clearActiveChat())
    localStorage.removeItem('activeChatId')
    setSidebarOpen(false)
  }

  const handleSelectChat = (id: string) => {
    localStorage.setItem('activeChatId', id)
    dispatch(getChat(id))
  }

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (activeChat?._id === id) localStorage.removeItem('activeChatId')
    dispatch(deleteChat(id))
  }

  const handleSubmit = async () => {
    if (!question.trim() || sending) return
    setSending(true)
    const q = question
    setQuestion('')

    try {
      if (activeChat) {
        const res: any = await dispatch(askInChat({ chatId: activeChat._id, question: q, fileId: selectedFile || undefined }))
        if (askInChat.rejected.match(res)) dispatch(getChat(activeChat._id))
      } else {
        const { payload: newChat }: any = await dispatch(createChat())
        if (newChat) {
          localStorage.setItem('activeChatId', newChat._id)
          const res: any = await dispatch(askInChat({ chatId: newChat._id, question: q, fileId: selectedFile || undefined }))
          if (askInChat.rejected.match(res)) dispatch(getChat(newChat._id))
        }
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] relative rounded-md border border-line bg-paper overflow-hidden">
      {sidebarOpen && (
        <>
          <div
            className="absolute inset-0 z-20 bg-black/30 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute sm:relative z-30 sm:z-auto inset-y-0 left-0 w-72 border-r border-line bg-paper flex flex-col shrink-0 animate-rise sm:animate-none">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">Library</p>
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 text-xs font-medium text-pine hover:text-pine-deep transition"
              >
                <FiPlus size={14} /> New
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat: any) => (
                <div
                  key={chat._id}
                  onClick={() => handleSelectChat(chat._id)}
                  className={`group cursor-pointer border-b border-line px-4 py-3 pl-5 transition ${
                    activeChat?._id === chat._id ? 'border-l-2 border-l-pine bg-pine-tint/40' : 'hover:bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`truncate font-serif text-[15px] leading-snug ${activeChat?._id === chat._id ? 'text-pine' : 'text-ink'}`}>
                      {chat.title}
                    </p>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat._id)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 text-mute hover:text-error"
                      aria-label="Delete chat"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                  <p className="font-mono text-[10px] text-mute mt-1">{formatDate(chat.updatedAt)}</p>
                </div>
              ))}
              {chats.length === 0 && (
                <div className="px-4 py-10">
                  <p className="text-sm text-ink">No conversations yet.</p>
                  <p className="text-xs text-mute mt-1">Start a new chat and it will appear here.</p>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-line bg-paper">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-mute hover:text-ink hover:bg-card rounded-md transition"
            aria-label={sidebarOpen ? 'Close library' : 'Open library'}
          >
            {sidebarOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
          </button>
          {activeChat && (
            <p className="font-serif text-base text-ink truncate hidden sm:block">{activeChat.title}</p>
          )}
          <div className="relative ml-auto sm:ml-4">
            <FiFile size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-card border border-line rounded-md text-sm appearance-none outline-none focus:border-pine focus:ring-2 focus:ring-pine/15 w-full sm:w-48 transition"
            >
              <option value="">All files</option>
              {files?.map((f: any) => (
                <option key={f._id} value={f._id}>{f.originalName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          {!activeChat && chatLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="w-5 h-5 border-2 border-line border-t-pine rounded-full animate-spin" />
            </div>
          ) : !activeChat ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h2 className="font-serif text-2xl text-ink">Start a conversation</h2>
              <p className="text-sm text-mute mt-2 max-w-sm">
                Pick a conversation from the library, or start a new one and ask about your documents.
              </p>
              <button
                onClick={handleNewChat}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-pine text-paper font-medium rounded-md text-sm hover:bg-pine-deep transition"
              >
                <FiPlus size={15} /> New chat
              </button>
            </div>
          ) : activeChat.messages?.length === 0 ? (
            <ChatEmptyState exampleQuestions={EXAMPLE_QUESTIONS} onPick={(q) => setQuestion(q)} />
          ) : (
            activeChat.messages?.filter((msg: any) => msg.role === 'assistant').map((msg: any, i: number) => (
              <MessageBubble
                key={i}
                role="assistant"
                content={msg.text}
                citations={msg.sources ?? null}
                timestamp={msg.timestamp}
              />
            ))
          )}
          {sending && (
            <MessageBubble role="assistant" content="" isStreaming />
          )}
          {chatError && (
            <div className="flex justify-start animate-rise">
              <div className="w-9 shrink-0" />
              <div className="max-w-[75%] bg-error/5 border border-error/25 rounded-md px-4 py-3 text-sm text-error">
                {chatError}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 sm:px-8 py-4 border-t border-line bg-paper">
          <div className="flex gap-2 max-w-3xl">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              placeholder={activeChat ? 'Ask a follow-up…' : 'Ask about your documents…'}
              className="flex-1 px-4 py-2.5 bg-card border border-line rounded-md text-sm outline-none placeholder:text-mute/50 focus:border-pine focus:ring-2 focus:ring-pine/15 transition"
              disabled={sending}
            />
            <button
              onClick={handleSubmit}
              disabled={sending || !question.trim()}
              className="px-3.5 bg-pine text-paper rounded-md hover:bg-pine-deep disabled:opacity-40 transition"
              aria-label="Send question"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
