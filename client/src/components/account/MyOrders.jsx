import Button from '../Button'
import { EmptyState, Loading, Stamp } from './bits'
import { ShoppingBag } from '../Illustrations'

// The account page's "My orders" tab: every order this customer placed, newest first.
// `request` is the GET /api/orders request (loaded once by AccountPage); the server only returns
// this user's orders. Each order looks like a paper RECEIPT, with a stamp showing its status.

const stamps = {
  paid: { label: 'Paid', tone: 'ember' },
  pending: { label: 'Not paid', tone: 'muted' },
  expired: { label: 'Expired', tone: 'muted' },
}

const formatDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

// The receipt's torn-off bottom edge: a row of little half-circles cut out of the paper colour.
const tornEdge = {
  backgroundImage: 'radial-gradient(circle at 8px 100%, transparent 7px, var(--color-cream) 7.5px)',
  backgroundSize: '16px 12px',
}

export default function MyOrders({ request }) {
  const { data: orders, error } = request

  if (error) return <p className="text-ember">Sorry, your orders could not be loaded ({error}).</p>
  if (!orders) return <Loading>Printing your receipts&hellip;</Loading>

  if (orders.length === 0) {
    return (
      <EmptyState illustration={<ShoppingBag className="w-32" />} title="Nothing in the bag yet" action={<Button href="/#services">Browse sessions</Button>}>
        When you book and pay for a session, your receipt is kept safe here.
      </EmptyState>
    )
  }

  return (
    <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {orders.map((order, index) => {
        const stamp = stamps[order.status] ?? stamps.pending
        return (
          <li
            key={order.id}
            style={{ animationDelay: `${index * 90}ms` }}
            className={`group animate-fade-up drop-shadow-md transition duration-300 hover:-translate-y-1 hover:drop-shadow-xl motion-reduce:animate-none ${
              index % 2 ? 'md:rotate-1' : 'md:-rotate-1'
            } md:hover:rotate-0`}
          >
            <div className="relative rounded-t-2xl bg-cream px-6 pb-4 pt-6 font-body">
              <Stamp tone={stamp.tone} className="absolute right-5 top-5 text-base transition duration-300 group-hover:-rotate-12 group-hover:scale-110">
                {stamp.label}
              </Stamp>

              <p className="font-display text-sm uppercase tracking-[0.25em] text-ink-soft">Lens Theory</p>
              <p className="mt-1 font-display text-2xl">Order #{order.id}</p>
              <p className="text-sm text-ink-soft">
                {order.paidAt ? `Paid on ${formatDate(order.paidAt)}` : `Started on ${formatDate(order.createdAt)}`}
              </p>

              {/* A dotted line between the items and the total, like a till receipt */}
              <ul className="mt-5 flex flex-col gap-3 border-y-2 border-dotted border-ink/20 py-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span>
                      {item.serviceName}
                      <span className="block text-sm text-ink-soft">
                        {item.hours} {item.hours === 1 ? 'hour' : 'hours'} &times; £{item.pricePerHour}
                      </span>
                    </span>
                    <span className="font-medium tabular-nums">£{item.hours * item.pricePerHour}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-baseline justify-between pt-4">
                <span className="text-sm uppercase tracking-[0.15em] text-ink-soft">Total</span>
                <span className="font-display text-3xl tabular-nums">£{order.total}</span>
              </div>

              <p className="mt-3 text-sm">
                {order.status === 'paid' ? (
                  <a href={`/order/success?order=${order.id}`} className="font-medium text-ember underline-offset-4 hover:underline">
                    View full receipt &rarr;
                  </a>
                ) : (
                  <span className="text-ink-soft">No payment was taken for this order.</span>
                )}
              </p>
            </div>
            <div aria-hidden="true" className="h-3" style={tornEdge} />
          </li>
        )
      })}
    </ul>
  )
}
