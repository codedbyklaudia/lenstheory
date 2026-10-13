import { useEffect } from 'react'
import Button from './Button'

export default function TermsModal({ service, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
        className="relative flex max-h-[85vh] w-full max-w-2xl animate-fade-up flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl motion-reduce:animate-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line p-5 sm:p-6">
          <h2 id="terms-title" className="font-display text-xl sm:text-2xl">
            {service.name}: details &amp; terms
          </h2>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Close details"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-2xl leading-none transition hover:bg-clay"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-5 sm:p-6">
          {service.terms.map((section) => (
            <section key={section.heading}>
              <h3 className="mb-1 font-body text-xs font-medium uppercase tracking-[0.15em] text-ember">
                {section.heading}
              </h3>
              <p className="text-ink-soft">{section.text}</p>
            </section>
          ))}
        </div>

        <div className="flex justify-end border-t border-line bg-tint px-5 py-4 sm:px-6">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}