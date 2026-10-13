export default function SectionHeading({ eyebrow, number, title, children, aside, dark = false }) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-10">
      <div className="max-w-xl">
        <p
          className={`mb-5 flex items-center gap-3 text-[0.8rem] font-medium uppercase tracking-[0.22em] sm:text-sm ${
            dark ? 'text-gold' : 'text-ember'
          }`}
        >
          {number && (
            <span aria-hidden="true" className="font-display text-lg font-normal normal-case italic tracking-normal">
              {number}
            </span>
          )}
          <span>{eyebrow}</span>
          <span aria-hidden="true" className="h-px w-10 bg-current opacity-60" />
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

      {aside && <div className="md:max-w-lg">{aside}</div>}
    </div>
  )
}