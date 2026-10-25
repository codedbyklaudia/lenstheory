import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import Button from './Button'
import HoursStepper from './HoursStepper'

const formatPrice = (value) => `£${value}`

// The basket itself lives in App. This component only DISPLAYS it and reports what the user did
// (change hours, remove, clear, close) by calling the functions App passed in.
// `user` is the signed-in user, or null. Paying needs an account, so guests are asked to sign in.
export default function BasketDrawer({ basket, services, user, onSignIn, onChangeHours, onRemove, onClear, onClose }) {
  const [isPaying, setIsPaying] = useState(false)
  const [error, setError] = useState('')

  // Join each basket line ({ id, hours }) with its service data (name, price, image).
  const lines = basket
    .map((line) => ({ ...line, service: services.find((s) => s.id === line.id) }))
    .filter((line) => line.service)
  const total = lines.reduce((sum, line) => sum + line.service.pricePerHour * line.hours, 0)

  // "Pay now": send the basket to POST /api/checkout. The server prices it from the database, saves a
  // pending order and answers with the address of Stripe's payment page, which we then go to.
  // We only send WHAT and HOW LONG; the prices shown here are just for display.
  async function checkout() {
    setIsPaying(true)
    setError('')
    try {
      const { url } = await apiFetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: basket.map((line) => ({ serviceId: line.id, hours: line.hours })) }),
      })
      window.location.href = url // leave our site for Stripe's hosted checkout page
    } catch (err) {
      setIsPaying(false)
      setError(err.message)
    }
  }

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
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/55" onClick={onClose} aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="basket-title"
        className="absolute right-0 top-0 flex h-dvh w-full max-w-md animate-slide-in flex-col bg-cream shadow-2xl motion-reduce:animate-none"
      >
        <div className="flex items-center justify-between border-b border-line p-5 sm:p-6">
          <h2 id="basket-title" className="font-display text-2xl">
            Your basket
          </h2>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Close basket"
            className="flex size-10 items-center justify-center rounded-full border border-line text-2xl leading-none transition hover:bg-clay"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {lines.length === 0 ? (
            <p className="py-6 text-ink-soft">
              Your basket is empty. Add a session from the services section.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map(({ id, hours, service }) => (
                <li key={id} className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-line pb-4">
                  <img src={service.image} alt="" className="size-18 rounded-lg object-cover" />

                  <div className="flex flex-col items-start gap-1.5">
                    <p className="font-display text-lg">{service.name}</p>
                    <p className="text-sm text-ink-soft">{formatPrice(service.pricePerHour)} per hour</p>

                    <div className="flex w-full items-center justify-between gap-3">
                      {/* The same controlled stepper as on the cards, now driven by the basket state */}
                      <HoursStepper
                        value={hours}
                        onChange={(newHours) => onChangeHours(id, newHours)}
                        label={service.name}
                      />
                      <p className="font-bold">{formatPrice(service.pricePerHour * hours)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(id)}
                      aria-label={`Remove ${service.name} from basket`}
                      className="text-sm text-ink-soft underline underline-offset-4 hover:text-ember"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line bg-tint p-5 sm:p-6">
            <div className="flex items-baseline justify-between">
              <span>Total</span>
              <strong className="font-display text-3xl font-medium">{formatPrice(total)}</strong>
            </div>
            <p className="text-sm text-ink-soft">
              Sessions are priced per hour. You pay securely on Stripe's page, then we contact you to
              arrange the date.
            </p>
            {error && (
              <p role="alert" className="text-sm text-ember">
                {error}
              </p>
            )}
            {user ? (
              <Button onClick={checkout} disabled={isPaying} className="w-full">
                {isPaying ? 'Opening secure checkout…' : `Pay now · ${formatPrice(total)}`}
              </Button>
            ) : (
              <Button onClick={onSignIn} className="w-full">
                Sign in to pay
              </Button>
            )}
            <button
              type="button"
              onClick={onClear}
              className="self-center text-sm text-ink-soft underline underline-offset-4 hover:text-ember"
            >
              Clear basket
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}