import { Fragment, useEffect, useState } from 'react'
import { newPhoto, newService, photoFields, serviceFields } from '../data/adminFields'
import { apiFetch } from '../lib/api'
import ContentEditor from './admin/ContentEditor'
import EnquiryReply from './admin/EnquiryReply'
import RecordsEditor from './admin/RecordsEditor'
import ShootsEditor from './admin/ShootsEditor'
import Button from './Button'
import LensMark from './LensMark'
import { gutter } from './Section'

// The admin dashboard, shown at /admin (App decides which page to show).
// It loads everything from GET /api/admin/overview. The SERVER checks that the visitor is an
// admin; if not, it answers 401/403 and we show a message instead of the data.
// The first five tabs are about customers; the last three edit the public site
// (their components live in components/admin/).

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const statusStyles = {
  new: 'bg-ember text-cream',
  replied: 'bg-line text-ink-soft',
  requested: 'bg-gold text-ink',
  pending: 'bg-gold text-ink',
  paid: 'bg-night text-cream',
  expired: 'bg-line text-ink-soft',
  confirmed: 'bg-night text-cream',
  cancelled: 'bg-line text-ink-soft line-through',
}

function StatusPill({ status }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[status]}`}>
      {status}
    </span>
  )
}

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-5 transition sm:p-6 duration-300 hover:-translate-y-1 hover:shadow-xl">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-soft sm:text-sm">{label}</p>
      <p className="mt-3 font-display text-4xl font-medium text-ink sm:text-5xl">{value}</p>
      {note && <p className="mt-2 text-sm text-ember">{note}</p>}
    </div>
  )
}

// Shared table styling. The wrapper scrolls sideways on small screens instead of squashing columns.
function Table({ headings, children, empty }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-cream">
      <table className="w-full min-w-[48rem] text-left text-sm">
        <thead className="border-b border-line bg-tint text-xs uppercase tracking-[0.12em] text-ink-soft">
          <tr>
            {headings.map((heading) => (
              <th key={heading} scope="col" className="px-5 py-4 font-medium">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="px-5 py-10 text-center text-ink-soft">{empty}</p>}
    </div>
  )
}

// Exported so the account menu (AccountButton) can link admins straight to any tab: /admin?tab=orders
export const adminTabs = [
  { id: 'enquiries', label: 'Enquiries' },
  { id: 'orders', label: 'Orders' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'users', label: 'Users' },
  // A small gap before this one splits the tabs into "customers" and "edit the site"
  { id: 'content', label: 'Page content', className: 'sm:ml-4' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'services', label: 'Services' },
]

export default function AdminDashboard({ user, isSessionPending, onSignIn, onSignOut }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  // The open tab comes from the address (/admin?tab=sessions), so links and refreshes keep it.
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    return adminTabs.some((t) => t.id === tab) ? tab : 'enquiries'
  })

  function changeTab(tab) {
    setActiveTab(tab)
    window.history.replaceState(null, '', tab === 'enquiries' ? '/admin' : `/admin?tab=${tab}`)
  }

  // EFFECT: load the dashboard data whenever the signed-in user changes.
  useEffect(() => {
    if (!user) return
    let ignore = false
    setError('')
    apiFetch('/api/admin/overview')
      .then((result) => !ignore && setData(result))
      .catch((err) => !ignore && setError(err.message))
    return () => {
      ignore = true
    }
  }, [user])

  // Save a new status on the server, then update that one row on screen.
  async function updateStatus(kind, id, status) {
    try {
      await apiFetch(`/api/admin/${kind}/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setData((current) => {
        const rows = current[kind].map((row) => (row.id === id ? { ...row, status } : row))
        const newEnquiries = kind === 'enquiries' ? rows.filter((row) => row.status === 'new').length : current.stats.newEnquiries
        return { ...current, [kind]: rows, stats: { ...current.stats, newEnquiries } }
      })
    } catch (err) {
      setError(err.message)
    }
  }

  // A reply was emailed: add it under its enquiry, which the server has now marked 'replied'.
  function addReply(reply) {
    setData((current) => {
      const rows = current.enquiries.map((row) =>
        row.id === reply.enquiryId ? { ...row, status: 'replied', replies: [...row.replies, reply] } : row,
      )
      const newEnquiries = rows.filter((row) => row.status === 'new').length
      return { ...current, enquiries: rows, stats: { ...current.stats, newEnquiries } }
    })
  }

  // ---- The page frame: a slim top bar, then whichever state we are in ----
  return (
    <div className="min-h-svh bg-tint text-ink">
      <header className={`flex items-center justify-between gap-4 border-b border-line bg-cream py-4 ${gutter}`}>
        <a href="/" className="group flex items-center gap-2.5 whitespace-nowrap font-display text-xl font-semibold sm:text-2xl">
          <LensMark className="size-7 text-ember" />
          <span>
            Lens <span className="text-ember">Theory</span>
          </span>
          <span className="ml-2 hidden rounded-full bg-ink px-3 py-1 font-body text-xs sm:inline font-medium uppercase tracking-[0.15em] text-cream">
            Admin
          </span>
        </a>

        <div className="flex items-center gap-2 text-sm sm:gap-3">
          <a href="/" className="whitespace-nowrap font-medium text-ink-soft transition hover:text-ember">
            &larr; <span className="hidden sm:inline">Back to </span>site
          </a>
          {user && (
            <Button variant="ghost" size="sm" onClick={onSignOut} className="whitespace-nowrap">
              Sign out
            </Button>
          )}
        </div>
      </header>

      <main className={`py-12 md:py-16 ${gutter}`}>
        {isSessionPending ? (
          <p className="text-ink-soft">Loading&hellip;</p>
        ) : !user ? (
          <Notice title="Please sign in" text="The dashboard is only for the studio team.">
            <Button onClick={onSignIn}>Sign in</Button>
          </Notice>
        ) : error && !data ? (
          <Notice
            title={error === 'Admins only' ? 'Admins only' : 'Something went wrong'}
            text={
              error === 'Admins only'
                ? `You are signed in as ${user.email}, which is not an admin account.`
                : error
            }
          >
            <Button href="/" variant="ghost">
              Back to the site
            </Button>
          </Notice>
        ) : !data ? (
          <p className="text-ink-soft">Loading the dashboard&hellip;</p>
        ) : (
          <Dashboard
            data={data}
            user={user}
            error={error}
            activeTab={activeTab}
            onTabChange={changeTab}
            onStatusChange={updateStatus}
            onReply={addReply}
          />
        )}
      </main>
    </div>
  )
}

function Notice({ title, text, children }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-line bg-cream p-10 text-center">
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="text-ink-soft">{text}</p>
      {children}
    </div>
  )
}

function Dashboard({ data, user, error, activeTab, onTabChange, onStatusChange, onReply }) {
  const { stats, enquiries, orders, bookings, users } = data
  const firstName = user.name.trim().split(/\s+/)[0]
  // Which enquiry has its reply panel open (an id), or null.
  const [replyingTo, setReplyingTo] = useState(null)

  return (
    <>
      <div className="mb-10 flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-ember">Welcome back, {firstName}</p>
        <h1 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
          Studio <em className="italic text-ember">dashboard</em>
        </h1>
      </div>

      {error && (
        <p role="alert" className="mb-6 rounded-lg bg-ember/10 px-4 py-3 text-sm text-ember">
          {error}
        </p>
      )}

      <div className="mb-12 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="New enquiries" value={stats.newEnquiries} note={stats.newEnquiries > 0 ? 'Waiting for a reply' : 'All caught up'} />
        <StatCard label="Paid online" value={`£${stats.paidRevenue}`} note={`${orders.filter((o) => o.status === 'paid').length} paid orders`} />
        <StatCard label="Booking requests" value={stats.bookings} note={`£${stats.requestedValue} requested`} />
        <StatCard label="Users" value={stats.users} />
      </div>

      {/* Tabs: one list at a time */}
      <div role="tablist" aria-label="Dashboard lists" className="mb-6 flex flex-wrap gap-2">
        {adminTabs.map((tab) => {
          const isActive = tab.id === activeTab
          const badge = tab.id === 'enquiries' ? stats.newEnquiries : null
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${
                isActive ? 'border-ink bg-ink text-cream shadow-md' : 'border-ink/25 bg-cream text-ink hover:border-ink'
              } ${tab.className ?? ''}`}
            >
              {tab.label}
              {badge > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-ember text-[0.7rem] text-cream">{badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'enquiries' && (
        <Table
          headings={['Received', 'From', 'Shoot', 'Preferred', 'Message', 'Status']}
          empty={enquiries.length === 0 && 'No enquiries yet.'}
        >
          {enquiries.map((enquiry) => (
            // Fragment: each enquiry is its row, plus a second full-width row when its reply panel is open.
            <Fragment key={enquiry.id}>
              <tr className={`align-top transition hover:bg-tint/60 ${enquiry.status === 'new' ? '' : 'text-ink-soft'}`}>
                <td className="whitespace-nowrap px-5 py-4">{formatDate(enquiry.createdAt)}</td>
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{enquiry.name}</p>
                  <a href={`mailto:${enquiry.email}`} className="text-ember underline-offset-4 hover:underline">
                    {enquiry.email}
                  </a>
                </td>
                <td className="whitespace-nowrap px-5 py-4">{enquiry.shootType}</td>
                <td className="whitespace-nowrap px-5 py-4">
                  {enquiry.preferredDate ? formatDate(enquiry.preferredDate) : 'No date'}
                  <span className="block text-xs text-ink-soft">{enquiry.timeOfDay}</span>
                </td>
                <td className="max-w-md px-5 py-4">
                  <p className="line-clamp-3 whitespace-pre-line" title={enquiry.message}>
                    {enquiry.message}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col items-start gap-2">
                    <StatusPill status={enquiry.status} />
                    {enquiry.replies.length > 0 && (
                      <span className="text-xs text-ink-soft">
                        {enquiry.replies.length} {enquiry.replies.length === 1 ? 'reply' : 'replies'} sent
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant={replyingTo === enquiry.id ? 'ghost' : 'primary'}
                      aria-expanded={replyingTo === enquiry.id}
                      onClick={() => setReplyingTo(replyingTo === enquiry.id ? null : enquiry.id)}
                    >
                      {replyingTo === enquiry.id ? 'Close' : 'Reply'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => onStatusChange('enquiries', enquiry.id, enquiry.status === 'new' ? 'replied' : 'new')}
                      className="whitespace-nowrap text-xs font-medium text-ink underline underline-offset-4 transition hover:text-ember"
                    >
                      {enquiry.status === 'new' ? 'Mark as replied' : 'Mark as new'}
                    </button>
                  </div>
                </td>
              </tr>
              {replyingTo === enquiry.id && (
                <tr className="bg-cream text-ink">
                  <td colSpan={6} className="px-5 py-6">
                    <EnquiryReply enquiry={enquiry} admin={user} onSent={onReply} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </Table>
      )}

      {/* Orders are paid through Stripe. Their status is set by the Stripe webhook, never by hand. */}
      {activeTab === 'orders' && (
        <Table headings={['Placed', 'Customer', 'Sessions', 'Total', 'Status']} empty={orders.length === 0 && 'No orders yet.'}>
          {orders.map((order) => (
            <tr key={order.id} className="align-top transition hover:bg-tint/60">
              <td className="whitespace-nowrap px-5 py-4">
                {formatDate(order.createdAt)}
                <span className="block text-xs text-ink-soft">Order #{order.id}</span>
              </td>
              <td className="px-5 py-4">
                <p className="font-medium">{order.userName}</p>
                <a href={`mailto:${order.userEmail}`} className="text-ember underline-offset-4 hover:underline">
                  {order.userEmail}
                </a>
              </td>
              <td className="px-5 py-4">
                {order.items.map((item) => (
                  <p key={item.id}>
                    {item.serviceName} &middot; {item.hours} h &times; £{item.pricePerHour}
                  </p>
                ))}
              </td>
              <td className="px-5 py-4 font-display text-lg">£{order.total}</td>
              <td className="px-5 py-4">
                <StatusPill status={order.status} />
                {order.paidAt && <span className="mt-2 block text-xs text-ink-soft">Paid {formatDate(order.paidAt)}</span>}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {activeTab === 'bookings' && (
        <Table
          headings={['Requested', 'Customer', 'Session', 'Hours', 'Total', 'Status']}
          empty={bookings.length === 0 && 'No booking requests yet.'}
        >
          {bookings.map((booking) => (
            <tr key={booking.id} className="transition hover:bg-tint/60">
              <td className="whitespace-nowrap px-5 py-4">{formatDate(booking.createdAt)}</td>
              <td className="px-5 py-4">
                <p className="font-medium">{booking.userName}</p>
                <a href={`mailto:${booking.userEmail}`} className="text-ember underline-offset-4 hover:underline">
                  {booking.userEmail}
                </a>
              </td>
              <td className="px-5 py-4">{booking.serviceName}</td>
              <td className="px-5 py-4">{booking.hours}</td>
              <td className="px-5 py-4 font-display text-lg">£{booking.hours * booking.pricePerHour}</td>
              <td className="px-5 py-4">
                <div className="flex flex-col items-start gap-2">
                  <StatusPill status={booking.status} />
                  <label className="sr-only" htmlFor={`booking-status-${booking.id}`}>
                    Change status for booking {booking.id}
                  </label>
                  <select
                    id={`booking-status-${booking.id}`}
                    value={booking.status}
                    onChange={(event) => onStatusChange('bookings', booking.id, event.target.value)}
                    className="rounded-lg border border-line bg-tint px-2 py-1 text-xs focus:border-ember focus:outline-none"
                  >
                    <option value="requested">Requested</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {activeTab === 'users' && (
        <Table headings={['Joined', 'Name', 'Email', 'Bookings', 'Role']} empty={users.length === 0 && 'No users yet.'}>
          {users.map((row) => (
            <tr key={row.id} className="transition hover:bg-tint/60">
              <td className="whitespace-nowrap px-5 py-4">{formatDate(row.createdAt)}</td>
              <td className="px-5 py-4 font-medium">{row.name}</td>
              <td className="px-5 py-4">{row.email}</td>
              <td className="px-5 py-4">{row.bookingCount}</td>
              <td className="px-5 py-4">
                {row.isAdmin ? (
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-cream">Admin</span>
                ) : (
                  <span className="text-ink-soft">Customer</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {activeTab === 'sessions' && <ShootsEditor users={users} />}

      {activeTab === 'content' && <ContentEditor />}

      {activeTab === 'gallery' && (
        <RecordsEditor
          endpoint="/api/photos"
          fields={photoFields}
          newRecord={newPhoto}
          itemLabel="photo"
          getTitle={(photo) => `${photo.category}: ${photo.alt}`}
          getImage={(photo) => photo.src}
          intro="The photos in the gallery, in the order they appear. Use the arrows to reorder."
        />
      )}

      {activeTab === 'services' && (
        <RecordsEditor
          endpoint="/api/services"
          fields={serviceFields}
          newRecord={newService}
          itemLabel="service"
          getTitle={(service) => (service.bookable ? `${service.name} · £${service.pricePerHour}/hour` : `${service.name} · enquire only`)}
          getImage={(service) => service.image}
          intro="The session cards customers book from. A service that has bookings cannot be deleted."
        />
      )}
    </>
  )
}
