import { useState } from 'react'
import { authClient } from '../../lib/authClient'
import Button from '../Button'
import Doodle from '../Doodle'
import Icon from '../Icon'
import LensMark from '../LensMark'

// The account page's "My details" tab: a fun "press pass" with who you are, two small forms, and
// "You in numbers" (worked out from the `shoots` and `orders` AccountPage already loaded).
// Both forms use Better Auth's own endpoints, so the server needed no new routes:
//   authClient.updateUser({ name })                                 -> changes the `user` row
//   authClient.changePassword({ currentPassword, newPassword, ... }) -> checks the old one, hashes the new one
// They are separate, so changing your name never needs your password.

const inputClasses =
  'h-12 w-full rounded-xl border-2 border-line bg-tint px-4 text-ink transition focus:border-ember focus:bg-cream focus:outline-none'
const labelClasses = 'mb-1.5 block text-sm font-medium text-ink'

const formatMonth = (value) => new Date(value).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

// "Klaudia Smith" -> "KS"
const initialsOf = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

export default function MyDetails({ user, shoots, orders }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr] lg:items-start">
      <PressPass user={user} />
      <div className="grid gap-6 md:grid-cols-2 md:items-start 2xl:grid-cols-3">
        <NameForm user={user} />
        <PasswordForm />
        <Numbers shoots={shoots ?? []} orders={orders ?? []} />
      </div>
    </div>
  )
}

// A few fun totals. DERIVED DATA: nothing new is stored, it is all counted from the lists.
function Numbers({ shoots, orders }) {
  const paid = orders.filter((order) => order.status === 'paid')
  const hours = paid.flatMap((order) => order.items).reduce((sum, item) => sum + item.hours, 0)
  const photos = shoots.reduce((sum, shoot) => sum + shoot.photos.length, 0)
  const delivered = shoots.filter((shoot) => shoot.status === 'delivered').length

  const facts = [
    { doodle: 'camera', value: hours, label: hours === 1 ? 'hour in front of the camera' : 'hours in front of the camera' },
    { doodle: 'polaroid', value: photos, label: photos === 1 ? 'photo delivered' : 'photos delivered' },
    { doodle: 'star', value: delivered, label: delivered === 1 ? 'session wrapped' : 'sessions wrapped' },
  ]

  return (
    <div className="relative overflow-hidden rounded-3xl bg-night p-6 text-cream md:col-span-2 2xl:col-span-1">
      <Doodle name="film" className="absolute -bottom-6 -right-6 size-28 -rotate-12 text-cream/10" />
      <h3 className="mb-5 font-display text-2xl">
        You, in <em className="italic text-gold">numbers</em>
      </h3>
      <ul className="grid gap-4 sm:grid-cols-3 2xl:grid-cols-1">
        {facts.map((fact) => (
          <li key={fact.label} className="group flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-cream/10 transition duration-300 group-hover:rotate-6 group-hover:bg-gold">
              <Doodle name={fact.doodle} className="size-8 text-gold transition group-hover:text-night" />
            </span>
            <span>
              <span className="block font-display text-4xl leading-none text-gold">{fact.value}</span>
              <span className="text-sm text-cream/75">{fact.label}</span>
            </span>
          </li>
        ))}
      </ul>
      {hours === 0 && <p className="mt-5 text-sm text-cream/70">All zeros for now. Let&rsquo;s change that!</p>}
    </div>
  )
}

// A lanyard-style pass: purely for fun, it only shows what the forms next to it can change.
function PressPass({ user }) {
  return (
    <div className="relative mx-auto w-full max-w-xs -rotate-2 transition duration-500 hover:rotate-1 lg:sticky lg:top-6">
      {/* the lanyard strap and clip */}
      <div aria-hidden="true" className="mx-auto h-8 w-10 rounded-b-md bg-ember" />
      <div className="overflow-hidden rounded-3xl border border-line bg-cream shadow-xl">
        <div className="flex items-center justify-between bg-night px-5 py-3 text-cream">
          <span className="flex items-center gap-2 font-display text-lg">
            <LensMark className="size-5 text-gold" /> Lens Theory
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-gold">Press pass</span>
        </div>
        <div className="flex flex-col items-center gap-3 px-6 py-7 text-center">
          <div className="relative">
            <span className="flex size-24 items-center justify-center rounded-full bg-gold font-display text-4xl font-semibold text-ink ring-4 ring-gold/30">
              {initialsOf(user.name)}
            </span>
            <Doodle name="sparkle" className="absolute -right-2 -top-1 size-6 animate-twinkle text-ember motion-reduce:animate-none" />
          </div>
          <p className="font-display text-2xl leading-tight">{user.name}</p>
          <p className="break-all text-sm text-ink-soft">{user.email}</p>
          <p className="mt-2 rounded-full bg-tint px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-ember">
            In the frame since {formatMonth(user.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}

function FormCard({ icon, title, onSubmit, children }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-3xl border border-line bg-cream p-6">
      <h3 className="flex items-center gap-3 font-display text-2xl">
        <span className="flex size-10 items-center justify-center rounded-full bg-tint text-ember">
          <Icon name={icon} className="size-5" />
        </span>
        {title}
      </h3>
      {children}
    </form>
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
    setMessage(error ? { text: error.message ?? 'Could not save', isError: true } : { text: 'Lovely, saved!', isError: false })
  }

  return (
    <FormCard icon="user" title="Your name" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="account-name" className={labelClasses}>
          What should we call you?
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
      <p className="text-xs text-ink-soft">Your email ({user.email}) is how you sign in. Need it changed? Just get in touch.</p>
      <FormFooter isBusy={isSaving} label="Save name" busyLabel="Saving…" message={message} disabled={name.trim() === user.name} />
    </FormCard>
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
      setMessage({ text: 'Done! Other devices have been signed out.', isError: false })
    }
  }

  const fields = [
    { name: 'currentPassword', label: 'Current password', autoComplete: 'current-password' },
    { name: 'newPassword', label: 'New password (8+ characters)', autoComplete: 'new-password' },
    { name: 'confirmPassword', label: 'New password, once more', autoComplete: 'new-password' },
  ]

  return (
    <FormCard icon="key" title="Password" onSubmit={handleSubmit}>
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
    </FormCard>
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
