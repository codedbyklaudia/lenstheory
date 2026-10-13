import { useState } from 'react'
import { navLinks } from '../data/studioData'
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
    <footer className="px-5 pb-8 pt-16 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-6xl">
        {/* Newsletter panel */}
        <div className="mb-14 flex flex-col gap-6 rounded-2xl bg-clay p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <h2 className="font-display text-3xl font-medium text-ink sm:text-4xl">Stay in the frame</h2>
            <p className="mt-2 text-ink">
              New work, behind-the-scenes notes and the occasional offer. No spam, unsubscribe any time.
            </p>
          </div>

          {subscribed ? (
            <p role="status" className="font-medium text-ink">
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
                className="min-w-0 flex-1 rounded-full border-[1.5px] border-transparent bg-cream px-5 py-3 text-ink placeholder:text-ink-soft/70 focus:border-ember focus:outline-none"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          )}
        </div>

        {/* Columns */}
        <div className="grid gap-10 border-b border-line pb-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="flex max-w-sm flex-col items-start gap-4 sm:col-span-2 lg:col-span-1">
            <a href="#top" className="font-display text-xl font-semibold text-ink">
              Lens <span className="text-ember">Theory</span>
            </a>
            <p className="text-ink-soft">
              A photography studio for portraits, weddings and family sessions, in the studio and on
              location.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="mb-4 font-body text-xs font-medium uppercase tracking-[0.18em] text-ember">
              Explore
            </h3>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-ink transition hover:text-ember">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#contact" className="text-ink transition hover:text-ember">
                  Book a Session
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 font-body text-xs font-medium uppercase tracking-[0.18em] text-ember">
              Get in touch
            </h3>
            <ul className="flex flex-col gap-2.5 text-ink-soft">
              <li>
                <a
                  href="mailto:hello@lenstheory.co.uk"
                  className="break-words text-ink transition hover:text-ember"
                >
                  hello@lenstheory.co.uk
                </a>
              </li>
              <li>Replies within two working days</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-sm sm:flex-row">
          <p className="text-ink-soft">&copy; 2026 Lens Theory. All rights reserved.</p>
          <a href="#top" className="font-medium text-ink transition hover:text-ember">
            Back to top &uarr;
          </a>
        </div>
      </div>
    </footer>
  )
}