import { useSelector } from 'react-redux'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CitationTab, { type Source } from './CitationTab'

function Markdown({ text, dark }: { text: string; dark: boolean }) {
  return (
    <div className="md">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            if (match) {
              return (
                <SyntaxHighlighter style={dark ? oneDark : oneLight} language={match[1]} PreTag="div">
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              )
            }
            return <code className={className} {...props}>{children}</code>
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

function MessageTimestamp({ ts, align }: { ts?: string; align: 'left' | 'right' }) {
  if (!ts) return null
  return (
    <p className={`font-mono text-[10px] text-mute mt-1 ${align === 'right' ? 'text-right' : ''}`}>
      {new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </p>
  )
}

export interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  citations?: Source[] | null
  timestamp?: string
}

export default function MessageBubble({
  role,
  content,
  isStreaming = false,
  citations = null,
  timestamp,
}: MessageBubbleProps) {
  const dark = useSelector((state: any) => state.theme.mode) === 'dark'
  const isUser = role === 'user'
  const showCitations = role === 'assistant' && !!citations?.length

  const bubble = isUser ? (
    <div className="bg-pine-tint text-ink rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap max-w-[90%] sm:max-w-[70%]">
      {content}
    </div>
  ) : (
    <div className="bg-card border border-line rounded-2xl rounded-bl-md px-4 py-3.5 text-sm text-ink max-w-[90%] sm:max-w-[70%] min-w-16">
      {isStreaming && !content ? (
        <div className="flex items-center gap-2 h-5" aria-label="Assistant is thinking">
          <span className="w-2 h-2 rounded-full bg-pine/50 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-pine/50 animate-pulse" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 rounded-full bg-pine/50 animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      ) : (
        <span className="flex items-start gap-1">
          <span className="flex-1 min-w-0">
            <Markdown text={content} dark={dark} />
          </span>
          {isStreaming && (
            <span aria-hidden className="w-[1px] h-4 bg-pine animate-pulse mt-1 shrink-0" />
          )}
        </span>
      )}
    </div>
  )

  return (
    <div className={`flex w-full items-start gap-3 animate-rise ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && showCitations && (
        <div className="w-9 shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
          {citations.map((s, j) => (
            <CitationTab key={j} source={s} index={j} />
          ))}
        </div>
      )}
      <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        {bubble}
        <MessageTimestamp ts={timestamp} align={isUser ? 'right' : 'left'} />
      </div>
    </div>
  )
}

export function ChatEmptyState({
  exampleQuestions = [],
  onPick,
}: {
  exampleQuestions?: string[]
  onPick?: (question: string) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-rise">
      <h2 className="font-serif text-2xl text-ink">Ask a question about your document</h2>
      <p className="text-sm text-mute mt-2 max-w-sm">
        Answers come from your files only. Amber tabs mark the exact source passage.
      </p>
      {exampleQuestions.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
          {exampleQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onPick?.(q)}
              className="px-3.5 py-1.5 border border-pine/60 text-pine text-xs rounded-full hover:bg-pine/5 focus-visible:outline-2 focus-visible:outline-pine transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
