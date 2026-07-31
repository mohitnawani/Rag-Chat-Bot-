interface AuthAsideProps {
  eyebrow: string
  title: string
  body: string
  steps: string[]
  note: string
}

export default function AuthAside({ eyebrow, title, body, steps, note }: AuthAsideProps) {
  return (
    <aside className="hidden lg:flex flex-col justify-between border-r border-line p-12 pr-16">
      <div className="max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">{eyebrow}</p>
        <h2 className="font-serif text-3xl leading-snug text-ink mt-4">{title}</h2>
        <p className="text-[15px] leading-relaxed text-mute mt-4">{body}</p>
        <ol className="mt-10 space-y-5">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="font-mono text-xs text-pine mt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-sm leading-relaxed text-ink">{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="font-mono text-[11px] text-mute border-t border-line pt-4 max-w-md">{note}</p>
    </aside>
  )
}
