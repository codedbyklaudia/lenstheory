import Doodle from '../Doodle'

// Small pieces shared by the account page's tabs.

// A rubber-stamp style label, slightly tilted: <Stamp tone="ember">Paid</Stamp>
const stampTones = {
  ember: 'border-ember text-ember',
  night: 'border-night text-night',
  gold: 'border-gold bg-gold/25 text-ink',
  muted: 'border-ink-soft/40 text-ink-soft',
}

export function Stamp({ tone = 'ember', className = '', children }) {
  return (
    <span
      className={`inline-block -rotate-6 rounded-md border-2 px-2.5 py-0.5 font-display text-sm font-semibold uppercase tracking-[0.15em] ${stampTones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

// What a tab shows when it has nothing in it yet: a picture, a friendly title, and what happens next.
// Pass either `doodle` (a small Doodle name) or `illustration` (a bigger drawing from Illustrations.jsx).
export function EmptyState({ doodle, illustration, title, children, action }) {
  return (
    <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border-2 border-dashed border-ink/20 bg-cream px-6 py-14 text-center">
      {illustration ?? <Doodle name={doodle} className="size-20 animate-float text-ember motion-reduce:animate-none" />}
      <Doodle name="sparkle" className="absolute left-[30%] top-10 size-5 animate-twinkle text-gold motion-reduce:animate-none" />
      <h3 className="font-display text-3xl">{title}</h3>
      <p className="max-w-md text-pretty text-ink-soft">{children}</p>
      {action}
    </div>
  )
}

// Shown while a tab's data is on its way.
export function Loading({ children }) {
  return (
    <p className="flex items-center gap-3 py-10 text-ink-soft">
      <Doodle name="camera" className="size-8 animate-wiggle text-ember motion-reduce:animate-none" />
      {children}
    </p>
  )
}
