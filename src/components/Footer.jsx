import { useState } from 'react'
import { contactInfo, navLinks } from '../data/studioData'
import Button from './Button'

export default function Footer() {
  // Controlled input: the email text lives in state, and the input just displays it.
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="relative overflow-hidden bg-night px-5 text-cream sm:px-8 lg:px-16 xl:px-24">
      <div className="mx-auto max-w-[100rem] border-t border-cream/15">
        {/* Newsletter: one calm row */}
        <div className="flex flex-col gap-6 border-b border-cream/15 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <h2 className="font-display text-2xl font-medium">Stay in the frame</h2>
            <p className="mt-1 text-sm text-cream/70">
              New work, behind-the-scenes notes and the occasional offer. No spam, unsubscribe any time.
            </p>
          </div>

          {subscribed ? (
            <p role="status" className="font-medium text-gold">
              Thank you, you are on the list.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-w-0 flex-1 rounded-full border-[1.5px] border-cream/25 bg-cream/10 px-5 py-3 text-cream placeholder:text-cream/50 focus:border-gold focus:outline-none"
              />
              <Button type="submit" variant="light">
                Subscribe
              </Button>
            </form>
          )}
        </div>

        {/* Columns */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="flex max-w-sm flex-col items-start gap-4 sm:col-span-2 lg:col-span-1">
            <a href="#top" className="font-display text-xl font-semibold">
              Lens <span className="text-gold">Theory</span>
            </a>
            <p className="text-cream/70">
              A photography studio for portraits, weddings and family sessions, in the studio and on
              location.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="mb-4 font-body text-xs font-medium uppercase tracking-[0.18em] text-gold">Explore</h3>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-cream/90 transition hover:text-gold">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#contact" className="text-cream/90 transition hover:text-gold">
                  Book a Session
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 font-body text-xs font-medium uppercase tracking-[0.18em] text-gold">Get in touch</h3>
            <ul className="flex flex-col gap-2.5 text-cream/70">
              <li>
                <a href={`mailto:${contactInfo.email}`} className="break-words text-cream/90 transition hover:text-gold">
                  {contactInfo.email}
                </a>
              </li>
              <li>{contactInfo.replyTime}</li>
              <li>{contactInfo.sessions}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-cream/15 py-6 text-sm sm:flex-row">
          <p className="text-cream/60">&copy; 2026 Lens Theory. All rights reserved.</p>
          <a href="#top" className="font-medium text-cream/90 transition hover:text-gold">
            Back to top &uarr;
          </a>
        </div>
      </div>

      {/* Large faded wordmark, purely decorative */}
      <p
        aria-hidden="true"
        className="select-none whitespace-nowrap pb-4 text-center font-display text-[clamp(3rem,15vw,11rem)] font-medium leading-none text-cream/[0.06]"
      >
        LensTheory
      </p>
    </footer>
  )
}