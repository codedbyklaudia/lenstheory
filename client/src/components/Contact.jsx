import { useEffect, useState } from 'react'
import { contactInfo, contactPhoto, shootTypes } from '../data/studioData'
import { apiFetch } from '../lib/api'
import Button from './Button'
import FaqList from './Faq'
import Reveal from './Reveal'
import Section from './Section'
import SectionHeading from './SectionHeading'

const fieldBase =
  'w-full rounded-lg border border-line bg-tint text-ink placeholder:text-ink-soft/60 transition focus:border-ember focus:bg-cream focus:outline-none focus:ring-4 focus:ring-ember/15'
const inputClasses = `${fieldBase} h-13 px-4`
const selectClasses = `${fieldBase} h-13 appearance-none pl-4 pr-10`
const labelClasses =
  'mb-1.5 block text-sm font-medium text-ink transition group-focus-within/field:text-ember'

const emptyForm = { name: '', email: '', date: '', time: 'Flexible', message: '' }
const MESSAGE_MAX = 2000

// Small line icons for the contact details.
function Icon({ name }) {
  const paths = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
        <circle cx="12" cy="11" r="2" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}

// A label + its input. `group/field` lets the label turn ember while the field inside has focus.
function Field({ label, htmlFor, className = '', children }) {
  return (
    <div className={`group/field ${className}`}>
      <label htmlFor={htmlFor} className={labelClasses}>
        {label}
      </label>
      {children}
    </div>
  )
}

// `shootType` and `onShootTypeChange` come from App, so clicking "Enquire" on the wedding card
// can pre-select "Wedding" here. Every field below is a CONTROLLED input: React state holds the
// value, and each input just displays it and reports changes.
// `user` is the signed-in user (or null): we use it to fill in their name and email for them.
export default function Contact({ shootType, onShootTypeChange, user }) {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('idle') // 'idle' -> 'sending' -> 'sent'
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // EFFECT: once we know who is signed in, fill in any name/email field that is still empty.
  useEffect(() => {
    if (!user) return
    setForm((current) => ({
      ...current,
      name: current.name || user.name,
      email: current.email || user.email,
    }))
  }, [user])

  // One handler for all text fields: the input's `name` tells us which part of the state to update.
  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  // Send the enquiry to the API, which saves it in the `enquiries` table.
  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('sending')
    setError('')
    try {
      await apiFetch('/api/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          shootType,
          preferredDate: form.date,
          timeOfDay: form.time,
          message: form.message,
        }),
      })
      setStatus('sent')
    } catch (err) {
      setStatus('idle')
      setError(err.message)
    }
  }

  function handleReset() {
    setForm(user ? { ...emptyForm, name: user.name, email: user.email } : emptyForm)
    onShootTypeChange('')
    setStatus('idle')
  }

  // Copy the studio's email address, and show "Copied" for two seconds.
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contactInfo.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked by the browser: the address is still on screen to copy by hand.
    }
  }

  const firstName = form.name.trim().split(' ')[0]

  // DERIVED DATA: how many of the four required answers are filled in, for the progress bar.
  const requiredDone = [form.name.trim(), form.email.includes('@'), shootType, form.message.trim()].filter(Boolean).length

  const details = [
    {
      icon: 'mail',
      label: 'Email',
      value: (
        <a href={`mailto:${contactInfo.email}`} className="transition hover:text-gold">
          {contactInfo.email}
        </a>
      ),
      action: (
        <button
          type="button"
          onClick={copyEmail}
          className="ml-auto shrink-0 rounded-full border border-cream/25 px-3 py-1 text-xs uppercase tracking-[0.12em] text-cream/80 transition hover:border-gold hover:text-gold"
        >
          <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy'}</span>
        </button>
      ),
    },
    { icon: 'clock', label: 'Reply time', value: contactInfo.replyTime },
    { icon: 'pin', label: 'Sessions', value: contactInfo.sessions },
  ]

  // A photo softly behind the section, fading into solid green at the bottom so it joins the footer.
  const background = (
    <>
      <img
        src={contactPhoto.src}
        alt=""
        loading="lazy"
        style={{ objectPosition: contactPhoto.position }}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-night/80 via-night/75 to-night" />
    </>
  )

  return (
    <Section id="contact" tone="night" background={background}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-20 xl:gap-28">
        {/* On big screens this column stays in view (sticky) while you scroll down the form */}
        <div className="lg:sticky lg:top-32">
          <SectionHeading
            eyebrow="Book a session"
            number="04"
            title={
              <>
                Let's make something <em>worth framing</em>
              </>
            }
            doodle="sparkle"
            dark
          >
            Tell us about your shoot and we will get back to you within two working days.
          </SectionHeading>

          <ul className="flex flex-col gap-3">
            {details.map((item, index) => (
              <Reveal as="li" key={item.label} delay={index * 120}>
                <div className="group flex items-center gap-4 rounded-xl border border-cream/10 bg-cream/5 p-4 backdrop-blur-sm transition duration-300 hover:border-gold/40 hover:bg-cream/10">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold transition duration-300 group-hover:bg-gold group-hover:text-night">
                    <Icon name={item.icon} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.15em] text-gold">{item.label}</p>
                    <p className="truncate font-display text-lg text-cream">{item.value}</p>
                  </div>
                  {item.action}
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* The form sits on a light card, so it stands out against the dark photo */}
        <Reveal delay={150} className="rounded-2xl bg-cream p-6 text-ink shadow-2xl sm:p-8">
          {status === 'sent' ? (
            <div role="status" className="flex flex-col items-start gap-4 py-6">
              <span className="flex size-16 animate-pop items-center justify-center rounded-full bg-ember text-3xl text-cream motion-reduce:animate-none">
                &#10003;
              </span>
              <h3 className="animate-fade-up font-display text-3xl motion-reduce:animate-none">
                Thank you{firstName ? `, ${firstName}` : ''}
              </h3>
              <p className="text-ink-soft">
                We have your enquiry{shootType ? ` for a ${shootType.toLowerCase()} session` : ''} and will
                reply to <strong className="font-medium text-ink">{form.email}</strong> within two working days.
              </p>
              <Button variant="ghost" onClick={handleReset}>
                Send another enquiry
              </Button>
            </div>
          ) : (
            <>
              {/* Progress: fills up as the required answers are given */}
              <div className="mb-7">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl">Your enquiry</h3>
                  <p className="text-xs uppercase tracking-[0.15em] text-ink-soft">
                    {requiredDone === 4 ? 'Ready to send' : `${requiredDone} of 4 answered`}
                  </p>
                </div>
                <div
                  role="progressbar"
                  aria-label="Required answers given"
                  aria-valuemin={0}
                  aria-valuemax={4}
                  aria-valuenow={requiredDone}
                  className="mt-3 h-1 overflow-hidden rounded-full bg-line"
                >
                  <div
                    style={{ width: `${(requiredDone / 4) * 100}%` }}
                    className="h-full rounded-full bg-ember transition-[width] duration-500 ease-out"
                  />
                </div>
                {user && (
                  <p className="mt-3 text-sm text-ink-soft">
                    Signed in as {user.name}, so we have filled in your details.
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" htmlFor="name">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </Field>

                <Field label="Email" htmlFor="email">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </Field>

                {/* Pill buttons instead of a dropdown: quicker to tap, and you see every option at once */}
                <fieldset className="sm:col-span-2">
                  <legend className={labelClasses}>What are you booking?</legend>
                  <div className="flex flex-wrap gap-2">
                    {shootTypes.map((type) => {
                      const isSelected = shootType === type
                      return (
                        <label
                          key={type}
                          className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                            isSelected
                              ? 'scale-105 border-ink bg-ink text-cream shadow-md'
                              : 'border-ink/25 text-ink hover:border-ink'
                          }`}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type}
                            required
                            checked={isSelected}
                            onChange={() => onShootTypeChange(type)}
                            className="sr-only"
                          />
                          {type}
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                <Field label="Preferred date" htmlFor="date">
                  <input
                    id="date"
                    name="date"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.date}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </Field>

                <Field label="Best time of day" htmlFor="time">
                  <div className="relative">
                    <select
                      id="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      className={selectClasses}
                    >
                      {['Flexible', 'Morning', 'Afternoon', 'Evening'].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ember"
                    >
                      &#9662;
                    </span>
                  </div>
                </Field>

                <Field label="Tell us about your shoot" htmlFor="message" className="sm:col-span-2">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    maxLength={MESSAGE_MAX}
                    placeholder="Who is in the photos, where you'd like to shoot, any ideas you love…"
                    value={form.message}
                    onChange={handleChange}
                    className={`${fieldBase} resize-y px-4 py-3`}
                  />
                  <p className="mt-1 text-right text-xs text-ink-soft tabular-nums">
                    {form.message.length} / {MESSAGE_MAX}
                  </p>
                </Field>

                <div className="flex flex-col gap-3 sm:col-span-2">
                  {error && (
                    <p role="alert" className="text-sm text-ember">
                      {error}
                    </p>
                  )}
                  <Button type="submit" disabled={status === 'sending'} className="group w-full gap-2">
                    {status === 'sending' ? 'Sending…' : 'Send enquiry'}
                    {status !== 'sending' && (
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    )}
                  </Button>
                  <p className="text-center text-sm text-ink-soft">
                    We reply within two working days. Your details are only used to answer your enquiry.
                  </p>
                </div>
              </form>
            </>
          )}
        </Reveal>
      </div>

      {/* Questions, answered right where people are about to enquire */}
      <div className="mt-20 border-t border-cream/20 pt-12 lg:mt-28 lg:grid lg:grid-cols-[1fr_1.6fr] lg:gap-20 xl:gap-28">
        <Reveal as="h3" className="mb-6 font-display text-2xl text-cream sm:text-3xl lg:mb-0">
          Good to know before you book
        </Reveal>
        <FaqList />
      </div>
    </Section>
  )
}
