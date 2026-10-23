// Every page section uses this wrapper, so spacing, width and background are decided in ONE place.
// tone: 'cream' (default), 'tint' (slightly darker cream), 'dark' (near-black) or 'night' (deep green).
// background: optional extra layers (like a photo) drawn behind the content.
//
// Sections use the FULL width of the screen. Only the side padding (the "gutter") keeps content
// off the edges; it is the same as the header's and footer's, so everything lines up.
export const gutter = 'px-5 sm:px-8 lg:px-12 xl:px-16'

const tones = {
  cream: 'bg-cream text-ink',
  tint: 'bg-tint text-ink',
  dark: 'bg-ink text-cream',
  night: 'bg-night text-cream',
}

export default function Section({ id, tone = 'cream', background, className = '', children }) {
  return (
    // overflow-clip (not overflow-hidden) trims anything spilling out but still lets
    // `sticky` children stick while the page scrolls (used in the contact section).
    <section id={id} className={`relative isolate overflow-clip py-20 md:py-28 xl:py-32 ${gutter} ${tones[tone]} ${className}`}>
      {background}
      {children}
    </section>
  )
}
