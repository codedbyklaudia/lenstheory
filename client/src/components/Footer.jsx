import { useState } from 'react'
import { navLinks } from '../data/studioData'
import LensMark from './LensMark'
import Reveal from './Reveal'
import { gutter } from './Section'
import SpinningBadge, { BadgeArrow } from './SpinningBadge'


// Footer links: the arrow slides in from the left on hover.
function FooterLink({ href, children }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-3 font-display text-xl text-cream/90 transition hover:text-gold sm:text-2xl"
    >
      <span
        aria-hidden="true"
        className="-ml-7 text-lg opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100 motion-reduce:transition-none"
      >
        &rarr;
      </span>
      {children}
    </a>
  )
}

// `content` is the footer's editable text and photo strip (from /api/content).
// `studioEmail` is the studio's address (edited with the contact section).
export default function Footer({ content, studioEmail }) {
  const photos = content.photos

  // Controlled input: the email text lives in state, and the input just displays it.
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="relative overflow-hidden bg-night text-cream">
      {/* ---- 1. Photo marquee: edge to edge, gliding slowly, pauses while you hover ---- */}
      <a href="#gallery" aria-label="See the full gallery" className="group/marquee block border-t border-cream/10 py-10">
        {/* Two copies of the photos side by side; the marquee animation slides by exactly one copy.
            Each photo has a right margin (not a flex gap), so both copies are exactly the same width. */}
        <div className="flex w-max animate-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
          {[...photos, ...photos].map((src, index) => (
            <img
              key={index}
              src={src}
              alt=""
              loading="lazy"
              className="mr-3 h-44 w-36 rounded-xl object-cover opacity-60 grayscale-[50%] transition duration-500 hover:-translate-y-2 hover:opacity-100 hover:grayscale-0 sm:h-64 sm:w-52"
            />
          ))}
        </div>
      </a>

      <div className={gutter}>
        {/* ---- 2. Closing statement + the spinning button ---- */}
        <div className="flex flex-col gap-10 border-t border-cream/10 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
          <Reveal>
            <p className="mb-5 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.22em] text-gold">
              {content.eyebrow}
              <span aria-hidden="true" className="h-px w-10 bg-current opacity-60" />
            </p>
            {/* The size follows the screen width (vw), so "beautifully framed." stretches across
                most of the footer on any screen instead of stopping at a fixed size */}
            <h2 className="font-display text-[clamp(3rem,8vw,10rem)] font-medium leading-[0.95] tracking-tight">
              {content.title} <span className="block italic text-gold lg:whitespace-nowrap">{content.titleHighlight}</span>
            </h2>
          </Reveal>

          <Reveal delay={200} className="self-start lg:self-center">
            <SpinningBadge text="Book a session · " href="#contact" label="Book a session" id="footer-ring">
              <BadgeArrow />
            </SpinningBadge>
          </Reveal>
        </div>

        {/* ---- 3. The practical bits, in four light columns ---- */}
        <div className="grid gap-10 border-t border-cream/10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr] lg:gap-12">
          <div className="flex max-w-xs flex-col items-start gap-4">
            <a href="#top" className="group flex items-center gap-2.5 font-display text-3xl font-semibold">
              <LensMark className="size-8 text-gold" />
              <span>
                Lens <span className="text-gold">Theory</span>
              </span>
            </a>
            <p className="text-base text-cream/65 sm:text-lg">
              {content.blurb}
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="mb-5 font-body text-sm font-medium uppercase tracking-[0.18em] text-gold">Explore</h3>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-5 font-body text-sm font-medium uppercase tracking-[0.18em] text-gold">Get in touch</h3>
            <ul className="flex flex-col gap-2.5 text-cream/60">
              <li>
                <a
                  href={`mailto:${studioEmail}`}
                  className="break-words font-display text-lg text-cream/90 underline decoration-cream/25 underline-offset-[6px] transition hover:text-gold hover:decoration-gold sm:text-xl"
                >
                  {studioEmail}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter: just an underline and an arrow, nothing boxed in */}
          <div>
            <h3 className="mb-5 font-body text-sm font-medium uppercase tracking-[0.18em] text-gold">Stay in the frame</h3>
            <p className="mb-4 text-base text-cream/65 sm:text-lg">New work and the occasional offer. No spam, ever.</p>

            {subscribed ? (
              <p role="status" className="flex items-center gap-3 font-medium text-gold">
                <span className="flex size-8 animate-pop items-center justify-center rounded-full bg-gold text-night motion-reduce:animate-none">
                  &#10003;
                </span>
                You are on the list.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="group/news flex items-center border-b border-cream/30 transition focus-within:border-gold"
              >
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
                  className="min-w-0 flex-1 bg-transparent py-3 text-lg text-cream placeholder:text-cream/40 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-xl text-gold transition hover:translate-x-1 hover:text-cream"
                >
                  &rarr;
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ---- 4. Bottom line ---- */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-cream/10 py-8 text-base sm:flex-row">
          <p className="text-cream/50">&copy; {new Date().getFullYear()} Lens Theory. All rights reserved.</p>
          <a href="#top" className="group flex items-center gap-3 font-medium text-cream/80 transition hover:text-gold">
            Back to top
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full border border-cream/25 transition duration-300 group-hover:-translate-y-1 group-hover:border-gold group-hover:bg-gold group-hover:text-night"
            >
              &uarr;
            </span>
          </a>
        </div>
      </div>

      {/* 5. Giant wordmark, edge to edge, fading away towards the bottom (decorative) ----
          No <Reveal> here: it sits at the very bottom of the page, where the reveal would never trigger on phones. */}
      <div aria-hidden="true" className="-mb-[3.5vw] select-none overflow-hidden">
        <p className="whitespace-nowrap bg-linear-to-b from-cream/20 to-cream/0 bg-clip-text text-center font-display text-[17.5vw] font-medium leading-[0.85] tracking-tight text-transparent">
          Lens Theory
        </p>
      </div>
    </footer>
  )
}
