import { useEffect, useState } from 'react'
import { shootTypes } from '../data/studioData'
import { apiFetch } from '../lib/api'
import Button from './Button'
import Doodle, { Squiggle } from './Doodle'
import FaqList from './Faq'
import { Mailbox, SnappyLine } from './Illustrations'
import LensMark from './LensMark'
import Reveal from './Reveal'
import Section from './Section'
import SectionHeading from './SectionHeading'

// The blanks you fill in inside the letter: just a dashed line to write on, which turns solid
// ember while you type. Your answers are written in ember, like ink.
const blankClasses =
  'inline-block max-w-full rounded-none border-0 border-b-2 border-dashed border-ink/30 bg-transparent px-1 py-0.5 font-body text-lg text-ember placeholder:text-ink-soft/40 transition focus:border-solid focus:border-ember focus:bg-tint/60 focus:outline-none'

// Writing-paper lines for the message box: one faint line every 2.25rem (the text's line height).
const ruledPaper = {
  backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent calc(2.25rem - 1px), var(--color-line) calc(2.25rem - 1px), var(--color-line) 2.25rem)',
  backgroundAttachment: 'local',
}

// The time-of-day choices, written so they finish the sentence "If possible, on <date> ...".
// The values (left) are what the server expects; only the words shown change.
const timeOptions = {
  Flexible: 'whenever suits you',
  Morning: 'in the morning',
  Afternoon: 'in the afternoon',
  Evening: 'in the evening (golden hour!)',
}

const emptyForm = { name: '', email: '', date: '', time: 'Flexible', message: '' }

// A little doodle for each shoot type pill.
const shootDoodles = { Portrait: 'camera', Wedding: 'heart', 'Family session': 'flower', 'Something else': 'star' }

// What Snappy says when you pick a shoot type.
const shootReactions = {
  Portrait: { mood: 'excited', text: 'Your close-up! I\u2019ll bring my best angle.' },
  Wedding: { mood: 'love', text: 'A wedding?! I\u2019m already tearing up.' },
  'Family session': { mood: 'excited', text: 'Family photos! Bring the dog too.' },
  'Something else': { mood: 'curious', text: 'A mystery shoot? Ooh, I\u2019m intrigued.' },
}

// Snappy, the camera next to the form, reacts to what you are doing. This works it out from the
// form's state (DERIVED DATA, nothing extra is stored). The first rule that matches wins.
function snappySays({ status, form, shootType, focused, requiredDone }) {
  const firstName = form.name.trim().split(' ')[0]
  if (status === 'sent') return { mood: 'excited', text: 'Woohoo! It\u2019s in the post!' }
  if (status === 'sending') return { mood: 'curious', text: 'Popping it in the post\u2026' }
  if (requiredDone === 4) return { mood: 'excited', text: 'Looks perfect. Hit send!' }
  if (focused === 'message') {
    return form.message.length > 80
      ? { mood: 'love', text: 'Ooh, I love a good story\u2026' }
      : { mood: 'curious', text: 'Tell me everything: who, where, what vibe?' }
  }
  if (focused === 'date' || focused === 'time') return { mood: 'curious', text: 'Golden hour is my favourite. Just saying.' }
  if (shootType && (focused === 'type' || !form.message)) return shootReactions[shootType]
  if (firstName) return { mood: 'happy', text: `Nice to meet you, ${firstName}!` }
  if (focused) return { mood: 'happy', text: 'Ooh, hello! Start with your name.' }
  return { mood: 'sleepy', text: 'Psst\u2026 fill me in, it only takes a minute!' }
}

// Confetti: 16 little doodles that fly out in a circle when the enquiry is sent.
// Each piece gets its own direction (--x, --y) and spin (--r) as CSS variables.
const confettiPieces = Array.from({ length: 16 }, (_, index) => {
  const angle = (index / 16) * Math.PI * 2
  const distance = index % 2 ? 150 : 100
  return {
    doodle: ['sparkle', 'star', 'heart', 'flower'][index % 4],
    style: { '--x': `${Math.cos(angle) * distance}px`, '--y': `${Math.sin(angle) * distance}px`, '--r': `${index * 47}deg` },
    color: index % 3 ? 'text-gold' : 'text-ember',
  }
})
const MESSAGE_MAX = 2000

// The envelope icon on the email note.
function Icon({ name }) {
  const paths = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
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

// An outlined speech bubble for Snappy, with a little tail pointing down at it.
// `key={text}` makes it pop in again every time Snappy says something new.
function SpeechBubble({ text, className = '' }) {
  return (
    <p
      key={text}
      className={`animate-pop rounded-2xl border-2 border-gold/70 bg-night/60 px-4 py-2 font-display text-lg italic leading-snug text-gold backdrop-blur-sm motion-reduce:animate-none after:absolute after:-bottom-[9px] after:left-10 after:size-4 after:rotate-45 after:border-b-2 after:border-r-2 after:border-gold/70 after:bg-night ${className}`}
    >
      {text}
    </p>
  )
}

// `shootType` and `onShootTypeChange` come from App, so clicking "Enquire" on the wedding card
// can pre-select "Wedding" here. Every field below is a CONTROLLED input: React state holds the
// value, and each input just displays it and reports changes.
// `user` is the signed-in user (or null): we use it to fill in their name and email for them.
// `content` is this section's editable text, contact details and FAQ (from /api/content).
export default function Contact({ content, shootType, onShootTypeChange, user }) {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('idle') // 'idle' -> 'sending' -> 'sent'
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [focused, setFocused] = useState('') // the name of the field being filled in, for Snappy

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
      await navigator.clipboard.writeText(content.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked by the browser: the address is still on screen to copy by hand.
    }
  }

  const firstName = form.name.trim().split(' ')[0]

  // DERIVED DATA: how many of the four required answers are filled in, for the progress bar.
  // DERIVED DATA: how many of the four required answers are filled in (at 4, Snappy says "Hit send!").
  const requiredDone = [form.name.trim(), form.email.includes('@'), shootType, form.message.trim()].filter(Boolean).length
  const snappy = snappySays({ status, form, shootType, focused, requiredDone })


  // A photo softly behind the section, fading into solid green at the bottom so it joins the footer.
  const background = (
    <>
      <img
        src={content.backgroundImage}
        alt=""
        loading="lazy"
        style={{ objectPosition: 'center 40%' }}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-night/80 via-night/75 to-night" />
    </>
  )

  return (
    <Section id="contact" tone="night" background={background}>
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16 xl:gap-20">
        {/* On big screens this column is as tall as the letter (self-stretch), so Snappy, below the
            contact notes, can stick to the top of the screen while you scroll down the letter */}
        <div className="flex flex-col lg:self-stretch">
          <SectionHeading
            eyebrow="Book a session"
            number="04"
            title={
              <>
                {content.title} <em>{content.titleHighlight}</em>
              </>
            }
            dark
          >
            {content.intro}
          </SectionHeading>

          {/* The studio's email, as a note "taped" on at a slight angle */}
          <Reveal>
            <div className="group relative flex max-w-md -rotate-1 items-center gap-4 rounded-xl border border-cream/10 bg-cream/5 p-4 backdrop-blur-sm transition duration-300 before:absolute before:-top-2 before:left-8 before:h-4 before:w-14 before:-rotate-6 before:rounded-sm before:bg-gold/40 hover:rotate-0 hover:border-gold/40 hover:bg-cream/10">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold transition duration-300 group-hover:-rotate-12 group-hover:bg-gold group-hover:text-night">
                <Icon name="mail" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.15em] text-gold">Prefer email?</p>
                <a href={`mailto:${content.email}`} className="block truncate font-display text-lg text-cream transition hover:text-gold">
                  {content.email}
                </a>
              </div>
              <button
                type="button"
                onClick={copyEmail}
                className="ml-auto shrink-0 rounded-full border border-cream/25 px-3 py-1 text-xs uppercase tracking-[0.12em] text-cream/80 transition hover:border-gold hover:text-gold"
              >
                <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy'}</span>
              </button>
            </div>
          </Reveal>

          {/* Snappy and the post box (big screens). Snappy reacts as you fill in the form,
              and the post box's flag pops up once the enquiry is sent. */}
          <div aria-hidden="true" className="hidden items-end gap-2 lg:sticky lg:top-24 lg:mt-6 lg:flex lg:pt-28">
            <div className="relative">
              <SpeechBubble text={snappy.text} className="absolute -top-20 left-6 w-64" />
              <SnappyLine mood={snappy.mood} printing={snappy.mood === 'excited'} className="w-40 text-gold" />
            </div>
            <Mailbox isSent={status === 'sent'} className="w-24 text-gold" />
            <Doodle name="flower" className="mb-2 size-10 animate-wiggle text-gold/60" />
          </div>
        </div>

        {/* The form sits on a light card, styled as a LETTER, with a stamp in the corner */}
        <Reveal delay={150} className="relative rounded-2xl bg-cream p-6 text-ink shadow-2xl sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute right-6 top-6 hidden sm:block">
            <div className="relative flex size-20 rotate-6 flex-col items-center justify-center gap-1 rounded-sm border-[3px] border-dotted border-ember/50 bg-tint">
              <LensMark className="size-8 text-ember" />
              <span className="text-[0.55rem] font-medium uppercase tracking-[0.2em] text-ember">1st class</span>
            </div>
          </div>

          {status === 'sent' ? (
            <div role="status" className="relative flex flex-col items-start gap-4 py-6">
              {/* Snappy celebrates (printing a photo), inside a burst of doodle confetti */}
              <div className="relative">
                <SnappyLine mood="excited" fill="fill-cream" className="w-28 animate-pop text-ink" />
                <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
                  {confettiPieces.map((piece, index) => (
                    <Doodle
                      key={index}
                      name={piece.doodle}
                      style={piece.style}
                      className={`absolute size-5 animate-confetti ${piece.color}`}
                    />
                  ))}
                </div>
              </div>
              <h3 className="animate-fade-up font-display text-3xl motion-reduce:animate-none">
                Letter sent! Thank you{firstName ? `, ${firstName}` : ''}
              </h3>
              <p className="text-ink-soft">
                We have your enquiry{shootType ? ` for a ${shootType.toLowerCase()} session` : ''} and will
                reply to <strong className="font-medium text-ink">{form.email}</strong>{' '}
                {content.replyTime.toLowerCase()}.
              </p>
              <Button variant="ghost" onClick={handleReset}>
                Send another enquiry
              </Button>
            </div>
          ) : (
            <>
              {/* On smaller screens Snappy reads over your shoulder, right here in the card */}
              <div aria-hidden="true" className="mb-5 flex items-center gap-3 lg:hidden">
                <SnappyLine mood={snappy.mood} printing={false} fill="fill-cream" className="w-16 shrink-0 text-ink" />
                <p className="rounded-2xl rounded-bl-sm bg-tint px-4 py-2 font-display text-lg italic text-ember">{snappy.text}</p>
              </div>

              {/* The whole form is one LETTER: the answers are blanks inside the sentences.
                  Every input still has its own accessible name (aria-label), because the sentence
                  around it is not a <label>. onFocus/onBlur on the form hear every field, for Snappy. */}
              <form
                onSubmit={handleSubmit}
                onFocus={(event) => setFocused(event.target.name)}
                onBlur={() => setFocused('')}
                className="relative flex flex-col gap-6 font-display text-xl leading-relaxed text-ink sm:pl-8"
              >
                {/* a notebook margin line down the left of the letter */}
                <span aria-hidden="true" className="absolute inset-y-0 left-1 hidden w-px bg-ember/30 sm:block" />

                <div className="sm:pr-28">
                  <h3 className="text-4xl italic">Dear Lens Theory,</h3>
                </div>

                <div className="leading-[2.6]">
                  My name is{' '}
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    aria-label="Your name"
                    placeholder="your name"
                    value={form.name}
                    onChange={handleChange}
                    className={`${blankClasses} w-48 sm:w-56`}
                  />{' '}
                  and you can write back to me at{' '}
                  {/* the blank and its full stop stay together, so the "." never wraps onto its own line */}
                  <span className="inline-flex w-full items-baseline sm:w-auto">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-label="Your email address"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`${blankClasses} min-w-0 flex-1 sm:w-72 sm:flex-none`}
                  />
                  .
                  </span>
                </div>

                {/* Pill buttons instead of a dropdown: quicker to tap, and you see every option at once */}
                <fieldset>
                  <legend className="mb-3">I&rsquo;d love to book a&hellip;</legend>
                  <div className="flex flex-wrap items-center gap-2">
                    {shootTypes.map((type) => {
                      const isSelected = shootType === type
                      return (
                        <label
                          key={type}
                          className={`group/pill flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-medium transition duration-200 hover:-translate-y-0.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                            isSelected
                              ? '-rotate-2 scale-105 border-ink bg-ink text-cream shadow-md'
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
                          <Doodle
                            name={shootDoodles[type]}
                            className={`size-5 transition duration-300 group-hover/pill:scale-125 ${isSelected ? 'animate-wiggle text-gold' : 'text-ember'}`}
                          />
                          {type}
                        </label>
                      )
                    })}
                    <span className="ml-1">session.</span>
                  </div>
                </fieldset>

                <div className="leading-[2.6]">
                  If possible, on{' '}
                  <input
                    id="date"
                    name="date"
                    type="date"
                    aria-label="Preferred date (optional)"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.date}
                    onChange={handleChange}
                    className={`${blankClasses} w-48`}
                  />{' '}
                  <span className="relative inline-block">
                    <select
                      id="time"
                      name="time"
                      aria-label="Best time of day"
                      value={form.time}
                      onChange={handleChange}
                      className={`${blankClasses} appearance-none pr-6`}
                    >
                      {Object.entries(timeOptions).map(([value, words]) => (
                        <option key={value} value={value}>
                          {words}
                        </option>
                      ))}
                    </select>
                    <span aria-hidden="true" className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 font-body text-sm text-ember">
                      &#9662;
                    </span>
                  </span>
                  .
                </div>

                <div>
                  <label htmlFor="message">Here&rsquo;s what I have in mind:</label>
                  {/* Ruled like writing paper: the lines are a repeating gradient, as tall as one line of text */}
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    maxLength={MESSAGE_MAX}
                    placeholder="Who’s in the photos? Where? Any ideas, outfits or Pinterest boards you love…"
                    value={form.message}
                    onChange={handleChange}
                    style={ruledPaper}
                    className="mt-2 w-full resize-y border-0 bg-transparent px-1 font-body text-lg leading-[2.25rem] text-ember placeholder:text-ink-soft/50 focus:outline-none"
                  />
                </div>

                {/* The sign-off: your name appears as a signature as you type it */}
                <div>
                  <p className="italic">Warmly,</p>
                  <p aria-hidden="true" className="relative mt-1 inline-block -rotate-2 text-4xl italic text-ember">
                    {form.name.trim() || <span className="text-ink-soft/40">your name here</span>}
                    {form.name.trim() && <Squiggle key={form.name.trim()} className="text-gold" />}
                  </p>
                </div>

                <div className="flex flex-col gap-3 font-body text-base">
                  {error && (
                    <p role="alert" className="text-sm text-ember">
                      {error}
                    </p>
                  )}
                  <Button type="submit" disabled={status === 'sending'} className="group w-full gap-2">
                    {status === 'sending' ? 'Popping it in the post…' : 'Seal & send my letter'}
                    {status !== 'sending' && (
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </Reveal>
      </div>

      {/* Questions, answered right where people are about to enquire */}
      <div className="mt-20 border-t border-cream/20 pt-12 lg:mt-28 lg:grid lg:grid-cols-[1fr_1.6fr] lg:gap-20 xl:gap-28">
        <Reveal className="mb-6 lg:mb-0">
          <h3 className="font-display text-2xl text-cream sm:text-3xl">{content.faqTitle}</h3>
          {/* a curious little camera, and a nudge for anything not answered below */}
          <div className="mt-6 hidden items-center gap-4 lg:flex">
            <Doodle name="camera" className="size-14 animate-wiggle text-gold/70" />
            <p className="max-w-56 text-sm text-cream/60">Still curious? Ask anything in your message, we love questions.</p>
          </div>
        </Reveal>
        <FaqList faqs={content.faqs} />
      </div>
    </Section>
  )
}
