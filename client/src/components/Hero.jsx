import { useEffect, useState } from 'react'
import Button from './Button'
import Doodle, { Squiggle } from './Doodle'
import Reveal from './Reveal'
import { gutter } from './Section'
import SpinningBadge, { BadgeArrow } from './SpinningBadge'

const SLIDE_MS = 6000 // how long each photo stays on screen

// Delay for the n-th piece of the hero's entrance animation.
const stagger = (step) => ({ animationDelay: `${step * 150}ms` })

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

// The two hero buttons (rendered in one place on big screens and another on phones).
function HeroButtons() {
  return (
    <>
      <Button href="#gallery" variant="light">
        View the gallery
      </Button>
      <Button href="#contact" variant="ghostLight">
        Book a session
      </Button>
    </>
  )
}

// `content` is the hero's editable text and slideshow photos (from /api/content, set in the admin dashboard).
export default function Hero({ content }) {
  const { slides } = content

  // STATE: which photo is showing (an index into slides).
  const [activeSlide, setActiveSlide] = useState(0)

  // EFFECT: move to the next photo every SLIDE_MS. People who prefer reduced motion
  // just keep the first photo. The returned function clears the timer.
  useEffect(() => {
    if (prefersReducedMotion() || slides.length < 2) return

    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, SLIDE_MS)

    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col overflow-hidden text-cream"
    >
      {/* Background photos. All are stacked; only the active one is visible (opacity 100). */}
      {slides.map((slide, index) => {
        const isActive = index === activeSlide
        return (
          <img
            key={index}
            src={slide.src}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            style={{ objectPosition: slide.position }}
            className={`absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-1000 motion-reduce:transition-none ${
              isActive ? 'animate-hero-zoom opacity-100 motion-reduce:animate-none' : 'opacity-0'
            }`}
          />
        )
      })}
      {/* Darker on the left (behind the big text) and at the bottom */}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink/85 via-ink/45 to-ink/25" />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-ink/50 via-transparent to-ink/80" />

      {/* Main message: big, left-aligned, across the full width (same style as the footer).
          Left column: the title (slides in from the LEFT) with the buttons right under it.
          Right column: the subtitle (slides in from the RIGHT) above the spinning badge. */}
      <div className={`relative flex flex-1 items-end pb-16 pt-36 ${gutter}`}>
        <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <Reveal
              as="h1"
              id="hero-title"
              from="left"
              delay={150}
              className="relative max-w-[11ch] font-display text-[3.4rem] font-medium leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl xl:text-[9rem]"
            >
              {/* camera doodle bobbing just above the start of the title */}
              <Doodle name="camera" className="absolute -top-20 left-1 hidden size-16 animate-float text-gold/80 lg:block" />
              {content.title}{' '}
              <span className="relative inline-block italic text-gold">
                {content.titleHighlight}
                {/* hand-drawn underline that draws itself once the headline has arrived */}
                <Squiggle delay={1100} className="text-gold" />
                {/* two little sparkles twinkling at the end of the line */}
                <Doodle name="sparkle" className="absolute -right-8 -top-4 size-7 animate-twinkle text-gold sm:-right-12 sm:size-10" />
                <Doodle
                  name="sparkle"
                  className="absolute -right-14 top-6 size-4 animate-twinkle text-cream [animation-delay:1.3s] sm:-right-20 sm:size-5"
                />
              </span>
            </Reveal>

            {/* Buttons under the title on big screens (on phones they come after the subtitle, below) */}
            <div
              style={stagger(5)}
              className="mt-8 hidden animate-fade-up flex-col gap-4 motion-reduce:animate-none sm:flex-row lg:mt-10 lg:flex"
            >
              <HeroButtons />
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:items-end">
            <Reveal
              as="p"
              from="right"
              delay={450}
              className="max-w-lg text-pretty text-xl text-cream/85 sm:text-2xl lg:text-right"
            >
              {content.subtitle}
            </Reveal>

            <div style={stagger(5)} className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none sm:flex-row lg:hidden">
              <HeroButtons />
            </div>
          </div>
        </div>

        {/* "Scroll to explore": a small spinning badge at the bottom centre, between the buttons and the subtitle */}
        <div style={stagger(6)} className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 animate-fade-in motion-reduce:animate-none lg:block">
          <SpinningBadge
            text="Scroll to explore · "
            href="#gallery"
            label="Scroll to the gallery"
            id="hero-ring"
            className="relative size-28 xl:size-32"
          >
            <BadgeArrow direction="down" className="size-12 xl:size-14" />
          </SpinningBadge>
        </div>
      </div>
    </section>
  )
}