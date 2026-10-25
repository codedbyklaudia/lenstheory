import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import Button from './Button'
import LensMark from './LensMark'
import { gutter } from './Section'

const CHECK_EVERY_MS = 2000
const MAX_CHECKS = 10 // about 20 seconds in total

const formatDate = (value) =>
  new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// The page Stripe sends the customer back to after paying: /order/success?order=12
// (App shows it instead of the normal page; the address is set in server/src/routes/checkout.js.)
//
// Landing here does NOT mean the order is paid: anyone could type this address. So we ask the
// server, GET /api/orders/12, and show whatever status the DATABASE has. Only Stripe's webhook sets
// it to 'paid', and the webhook can arrive a moment after the customer does, so while the order is
// still 'pending' we ask again every 2 seconds, up to 10 times.
// `onPaid` lets App empty the basket once the payment is confirmed.
export default function OrderSuccess({ user, isSessionPending, onSignIn, onPaid }) {
  const orderId = new URLSearchParams(window.location.search).get('order')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [checks, setChecks] = useState(0) // how many times we have asked so far

  // EFFECT: ask the server for the order. It runs again each time `checks` goes up, so each run
  // schedules the next one (until the order is no longer pending, or we have asked enough).
  useEffect(() => {
    if (!user || !orderId) return
    let ignore = false
    let timer

    apiFetch(`/api/orders/${orderId}`)
      .then((result) => {
        if (ignore) return
        setOrder(result)
        if (result.status === 'pending' && checks < MAX_CHECKS) {
          timer = setTimeout(() => setChecks((n) => n + 1), CHECK_EVERY_MS)
        }
      })
      .catch((err) => !ignore && setError(err.message))

    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [user?.id, orderId, checks])

  // EFFECT: once the order is paid, empty the basket (it was kept while the customer was on Stripe).
  const isPaid = order?.status === 'paid'
  useEffect(() => {
    if (isPaid) onPaid()
  }, [isPaid])

  return (
    <div className="min-h-svh bg-tint text-ink">
      <header className={`border-b border-line bg-cream py-4 ${gutter}`}>
        <a href="/" className="flex w-fit items-center gap-2.5 font-display text-xl font-semibold sm:text-2xl">
          <LensMark className="size-7 text-ember" />
          <span>
            Lens <span className="text-ember">Theory</span>
          </span>
        </a>
      </header>

      <main className={`flex justify-center py-16 md:py-24 ${gutter}`}>
        <div className="w-full max-w-lg rounded-2xl border border-line bg-cream p-8 sm:p-10">
          {isSessionPending ? (
            <p className="text-ink-soft">Loading&hellip;</p>
          ) : !user ? (
            <Message title="Please sign in" text="Sign in with the account you paid with to see your order.">
              <Button onClick={onSignIn}>Sign in</Button>
            </Message>
          ) : error || !orderId ? (
            <Message title="We could not find that order" text={error || 'The link is missing the order number.'}>
              <Button href="/" variant="ghost">
                Back to the site
              </Button>
            </Message>
          ) : !order ? (
            <p className="text-ink-soft">Looking up your order&hellip;</p>
          ) : (
            <Receipt order={order} isStillChecking={order.status === 'pending' && checks < MAX_CHECKS} />
          )}
        </div>
      </main>
    </div>
  )
}

function Message({ title, text, children }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="text-ink-soft">{text}</p>
      {children}
    </div>
  )
}

const headlines = {
  paid: { icon: '✓', title: 'Payment received', text: 'Thank you! Your session is booked. We will email you shortly to arrange the date.' },
  pending: { icon: '…', title: 'Confirming your payment', text: 'Stripe is letting us know your payment went through. This usually takes a few seconds.' },
  expired: { icon: '!', title: 'This checkout expired', text: 'No payment was taken. You can add the session to your basket again any time.' },
}

function Receipt({ order, isStillChecking }) {
  const headline = headlines[order.status] ?? headlines.pending

  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4">
        <span
          aria-hidden="true"
          className={`flex size-16 items-center justify-center rounded-full text-3xl text-cream ${
            order.status === 'paid' ? 'animate-pop bg-ember motion-reduce:animate-none' : 'bg-ink-soft'
          }`}
        >
          {headline.icon}
        </span>
        <h1 className="font-display text-4xl">{headline.title}</h1>
        <p className="text-ink-soft">{headline.text}</p>
        {order.status === 'pending' && !isStillChecking && (
          <p className="text-sm text-ember">
            This is taking longer than usual. Refresh the page in a minute, or contact us if it stays like this.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-line">
        <div className="flex items-center justify-between border-b border-line px-5 py-3 text-sm">
          <span className="font-medium">Order #{order.id}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${order.status === 'paid' ? 'bg-night text-cream' : 'bg-line text-ink-soft'}`}>
            {order.status}
          </span>
        </div>
        <ul className="divide-y divide-line px-5">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3">
              <span>
                {item.serviceName}
                <span className="block text-sm text-ink-soft">
                  {item.hours} {item.hours === 1 ? 'hour' : 'hours'} &times; £{item.pricePerHour}
                </span>
              </span>
              <span className="font-medium">£{item.hours * item.pricePerHour}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-line px-5 py-4">
          <span>{order.status === 'paid' ? 'Paid' : 'Total'}</span>
          <strong className="font-display text-2xl font-medium">£{order.total}</strong>
        </div>
      </div>

      {order.paidAt && <p className="text-sm text-ink-soft">Paid on {formatDate(order.paidAt)}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <Button href="/">Back to the site</Button>
        <a href="/account" className="text-sm font-medium text-ember underline-offset-4 hover:underline">
          See all my orders
        </a>
      </div>
    </div>
  )
}
