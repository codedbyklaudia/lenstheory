import { useApi } from '../../lib/api'
import Button from '../Button'

// The account page's "My sessions" tab: every photo session this customer has, from GET /api/shoots.
// A session is created when an order is paid; the studio then picks a date and place with the
// customer, and finally delivers the photos. `onShowGallery` switches to the "My gallery" tab.

const statuses = {
  unscheduled: { label: 'To be scheduled', classes: 'bg-gold text-ink' },
  scheduled: { label: 'Booked', classes: 'bg-night text-cream' },
  delivered: { label: 'Photos delivered', classes: 'bg-ember text-cream' },
}

const formatWhen = (value) =>
  new Date(value).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function MySessions({ onShowGallery }) {
  const { data: shoots, error } = useApi('/api/shoots')

  if (error) return <p className="text-ember">Sorry, your sessions could not be loaded ({error}).</p>
  if (!shoots) return <p className="text-ink-soft">Loading your sessions&hellip;</p>

  if (shoots.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-cream p-8">
        <p className="font-display text-2xl">No sessions yet</p>
        <p className="text-ink-soft">Once you have paid for a session, it appears here and we will be in touch to pick a date.</p>
        <Button href="/#services">Browse sessions</Button>
      </div>
    )
  }

  // DERIVED DATA: sessions with a date coming up go first, soonest first; the rest keep their order.
  const now = Date.now()
  const isUpcoming = (shoot) => shoot.status === 'scheduled' && new Date(shoot.scheduledAt).getTime() > now
  const sorted = [...shoots].sort((a, b) => {
    if (isUpcoming(a) !== isUpcoming(b)) return isUpcoming(a) ? -1 : 1
    return isUpcoming(a) ? new Date(a.scheduledAt) - new Date(b.scheduledAt) : 0
  })

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {sorted.map((shoot) => {
        const status = statuses[shoot.status] ?? statuses.unscheduled
        return (
          <li key={shoot.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-2xl">{shoot.serviceName}</h3>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.classes}`}>{status.label}</span>
            </div>

            {shoot.scheduledAt ? (
              <dl className="grid gap-1 text-sm">
                <dt className="text-xs uppercase tracking-[0.12em] text-ink-soft">When</dt>
                <dd className="mb-2 font-display text-lg">{formatWhen(shoot.scheduledAt)}</dd>
                {shoot.location && (
                  <>
                    <dt className="text-xs uppercase tracking-[0.12em] text-ink-soft">Where</dt>
                    <dd className="font-display text-lg">{shoot.location}</dd>
                  </>
                )}
              </dl>
            ) : (
              <p className="text-ink-soft">We will email you within two working days to choose a date that suits you.</p>
            )}

            {shoot.notes && <p className="whitespace-pre-line rounded-xl bg-tint p-4 text-sm">{shoot.notes}</p>}

            {shoot.status === 'delivered' && (
              <Button size="sm" onClick={onShowGallery} className="mt-auto self-start">
                See your {shoot.photos.length} photos &rarr;
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
