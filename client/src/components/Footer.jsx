import { useState } from 'react'
import { navLinks } from '../data/studioData'
import Doodle from './Doodle'
import { SnappyLine } from './Illustrations'
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

// A column heading with a little doodle in front, which wiggles while you hover the column.
function ColumnHeading({ doodle, children }) {
  return (
    <h3 className="mb-5 flex items-center gap-2 font-body text-sm font-medium uppercase tracking-[0.18em] text-gold">
      <Doodle name={doodle} className="size-5 transition duration-300 group-hover/col:-rotate-12 group-hover/col:scale-125" />
      {children}
    </h3>
  )
}

// The film's sprocket holes: a row of small cream rectangles, made with a repeating gradient.
const sprocketHoles = {
  backgroundImage: 'linear-gradient(90deg, var(--color-cream) 0 10px, transparent 10px)',
  backgroundSize: '22px 100%',
  backgroundPosition: '6px 0',
}

// One frame of the film strip: holes, the photo, a frame number like on real film, holes again.
function FilmFrame({ src, number }) {
  return (
    <div className="flex shrink-0 flex-col gap-2 bg-ink px-2 py-2.5">
      <div aria-hidden="true" className="h-2.5 opacity-25" style={sprocketHoles} />
      <img
        src={src}
        alt=""
        loading="lazy"
        className="h-40 w-32 rounded-sm object-cover opacity-70 grayscale-[40%] transition duration-500 hover:scale-105 hover:opacity-100 hover:grayscale-0 sm:h-56 sm:w-44"
      />
      <div className="flex items-center justify-between px-1 font-body text-[0.6rem] tracking-[0.2em] text-gold/70">
        <span>&#9656; {number}A</span>
        <span>LT 400</span>
      </div>
      <div aria-hidden="true" className="h-2.5 opacity-25" style={sprocketHoles} />
    </div>
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
      {/* Doodles scattered over the footer background (decoration) */}
      <Doodle name="sparkle" className="absolute right-[8%] top-[30rem] size-6 animate-twinkle text-gold/60" />
      <Doodle name="flower" className="absolute left-[46%] top-[34rem] hidden size-14 animate-wiggle text-gold/15 lg:block" />
      <Doodle name="star" className="absolute bottom-[20vw] right-[4%] size-8 animate-twinkle text-gold/30 [animation-delay:1.2s]" />

      {/* ---- 1. A roll of film gliding past, slightly tilted, pausing while you hover ---- */}
      <a href="#gallery" aria-label="See the full gallery" className="group/marquee -mx-4 block -rotate-1 py-12">
        {/* Two copies of the frames side by side; the marquee animation slides by exactly one copy.
            The frames touch (no gap), so the film looks like one continuous strip. */}
        <div className="flex w-max animate-marquee shadow-2xl group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
          {[...photos, ...photos].map((src, index) => (
            <FilmFrame key={index} src={src} number={(index % photos.length) + 1} />
          ))}
        </div>
      </a>

      <div className={gutter}>
        {/* ---- 2. Closing statement, Snappy waving goodbye, and the spinning button ---- */}
        <div className="flex flex-col gap-10 border-t border-cream/10 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
          <Reveal>
            {/* The size follows the screen width (vw), so the second line stretches across
                most of the footer on any screen instead of stopping at a fixed size */}
            <h2 className="font-display text-[clamp(3rem,8vw,10rem)] font-medium leading-[0.95] tracking-tight">
              {content.title} <span className="block italic text-gold lg:whitespace-nowrap">{content.titleHighlight}</span>
            </h2>
          </Reveal>

          <Reveal delay={200} className="flex items-end gap-6 self-start lg:self-center">
            {/* Snappy, drawn in gold lines, prints little polaroids and says bye.
                The outlined speech bubble changes its mind when you hover. */}
            <div className="group/snappy relative hidden pt-14 md:block">
              <p
                aria-hidden="true"
                className="absolute left-1/2 top-0 -translate-x-1/2 -rotate-3 whitespace-nowrap rounded-2xl border-2 border-gold/70 px-4 py-1.5 font-display text-lg italic text-gold transition group-hover/snappy:rotate-3"
              >
                <span className="group-hover/snappy:hidden">See you soon!</span>
                <span className="hidden group-hover/snappy:inline">Wait, one more shot!</span>
              </p>
              <SnappyLine className="w-36 text-gold transition duration-300 group-hover/snappy:-rotate-6 xl:w-44" />
            </div>
            <SpinningBadge text="Book a session · " href="#contact" label="Book a session" id="footer-ring">
              <BadgeArrow />
            </SpinningBadge>
          </Reveal>
        </div>

        {/* ---- 3. The practical bits, in four light columns ---- */}
        <div className="grid gap-10 border-t border-cream/10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr] lg:gap-12">
          <div className="flex max-w-xs flex-col items-start gap-4">
            <a href="#top" className="group flex items-center gap-2.5 font-display text-3xl font-semibold">
              <LensMark className="size-8 text-gold transition duration-700 group-hover:rotate-180" />
              <span>
                Lens <span className="text-gold">Theory</span>
              </span>
            </a>
            <p className="text-base text-cream/65 sm:text-lg">{content.blurb}</p>
          </div>

          <nav aria-label="Footer navigation" className="group/col">
            <ColumnHeading doodle="camera">Explore</ColumnHeading>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="group/col">
            <ColumnHeading doodle="heart">Get in touch</ColumnHeading>
            <a
              href={`mailto:${studioEmail}`}
              className="break-words font-display text-lg text-cream/90 underline decoration-cream/25 underline-offset-[6px] transition hover:text-gold hover:decoration-gold sm:text-xl"
            >
              {studioEmail}
            </a>
            {/* A little "postage stamp", for fun */}
            <p className="mt-5 inline-flex -rotate-3 items-center gap-2 rounded-md border-2 border-dashed border-gold/40 px-3 py-2 text-sm text-gold transition duration-300 hover:rotate-2">
              <Doodle name="flower" className="size-5" />
              We love a chatty inbox
            </p>
          </div>

          {/* Newsletter: just an underline and an arrow, nothing boxed in */}
          <div className="group/col">
            <ColumnHeading doodle="film">Join the film club</ColumnHeading>
            <p className="mb-4 text-base text-cream/65 sm:text-lg">New work, behind-the-scenes and the odd offer. No spam, pinky promise.</p>

            {subscribed ? (
              <p role="status" className="relative flex items-center gap-3 font-medium text-gold">
                <span className="flex size-9 animate-pop items-center justify-center rounded-full bg-gold text-night motion-reduce:animate-none">
                  &#10003;
                </span>
                You&rsquo;re in the frame!
                {/* a little burst of sparkles */}
                <Doodle name="sparkle" className="absolute -top-4 left-6 size-4 animate-pop text-gold [animation-delay:0.15s]" />
                <Doodle name="sparkle" className="absolute -bottom-3 left-1 size-3 animate-pop text-cream [animation-delay:0.3s]" />
                <Doodle name="star" className="absolute -top-3 left-48 size-5 animate-pop text-gold [animation-delay:0.45s]" />
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
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-xl text-gold transition hover:translate-x-1 hover:bg-gold hover:text-night"
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

      {/* ---- 5. Giant wordmark, edge to edge, fading away towards the bottom (decorative) ----
          No <Reveal> here: it sits at the very bottom of the page, where the reveal would never trigger on phones. */}
      <div aria-hidden="true" className="-mb-[3.5vw] select-none overflow-hidden">
        <p className="whitespace-nowrap bg-linear-to-b from-cream/20 to-cream/0 bg-clip-text text-center font-display text-[17.5vw] font-medium leading-[0.85] tracking-tight text-transparent">
          Lens Theory
        </p>
      </div>
    </footer>
  )
}
