import { useState } from 'react'

export interface Source {
  fileId: string
  fileName: string
  url?: string
  chunk?: number
  excerpt?: string
}

export default function CitationTab({ source, index }: { source: Source; index: number }) {
  const [open, setOpen] = useState(false)
  const label = `§${source.chunk ?? index + 1}`
  const name = source.fileName || 'Document'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-expanded={open}
        aria-label={`Source ${label}: ${name}`}
        title={`From ${name}`}
        className="flex items-center justify-center h-6 min-w-8 px-1 bg-amber text-[#16191C] font-mono text-[10px] font-medium hover:brightness-105 transition-[filter] [clip-path:polygon(0_0,calc(100%-7px)_0,100%_7px,100%_100%,0_100%)]"
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-8 z-30 sm:left-full sm:top-0 sm:ml-2 w-64 md:w-72 bg-card border border-line rounded-md shadow-md p-3 text-left animate-tab">
          <p className="font-mono text-[10px] uppercase tracking-wider text-mute mb-1.5 truncate">
            {name} <span className="text-amber">· {label}</span>
          </p>
          <p className="text-xs leading-relaxed text-ink line-clamp-4">
            {source.excerpt || 'Source passage not available.'}
          </p>
        </div>
      )}
    </div>
  )
}
