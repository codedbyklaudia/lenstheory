import { useEffect, useState } from 'react'
import { authClient } from '../lib/authClient'
import Button from './Button'

const inputClasses =
  'h-13 w-full rounded-lg border border-line bg-tint px-4 text-ink placeholder:text-ink-soft/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20'
const labelClasses = 'mb-1.5 block text-sm font-medium text-ink'

// One form for both "Sign in" and "Create account"; `mode` decides which one is showing.
// On success Better Auth sets a session cookie, useSession() in App notices, and the UI updates.
export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signIn') // 'signIn' or 'signUp'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)

  const isSignUp = mode === 'signUp'

  // Same idea as the other modals: Escape closes it and the page behind can't scroll.
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

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSending(true)

    // Better Auth returns { data, error } instead of throwing.
    const { error } = isSignUp
      ? await authClient.signUp.email({ name: form.name, email: form.email, password: form.password })
      : await authClient.signIn.email({ email: form.email, password: form.password })

    setIsSending(false)
    if (error) {
      setError(error.message ?? 'Something went wrong, please try again.')
    } else {
      onClose()
    }
  }

  function switchMode() {
    setMode(isSignUp ? 'signIn' : 'signUp')
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="relative w-full max-w-md animate-fade-in rounded-2xl bg-cream p-6 shadow-2xl motion-reduce:animate-none sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-title" className="font-display text-2xl sm:text-3xl">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {isSignUp ? 'An account lets you request bookings.' : 'Sign in to request a booking.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-2xl leading-none transition hover:bg-clay"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div>
              <label htmlFor="auth-name" className={labelClasses}>
                Name
              </label>
              <input
                id="auth-name"
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className={labelClasses}>
              Email
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className={labelClasses}>
              Password
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={handleChange}
              className={inputClasses}
            />
            {isSignUp && <p className="mt-1.5 text-xs text-ink-soft">At least 8 characters.</p>}
          </div>

          {error && (
            <p role="alert" className="text-sm text-ember">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isSending} className="mt-2 w-full">
            {isSending ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-soft">
          {isSignUp ? 'Already have an account?' : 'New to Lens Theory?'}{' '}
          <button type="button" onClick={switchMode} className="font-medium text-ink underline underline-offset-4 hover:text-ember">
            {isSignUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  )
}
