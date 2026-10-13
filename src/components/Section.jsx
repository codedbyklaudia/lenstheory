// Every page section uses this wrapper, so spacing, width and background are decided in ONE place.
// tone: 'cream' (default), 'tint' (slightly darker cream), 'dark' (near-black) or 'night' (deep green).
// background: optional extra layers (like a photo) drawn behind the content.
// wide: use the full width of big screens (used by the contact section).
const tones = {
  cream: 'bg-cream text-ink',
  tint: 'bg-tint text-ink',
  dark: 'bg-ink text-cream',
  night: 'bg-night text-cream',
}

export default function Section({ id, tone = 'cream', background, wide = false, children }) {
  // `wide` gives the section more room: a much wider container and larger side padding.
  const spacing = wide
    ? 'px-5 py-16 sm:px-8 md:py-32 lg:px-16 xl:px-24'
    : 'px-5 py-16 sm:px-8 md:py-24'

  return (
    <section id={id} className={`relative isolate overflow-hidden ${spacing} ${tones[tone]}`}>
      {background}
      <div className={`mx-auto ${wide ? 'max-w-[100rem]' : 'max-w-6xl'}`}>{children}</div>
    </section>
  )
}