import Doodle from './Doodle'
import Reveal from './Reveal'

// Every section's heading, in the same big editorial style as the footer:
// a small eyebrow line ("01 Gallery ——"), a large display title, and optional text / aside.
// `title` can contain JSX, e.g. <>Selected <em>work</em></>: an <em> turns italic and coloured.
// `doodle` (optional) is the name of a little illustration that floats next to the title.
export default function SectionHeading({ eyebrow, number, title, children, aside, doodle, dark = false }) {
  const accent = dark ? 'text-gold' : 'text-ember'

  return (
    <Reveal className="mb-12 flex flex-col gap-8 md:mb-16 xl:flex-row xl:items-end xl:justify-between xl:gap-16">
      <div className="max-w-4xl">
        <p className={`mb-6 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.22em] ${accent}`}>
          {number && (
            <span aria-hidden="true" className="font-display text-lg font-normal normal-case italic tracking-normal">
              {number}
            </span>
          )}
          <span>{eyebrow}</span>
          <span aria-hidden="true" className="h-px w-10 bg-current opacity-60" />
        </p>

        <h2
          className={`relative w-fit text-balance font-display text-4xl font-medium leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl [&_em]:italic ${
            dark ? 'text-cream [&_em]:text-gold' : 'text-ink [&_em]:text-ember'
          }`}
        >
          {title}
          {doodle && (
            <Doodle
              name={doodle}
              className={`absolute -right-20 -top-8 hidden size-16 animate-float sm:block ${dark ? 'text-gold' : 'text-ember'}`}
            />
          )}
        </h2>

        {children && (
          <p className={`mt-6 max-w-2xl text-pretty text-lg ${dark ? 'text-cream/75' : 'text-ink-soft'}`}>{children}</p>
        )}
      </div>

      {aside && <div className="xl:max-w-2xl xl:shrink-0">{aside}</div>}
    </Reveal>
  )
}
