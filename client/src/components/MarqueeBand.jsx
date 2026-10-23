import Doodle from './Doodle'

// Word size: 'lg' (default) for the big band under the hero, 'sm' for a quieter band.
const sizes = {
  lg: { band: 'py-4 sm:py-5', word: 'text-2xl sm:text-4xl', gap: 'gap-6 pr-6 sm:gap-8 sm:pr-8', star: 'size-4 sm:size-5' },
  sm: { band: 'py-4 sm:py-5', word: 'text-2xl sm:text-4xl', gap: 'gap-6 pr-6 sm:gap-8 sm:pr-8', star: 'size-4 sm:size-5' },
}

const tones = {
  dark: 'bg-ink text-cream',
  gold: 'bg-gold text-ink',
}

// A full-width band of big italic words gliding sideways, separated by twinkling sparkles.
//   <MarqueeBand label="What we photograph" items={['Portraits', 'Weddings']} />
// Like the footer photos, the row holds the words twice and slides by exactly one copy, so it
// loops seamlessly. `reverse` makes it glide the other way; hovering pauses it.
export default function MarqueeBand({ label, items, tone = 'dark', size = 'lg', reverse = false }) {
  const s = sizes[size]

  // Repeat the list until one copy is comfortably wider than a big screen, then double it.
  const oneCopy = Array.from({ length: 3 }, () => items).flat()
  const words = [...oneCopy, ...oneCopy]

  return (
    <section aria-label={label} className={`group overflow-hidden ${s.band} ${tones[tone]}`}>
      {/* Screen readers get the plain list once; the moving copies are decoration */}
      <p className="sr-only">{items.join(', ')}</p>

      <div
        aria-hidden="true"
        className={`flex w-max animate-marquee items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none ${
          reverse ? '[animation-direction:reverse]' : ''
        }`}
      >
        {words.map((word, index) => (
          // Each word carries its own right padding (not a flex gap), so both copies are the same width
          <span key={index} className={`flex items-center ${s.gap}`}>
            <span className={`whitespace-nowrap font-display font-medium italic ${s.word}`}>{word}</span>
            <Doodle
              name="sparkle"
              className={`animate-twinkle ${s.star} ${tone === 'dark' ? 'text-gold' : 'text-ember'}`}
            />
          </span>
        ))}
      </div>
    </section>
  )
}
