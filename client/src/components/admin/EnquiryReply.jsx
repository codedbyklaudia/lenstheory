import { useState } from 'react'
import { apiFetch } from '../../lib/api'
import Button from '../Button'
import { inputClasses } from './FieldInput'

const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Opens under an enquiry in the dashboard: the full message, the replies already sent, and a box
// to write a new one. "Send" calls POST /api/admin/enquiries/:id/replies, and the SERVER emails it
// to the customer (the browser never sends email itself).
// `admin` is the signed-in admin; `onSent(reply)` lets the dashboard show the new reply straight away.
export default function EnquiryReply({ enquiry, admin, onSent }) {
  const customerFirstName = enquiry.name.trim().split(/\s+/)[0]
  const adminFirstName = admin.name.trim().split(/\s+/)[0]

  // The reply starts as a little template, with space in the middle for your message.
  const [message, setMessage] = useState(`Hi ${customerFirstName},\n\n\n\nBest wishes,\n${adminFirstName}\nLens Theory`)
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSending(true)
    setError('')
    try {
      const reply = await apiFetch(`/api/admin/enquiries/${enquiry.id}/replies`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
      onSent(reply)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* The conversation so far: their message, then every reply */}
      <div className="flex flex-col gap-3">
        <Bubble who={`${enquiry.name} wrote`} when={enquiry.createdAt} text={enquiry.message} />
        {enquiry.replies.map((reply) => (
          <Bubble key={reply.id} who={`Reply from ${reply.sentBy}`} when={reply.createdAt} text={reply.message} isReply />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor={`reply-${enquiry.id}`} className="text-sm font-medium">
          Reply to <span className="text-ember">{enquiry.email}</span>
        </label>
        <textarea
          id={`reply-${enquiry.id}`}
          rows={9}
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={`${inputClasses} resize-y`}
        />
        <p className="text-xs text-ink-soft">
          Their message is quoted under your reply. When they answer, it goes to your inbox ({admin.email}).
        </p>
        {error && (
          <p role="alert" className="text-sm text-ember">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSending} className="self-start">
          {isSending ? 'Sending…' : 'Send email'}
        </Button>
      </form>
    </div>
  )
}

function Bubble({ who, when, text, isReply = false }) {
  return (
    <div className={`rounded-xl p-4 ${isReply ? 'ml-6 bg-night text-cream' : 'mr-6 bg-tint'}`}>
      <p className={`mb-2 text-xs ${isReply ? 'text-gold' : 'text-ink-soft'}`}>
        {who} &middot; {formatDateTime(when)}
      </p>
      <p className="whitespace-pre-line text-sm">{text}</p>
    </div>
  )
}
