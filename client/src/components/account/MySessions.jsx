import Button from '../Button'
import Doodle from '../Doodle'
import Icon from '../Icon'
import { EmptyState, Loading, Stamp } from './bits'
import { CameraBuddy } from '../Illustrations'

// The account page's "My sessions" tab: every photo session this customer has.
// `request` is the GET /api/shoots request, loaded once by AccountPage.
// Each session is drawn as an event TICKET: the date on the left "stub", the details on the right,
// and a 3-step track underneath (Booked -> Date set -> Photos ready), so it is clear what happens next.
// `onShowGallery` switches to the "My gallery" tab.

const stamps = {
  unscheduled: { label: 'To schedule', tone: 'gold' },
  scheduled: { label: 'Booked!', tone: 'night' },
  delivered: { label: 'Delivered', tone: 'ember' },
}

const steps = ['Booked', 'Date set', 'Photos ready']
const stepsDone = { unscheduled: 1, scheduled: 2, delivered: 3 }

export default function MySessions({ request, onShowGallery }) {
  const { data: shoots, error } = request

  if (error) return <p className="text-ember">Sorry, your sessions could not be loaded ({error}).</p>
  if (!shoots) return <Loading>Finding your sessions&hellip;</Loading>

  if (shoots.length === 0) {
    return (
      <EmptyState
        illustration={<CameraBuddy className="w-44" />}
        title="Snappy is ready when you are"
        action={<Button href="/#services">Browse sessions</Button>}
      >
        Book and pay for a session and it lands here, like a ticket. Then we&rsquo;ll be in touch to pick the perfect date.
      </EmptyState>
    )
  }

  // Upcoming dated sessions first (soonest first), then everything else.
  const now = new Date()
  const isUpcoming = (shoot) => shoot.status === 'scheduled' && new Date(shoot.scheduledAt) > now
  const sorted = [...shoots].sort((a, b) => {
    if (isUpcoming(a) !== isUpcoming(b)) return isUpcoming(a) ? -1 : 1
    return isUpcoming(a) ? new Date(a.scheduledAt) - new Date(b.scheduledAt) : 0
  })

  // Wide screens: the tickets (two per row on very wide screens) with the guide alongside.
  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_22rem] xl:items-start 2xl:grid-cols-[1fr_26rem]">
      <ul className="grid gap-5 2xl:grid-cols-2">
        {sorted.map((shoot, index) => (
          <Ticket key={shoot.id} shoot={shoot} index={index} onShowGallery={onShowGallery} />
        ))}
      </ul>
      <Guide />
    </div>
  )
}

// "From click to keepsake": what happens after booking, as three illustrated steps.
const guideSteps = [
  { doodle: 'calendar', title: 'We pick a date', text: 'We email you to find a day and place that suit you. Golden hour, anyone?' },
  { doodle: 'camera', title: 'Shoot day!', text: 'Relax, laugh, be yourself. We do the directing, you do the smiling.' },
  { doodle: 'polaroid', title: 'Photos land here', text: 'Two to three weeks later, your edited gallery pops up in My gallery.' },
]

function Guide() {
  return (
    <aside className="relative overflow-hidden rounded-3xl bg-gold/40 p-6 xl:sticky xl:top-6 xl:p-8">
      <Doodle name="flower" className="absolute -right-4 -top-4 size-20 animate-wiggle text-ember/30 motion-reduce:animate-none" />
      <h3 className="mb-6 font-display text-3xl leading-tight">
        From click
        <br />
        to <em className="italic text-ember">keepsake</em>
      </h3>
      <ol className="flex flex-col gap-6">
        {guideSteps.map((step, index) => (
          <li key={step.title} className="group flex gap-4">
            <span className="relative flex size-16 shrink-0 items-center justify-center rounded-2xl bg-cream shadow-sm transition duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <Doodle name={step.doodle} className="size-10 text-ember" />
              <span className="absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full bg-ink font-display text-xs text-cream">
                {index + 1}
              </span>
            </span>
            <div>
              <p className="font-display text-xl">{step.title}</p>
              <p className="text-sm text-ink-soft">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      {/* the curly arrow doodle, pointing back at your tickets */}
      <p className="mt-8 flex items-center gap-3 text-sm text-ink-soft">
        <Doodle name="arrow" className="hidden h-8 w-16 -scale-x-100 text-ember xl:block" />
        Questions? Just reply to any email from us.
      </p>
    </aside>
  )
}

function Ticket({ shoot, index, onShowGallery }) {
  const date = shoot.scheduledAt && new Date(shoot.scheduledAt)
  const stamp = stamps[shoot.status] ?? stamps.unscheduled
  const done = stepsDone[shoot.status] ?? 1

  return (
    <li
      style={{ animationDelay: `${index * 90}ms` }}
      className="group animate-fade-up overflow-hidden rounded-3xl border border-line bg-cream shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:animate-none sm:flex"
    >
      {/* The stub: a big date, or a question mark until one is chosen */}
      <div className="relative flex shrink-0 items-center justify-center gap-4 bg-night px-6 py-5 text-cream sm:w-40 sm:flex-col sm:gap-0 sm:border-r-2 sm:border-dashed sm:border-cream/30">
        {date ? (
          <>
            <span className="text-xs uppercase tracking-[0.2em] text-gold">{date.toLocaleDateString('en-GB', { month: 'short' })}</span>
            <span className="font-display text-6xl font-medium leading-none">{date.getDate()}</span>
            <span className="text-sm text-cream/70">{date.toLocaleDateString('en-GB', { weekday: 'long' })}</span>
          </>
        ) : (
          <>
            <span className="font-display text-6xl italic leading-none text-gold transition group-hover:rotate-12">?</span>
            <span className="text-sm text-cream/70 sm:mt-2">Date coming soon</span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl sm:text-3xl">{shoot.serviceName}</h3>
          <Stamp tone={stamp.tone} className="shrink-0 transition group-hover:rotate-0">
            {stamp.label}
          </Stamp>
        </div>

        {date ? (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-ink-soft">
            <span className="flex items-center gap-2">
              <Icon name="clock" className="size-4.5 text-ember" />
              {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {shoot.location && (
              <span className="flex items-center gap-2">
                <Icon name="pin" className="size-4.5 text-ember" />
                {shoot.location}
              </span>
            )}
          </div>
        ) : (
          <p className="text-ink-soft">We&rsquo;ll email you within two working days to choose a date that suits you.</p>
        )}

        {shoot.notes && (
          // A little note "taped" to the ticket
          <p className="relative -rotate-1 whitespace-pre-line rounded-lg bg-gold/30 px-4 py-3 text-sm before:absolute before:-top-2 before:left-6 before:h-4 before:w-12 before:rotate-3 before:bg-cream/80">
            {shoot.notes}
          </p>
        )}

        {/* Progress track: a dot per step, filled up to where this session is */}
        <ol className="mt-auto grid grid-cols-3 gap-2 pt-2" aria-label="Progress">
          {steps.map((step, stepIndex) => {
            const isDone = stepIndex < done
            return (
              <li key={step} className="flex flex-col gap-1.5">
                <span className={`h-1.5 rounded-full transition-colors duration-700 ${isDone ? 'bg-ember' : 'bg-line'}`} />
                <span className={`flex items-center gap-1 text-xs ${isDone ? 'font-medium text-ink' : 'text-ink-soft'}`}>
                  {isDone && <Doodle name="sparkle" className="size-3 text-ember" />}
                  {step}
                  <span className="sr-only">{isDone ? '(done)' : '(not yet)'}</span>
                </span>
              </li>
            )
          })}
        </ol>

        {shoot.status === 'delivered' && (
          <Button size="sm" onClick={onShowGallery} className="self-start">
            See your {shoot.photos.length} photos &rarr;
          </Button>
        )}
      </div>
    </li>
  )
}
