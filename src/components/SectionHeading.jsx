// Small label + big title (+ optional paragraph) used at the top of each section.
export default function SectionHeading({ eyebrow, title, children, center = false, dark = false }) {
  return (
    <div className={`mb-10 max-w-xl ${center ? 'mx-auto text-center' : ''}`}>
      <p
        className={`mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] after:h-px after:w-10 after:bg-current after:opacity-60 ${
          center ? 'justify-center' : ''
        } ${dark ? 'text-gold' : 'text-ember'}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`text-balance font-display text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl ${
          dark ? 'text-cream' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      {children && (
        <p className={`mt-3 text-pretty ${dark ? 'text-cream/80' : 'text-ink-soft'}`}>{children}</p>
      )}
    </div>
  )
}