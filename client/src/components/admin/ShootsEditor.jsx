import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import { uploadImage } from '../../lib/uploadImage'
import Button from '../Button'
import { inputClasses } from './FieldInput'

// The dashboard's "Sessions" tab: every customer's photo sessions (GET /api/shoots/all).
// For each one the studio can: pick the date, place and a note -> status 'scheduled';
// upload the finished photos; then set status 'delivered', which makes the photos appear in the
// customer's "My gallery" (and emails them, if email is set up).
// Paid orders create sessions automatically (Stripe webhook); "+ Add session" is for the rest.
// `users` is the list of customers from the dashboard data, for the "Add session" form.

const statuses = [
  { id: 'unscheduled', label: 'To schedule', classes: 'bg-gold text-ink' },
  { id: 'scheduled', label: 'Scheduled', classes: 'bg-night text-cream' },
  { id: 'delivered', label: 'Delivered', classes: 'bg-ember text-cream' },
]
const statusOf = (id) => statuses.find((s) => s.id === id) ?? statuses[0]

const formatWhen = (value) =>
  new Date(value).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// <input type="datetime-local"> works with LOCAL time written as 'YYYY-MM-DDTHH:mm'.
// The server stores a full date, so we convert in both directions.
function toInputValue(date) {
  if (!date) return ''
  const d = new Date(date)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function ShootsEditor({ users }) {
  const [shoots, setShoots] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [isAdding, setIsAdding] = useState(false)

  // EFFECT: load every session when the tab opens.
  useEffect(() => {
    apiFetch('/api/shoots/all')
      .then(setShoots)
      .catch((err) => setError(err.message))
  }, [])

  if (!shoots) return <p className="text-ink-soft">{error || 'Loading sessions…'}</p>

  const replace = (updated) => setShoots((current) => current.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
  const visible = filter === 'all' ? shoots : shoots.filter((shoot) => shoot.status === filter)
  const countOf = (id) => shoots.filter((shoot) => shoot.status === id).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter sessions" className="flex flex-wrap gap-2">
          {[{ id: 'all', label: 'All' }, ...statuses].map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                filter === option.id ? 'border-ink bg-ink text-cream' : 'border-ink/25 bg-cream hover:border-ink'
              }`}
            >
              {option.label} <span className="text-xs opacity-70">{option.id === 'all' ? shoots.length : countOf(option.id)}</span>
            </button>
          ))}
        </div>
        {!isAdding && <Button onClick={() => setIsAdding(true)}>+ Add session</Button>}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-ember/10 px-4 py-3 text-sm text-ember">
          {error}
        </p>
      )}

      {isAdding && (
        <AddShootForm
          users={users}
          onAdded={(created) => {
            setShoots((current) => [created, ...current])
            setIsAdding(false)
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      <ul className="flex flex-col gap-3">
        {visible.map((shoot) => (
          <ShootCard
            key={shoot.id}
            shoot={shoot}
            onChange={replace}
            onDeleted={() => setShoots((current) => current.filter((s) => s.id !== shoot.id))}
          />
        ))}
      </ul>
      {visible.length === 0 && <p className="py-10 text-center text-ink-soft">No sessions here.</p>}
    </div>
  )
}

function AddShootForm({ users, onAdded, onCancel }) {
  const [form, setForm] = useState({ userId: '', serviceName: '' })
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      onAdded(await apiFetch('/api/shoots', { method: 'POST', body: JSON.stringify(form) }))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-line bg-cream p-5 sm:grid-cols-2 sm:p-6">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Client
        <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className={inputClasses}>
          <option value="">Choose a client…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Session
        <input
          required
          placeholder="e.g. Wedding (full day)"
          value={form.serviceName}
          onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
          className={inputClasses}
        />
      </label>
      {error && <p className="text-sm text-ember sm:col-span-2">{error}</p>}
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit">Add session</Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function ShootCard({ shoot, onChange, onDeleted }) {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    status: shoot.status,
    scheduledAt: toInputValue(shoot.scheduledAt),
    location: shoot.location ?? '',
    notes: shoot.notes ?? '',
  })
  const [message, setMessage] = useState({ text: '', isError: false })
  const [isBusy, setIsBusy] = useState(false)
  const [uploading, setUploading] = useState('') // e.g. 'Uploading 2 of 5…'

  const status = statusOf(shoot.status)
  const change = (name) => (event) => setForm({ ...form, [name]: event.target.value })

  async function save(event) {
    event.preventDefault()
    setIsBusy(true)
    setMessage({ text: '', isError: false })
    try {
      const updated = await apiFetch(`/api/shoots/${shoot.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...form, scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null }),
      })
      onChange(updated)
      setMessage({ text: updated.emailed ? `Saved, and ${shoot.userName} has been emailed.` : 'Saved.', isError: false })
    } catch (err) {
      setMessage({ text: err.message, isError: true })
    } finally {
      setIsBusy(false)
    }
  }

  // Upload the chosen files one after the other: each goes to Blob storage (/api/uploads),
  // then its URL is attached to this session (/api/shoots/:id/photos).
  async function addPhotos(event) {
    const files = [...event.target.files]
    event.target.value = ''
    const added = []
    try {
      for (const [index, file] of files.entries()) {
        setUploading(`Uploading ${index + 1} of ${files.length}…`)
        const src = await uploadImage(file)
        added.push(await apiFetch(`/api/shoots/${shoot.id}/photos`, { method: 'POST', body: JSON.stringify({ src }) }))
      }
    } catch (err) {
      setMessage({ text: err.message, isError: true })
    } finally {
      setUploading('')
      onChange({ id: shoot.id, photos: [...shoot.photos, ...added] })
    }
  }

  async function removePhoto(photoId) {
    try {
      await apiFetch(`/api/shoots/photos/${photoId}`, { method: 'DELETE' })
      onChange({ id: shoot.id, photos: shoot.photos.filter((photo) => photo.id !== photoId) })
    } catch (err) {
      setMessage({ text: err.message, isError: true })
    }
  }

  async function removeShoot() {
    if (!window.confirm(`Delete "${shoot.serviceName}" for ${shoot.userName}, and its ${shoot.photos.length} photos?`)) return
    try {
      await apiFetch(`/api/shoots/${shoot.id}`, { method: 'DELETE' })
      onDeleted()
    } catch (err) {
      setMessage({ text: err.message, isError: true })
    }
  }

  return (
    <li className="rounded-2xl border border-line bg-cream">
      <button type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left sm:p-5">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.classes}`}>{status.label}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{shoot.serviceName}</span>
          <span className="block text-sm text-ink-soft">
            {shoot.userName} &middot; {shoot.userEmail}
          </span>
        </span>
        <span className="text-sm text-ink-soft">
          {shoot.scheduledAt ? formatWhen(shoot.scheduledAt) : 'No date yet'} &middot; {shoot.photos.length} photos
        </span>
        <span aria-hidden="true" className={`transition ${isOpen ? 'rotate-180' : ''}`}>
          &#9662;
        </span>
      </button>

      {isOpen && (
        <div className="grid gap-6 border-t border-line p-4 sm:p-6 lg:grid-cols-2">
          <form onSubmit={save} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Status
              <select value={form.status} onChange={change('status')} className={`${inputClasses} max-w-xs`}>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Date and time
              <input type="datetime-local" value={form.scheduledAt} onChange={change('scheduledAt')} className={`${inputClasses} max-w-xs`} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Location
              <input placeholder="e.g. The studio, 12 High Street" value={form.location} onChange={change('location')} className={inputClasses} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Note for the client
              <textarea rows={3} placeholder="e.g. Bring two outfits; we will start indoors." value={form.notes} onChange={change('notes')} className={`${inputClasses} resize-y`} />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isBusy}>
                {isBusy ? 'Saving…' : 'Save'}
              </Button>
              <button type="button" onClick={removeShoot} className="ml-auto text-sm font-medium text-ember underline-offset-4 hover:underline">
                Delete session
              </button>
            </div>
            <p role="status" className={`text-sm ${message.isError ? 'text-ember' : 'text-ink-soft'}`}>
              {message.text}
            </p>
          </form>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Client&rsquo;s photos</p>
              <label className={`cursor-pointer rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition hover:bg-ember ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
                {uploading || '+ Upload photos'}
                <input type="file" accept="image/*" multiple onChange={addPhotos} className="sr-only" />
              </label>
            </div>
            <p className="text-xs text-ink-soft">
              {shoot.status === 'delivered'
                ? 'Delivered: the client can see these in My gallery.'
                : 'The client sees these once you set the status to Delivered.'}
            </p>
            {shoot.photos.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {shoot.photos.map((photo) => (
                  <li key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-tint">
                    <img src={photo.src} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      aria-label="Remove this photo"
                      className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-ink/70 text-cream transition hover:bg-ember sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink-soft">No photos yet.</p>
            )}
          </div>
        </div>
      )}
    </li>
  )
}
