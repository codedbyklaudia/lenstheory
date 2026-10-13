import { useEffect } from 'react'

// Full-screen photo viewer. It does not own any state: Gallery keeps `index`
// and passes it in, and we report changes back with onChange / onClose.
export default function Lightbox({ photos, index, onChange, onClose }) {
  const photo = photos[index]
  const total = photos.length

  // % total wraps around: after the last photo comes the first, and before the first comes the last.
  const previousIndex = (index - 1 + total) % total
  const nextIndex = (index + 1) % total

  // EFFECT: while the viewer is open, the arrow keys move between photos, Escape closes it,
  // and the page behind it can't scroll. The returned function undoes all of that on close.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onChange(previousIndex)
      if (event.key === 'ArrowRight') onChange(nextIndex)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [previousIndex, nextIndex, onChange, onClose])

  const arrowClasses =
    'pointer-events-auto absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 bg-ink/40 text-2xl leading-none text-cream backdrop-blur transition hover:border-gold hover:text-gold sm:size-12'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 flex animate-fade-in flex-col text-cream motion-reduce:animate-none"
    >
      {/* Dark backdrop: clicking it closes the viewer */}
      <div className="absolute inset-0 bg-ink/95" onClick={onClose} aria-hidden="true" />

      <div className="pointer-events-none relative flex items-center justify-between p-4 sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-cream/80">
          <span className="tabular-nums">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="mx-2 text-gold" aria-hidden="true">
            &middot;
          </span>
          {photo.category}
        </p>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Close photo viewer"
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-cream/30 text-2xl leading-none transition hover:border-gold hover:text-gold"
        >
          &times;
        </button>
      </div>

      <div className="pointer-events-none relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-20">
        <img
          key={photo.id}
          src={photo.src}
          alt={photo.alt}
          className="pointer-events-auto max-h-[calc(100svh-9rem)] max-w-full animate-fade-in rounded-lg object-contain shadow-2xl motion-reduce:animate-none"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => onChange(previousIndex)}
              aria-label="Previous photo"
              className={`${arrowClasses} left-3 sm:left-6`}
            >
              &lsaquo;
            </button>
            <button
              type="button"
              onClick={() => onChange(nextIndex)}
              aria-label="Next photo"
              className={`${arrowClasses} right-3 sm:right-6`}
            >
              &rsaquo;
            </button>
          </>
        )}
      </div>
    </div>
  )
}