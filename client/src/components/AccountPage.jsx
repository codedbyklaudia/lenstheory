import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { authClient } from '../lib/authClient'
import MyGallery from './account/MyGallery'
import MySessions from './account/MySessions'
import Button from './Button'
import LensMark from './LensMark'
import { gutter } from './Section'

// The customer's own dashboard, shown at /account (App decides which page to show).
// Any signed-in user can open it, and it only ever shows THEIR data:
//   My orders    -> GET /api/orders (the server only returns orders with this user's id)
//   My sessions  -> GET /api/shoots (account/MySessions.jsx)
//   My gallery   -> GET /api/shoots, the delivered photos (account/MyGallery.jsx)
//   My details   -> Better Auth's own endpoints: authClient.updateUser() and authClient.changePassword()
// The open tab is kept in the address (/account?tab=details), so the account menu can link
// straight to any tab and a page refresh stays on the same one.

// Exported so the account menu (AccountButton) lists exactly the same tabs.
// `icon` is the name of an icon in AccountButton.
export const accountTabs = [
  { id: 'orders', label: 'My orders', icon: 'bag' },
  { id: 'sessions', label: 'My sessions', icon: 'calendar' },
  { id: 'gallery', label: 'My gallery', icon: 'image' },
  { id: 'details', label: 'My details', icon: 'user' },
]

const inputClasses =
  'h-12 w-full rounded-lg border border-line bg-tint px-4 text-ink focus:border-ember focus:bg-cream focus:outline-none focus:ring-2 focus:ring-ember/20'
const labelClasses = 'mb-1.5 block text-sm font-medium text-ink'

const formatDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

function tabFromAddress() {
  const tab = new URLSearchParams(window.location.search).get('tab')
  return accountTabs.some((t) => t.id === tab) ? tab : 'orders'
}

export default function AccountPage({ user, isSessionPending, isAdmin, onSignIn, onSignOut }) {
  const [activeTab, setActiveTab] = useState(tabFromAddress)

  function changeTab(tab) {
    setActiveTab(tab)
    // Update the address without reloading the page.
    window.history.replaceState(null, '', tab === 'orders' ? '/account' : `/account?tab=${tab}`)
  }

  return (
    <div className="min-h-svh bg-tint text-ink">
      <header className={`flex items-center justify-between gap-4 border-b border-line bg-cream py-4 ${gutter}`}>
        <a href="/" className="flex items-center gap-2.5 whitespace-nowrap font-display text-xl font-semibold sm:text-2xl">
          <LensMark className="size-7 text-ember" />
          <span>
            Lens <span className="text-ember">Theory</span>
          </span>
        </a>
        <div className="flex items-center gap-2 text-sm sm:gap-3">
          {isAdmin && (
            <a href="/admin" className="hidden whitespace-nowrap font-medium text-ink-soft transition hover:text-ember sm:inline">
              Admin dashboard
            </a>
          )}
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

      <main className={`mx-auto max-w-4xl py-12 md:py-16 ${gutter}`}>
        {isSessionPending ? (
          <p className="text-ink-soft">Loading&hellip;</p>
        ) : !user ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-line bg-cream p-10 text-center">
            <h1 className="font-display text-3xl">Please sign in</h1>
            <p className="text-ink-soft">Sign in to see your orders and details.</p>
            <Button onClick={onSignIn}>Sign in</Button>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-ember">Hello, {user.name.trim().split(/\s+/)[0]}</p>
              <h1 className="mt-2 font-display text-5xl font-medium tracking-tight sm:text-6xl">
                Your <em className="italic text-ember">account</em>
              </h1>
            </div>

            <div role="tablist" aria-label="Account" className="mb-6 flex flex-wrap gap-2">
              {accountTabs.map((tab) => {
                const isActive = tab.id === activeTab
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => changeTab(tab.id)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${
                      isActive ? 'border-ink bg-ink text-cream shadow-md' : 'border-ink/25 bg-cream text-ink hover:border-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {activeTab === 'orders' && <MyOrders />}
            {activeTab === 'sessions' && <MySessions onShowGallery={() => changeTab('gallery')} />}
            {activeTab === 'gallery' && <MyGallery />}
            {activeTab === 'details' && <MyDetails user={user} />}
          </>
        )}
      </main>
    </div>
  )
}

// ---- My orders ----------------------------------------------------------------

const statusLabels = {
  paid: { label: 'Paid', classes: 'bg-night text-cream' },
  pending: { label: 'Not paid', classes: 'bg-gold text-ink' },
  expired: { label: 'Expired', classes: 'bg-line text-ink-soft' },
}

function MyOrders() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  // EFFECT: load this user's orders when the tab opens.
  useEffect(() => {
    apiFetch('/api/orders')
      .then(setOrders)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="text-ember">Sorry, your orders could not be loaded ({error}).</p>
  if (!orders) return <p className="text-ink-soft">Loading your orders&hellip;</p>

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-cream p-8">
        <p className="font-display text-2xl">No orders yet</p>
        <p className="text-ink-soft">When you book and pay for a session, it will appear here.</p>
        <Button href="/#services">Browse sessions</Button>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => {
        const status = statusLabels[order.status] ?? statusLabels.pending
        return (
          <li key={order.id} className="rounded-2xl border border-line bg-cream">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <p className="font-medium">Order #{order.id}</p>
                <p className="text-sm text-ink-soft">
                  {order.paidAt ? `Paid on ${formatDate(order.paidAt)}` : `Started on ${formatDate(order.createdAt)}`}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.classes}`}>{status.label}</span>
            </div>

            <ul className="divide-y divide-line px-5 sm:px-6">
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

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-6">
              <span className="font-display text-2xl">£{order.total}</span>
              {order.status === 'paid' ? (
                <a href={`/order/success?order=${order.id}`} className="text-sm font-medium text-ember underline-offset-4 hover:underline">
                  View receipt &rarr;
                </a>
              ) : (
                <p className="text-sm text-ink-soft">No payment was taken for this order.</p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// ---- My details ---------------------------------------------------------------
// Two separate small forms, so changing your name never needs your password.

function MyDetails({ user }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <NameForm user={user} />
      <PasswordForm />
      <p className="text-sm text-ink-soft md:col-span-2">Member since {formatDate(user.createdAt)}.</p>
    </div>
  )
}

function NameForm({ user }) {
  const [name, setName] = useState(user.name)
  const [message, setMessage] = useState({ text: '', isError: false })
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) return setMessage({ text: 'Please enter your name', isError: true })

    setIsSaving(true)
    // Better Auth updates the `user` row, and useSession() everywhere shows the new name straight away.
    const { error } = await authClient.updateUser({ name: name.trim() })
    setIsSaving(false)
    setMessage(error ? { text: error.message ?? 'Could not save', isError: true } : { text: 'Saved', isError: false })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-6">
      <h2 className="font-display text-2xl">Your details</h2>
      <div>
        <label htmlFor="account-name" className={labelClasses}>
          Name
        </label>
        <input
          id="account-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setMessage({ text: '', isError: false })
          }}
          className={inputClasses}
        />
      </div>
      <div>
        <p className={labelClasses}>Email</p>
        <p className="flex h-12 items-center rounded-lg bg-tint px-4 text-ink-soft">{user.email}</p>
        <p className="mt-1.5 text-xs text-ink-soft">Your email is how you sign in. Contact us if it needs changing.</p>
      </div>
      <FormFooter isBusy={isSaving} label="Save name" busyLabel="Saving…" message={message} disabled={name.trim() === user.name} />
    </form>
  )
}

const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' }

function PasswordForm() {
  const [form, setForm] = useState(emptyPasswords)
  const [message, setMessage] = useState({ text: '', isError: false })
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
    setMessage({ text: '', isError: false })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      return setMessage({ text: 'The two new passwords do not match', isError: true })
    }

    setIsSaving(true)
    // Better Auth checks the current password, saves the new one HASHED, and (revokeOtherSessions)
    // signs out every other browser, in case someone else knew the old password.
    const { error } = await authClient.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      revokeOtherSessions: true,
    })
    setIsSaving(false)

    if (error) {
      setMessage({ text: error.message ?? 'Could not change your password', isError: true })
    } else {
      setForm(emptyPasswords)
      setMessage({ text: 'Password changed. Other devices have been signed out.', isError: false })
    }
  }

  const fields = [
    { name: 'currentPassword', label: 'Current password', autoComplete: 'current-password' },
    { name: 'newPassword', label: 'New password (at least 8 characters)', autoComplete: 'new-password' },
    { name: 'confirmPassword', label: 'New password again', autoComplete: 'new-password' },
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-6">
      <h2 className="font-display text-2xl">Change password</h2>
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={`account-${field.name}`} className={labelClasses}>
            {field.label}
          </label>
          <input
            id={`account-${field.name}`}
            name={field.name}
            type="password"
            required
            minLength={field.name === 'currentPassword' ? undefined : 8}
            autoComplete={field.autoComplete}
            value={form[field.name]}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      ))}
      <FormFooter isBusy={isSaving} label="Change password" busyLabel="Changing…" message={message} />
    </form>
  )
}

function FormFooter({ isBusy, label, busyLabel, message, disabled = false }) {
  return (
    <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
      <Button type="submit" disabled={isBusy || disabled}>
        {isBusy ? busyLabel : label}
      </Button>
      <p role="status" className={`text-sm ${message.isError ? 'text-ember' : 'text-ink-soft'}`}>
        {message.text}
      </p>
    </div>
  )
}
