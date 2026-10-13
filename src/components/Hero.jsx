import { useEffect, useState } from 'react'
import { heroFacts, heroSlides, services } from '../data/studioData'
import Button from './Button'

const SLIDE_MS = 6000 // how long each photo stays on screen

// Cheapest bookable session, worked out from the data so it can never go out of date.
const startingPrice = Math.min(
  ...services.filter((service) => service.bookable).map((service) => service.pricePerHour),
)

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

export default function Hero() {
  // STATE 1: which photo is showing (an index into heroSlides).
  const [activeSlide, setActiveSlide] = useState(0)
  // STATE 2: is the slideshow playing? Starts paused for people who prefer reduced motion.
  const [isPlaying, setIsPlaying] = useState(() => !prefersReducedMotion())

  // EFFECT: while playing, move to the next photo every SLIDE_MS.
  // `activeSlide` is in the dependency list, so clicking a dot restarts the timer
  // instead of jumping on again a moment later. The returned function clears the timer.
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, SLIDE_MS)

    return () => clearInterval(timer)
  }, [isPlaying, activeSlide])

  const current = heroSlides[activeSlide]

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col overflow-hidden text-cream"
    >
      {/* Background photos. All are stacked; only the active one is visible (opacity 100). */}
      {heroSlides.map((slide, index) => {
        const isActive = index === activeSlide
        return (
          <img
            key={slide.id}
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
      <div className="absolute inset-0 -z-10 bg-ink/55" />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-ink/60 via-transparent to-ink/75" />

      {/* Main message */}
      <div className="flex flex-1 items-center px-5 pb-10 pt-32 sm:px-8">
        <div className="mx-auto w-full max-w-6xl animate-fade-up text-center motion-reduce:animate-none">
          <p className="mb-6 inline-flex items-center gap-3 rounded-full border border-cream/25 bg-ink/25 px-5 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cream backdrop-blur-sm sm:text-sm">
            <span aria-hidden="true" className="text-gold">
              &#10022;
            </span>
            Photography studio
          </p>

          <h1
            id="hero-title"
            className="mx-auto max-w-[16ch] text-balance font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl"
          >
            Portraits that feel <span className="italic text-gold">like you.</span>
          </h1>

          <p className="mx-auto my-8 max-w-xl text-lg text-cream/90 sm:text-xl">
            Portraits, weddings and family stories shaped by a clear point of view. Thoughtful light,
            honest moments, and photographs made to last.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button href="#gallery" variant="light">
              View the gallery
            </Button>
            <Button href="#contact" variant="ghostLight">
              Book a session
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom bar: slideshow controls on the left, quick facts on the right */}
      <div className="px-5 pb-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-cream/20 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <div role="group" aria-label="Choose a hero photo" className="flex items-center gap-1.5">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show ${slide.label} photo`}
                  aria-current={index === activeSlide}
                  className="group flex h-7 items-center"
                >
                  <span
                    className={`block h-1 rounded-full transition-all duration-300 ${
                      index === activeSlide ? 'w-10 bg-gold' : 'w-5 bg-cream/40 group-hover:bg-cream/70'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-xs uppercase tracking-[0.18em] text-cream/85">
              <span className="tabular-nums">
                {String(activeSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
              </span>
              <span className="mx-2 text-gold" aria-hidden="true">
                &middot;
              </span>
              {current.label}
            </p>

            <button
              type="button"
              onClick={() => setIsPlaying((playing) => !playing)}
              aria-label={isPlaying ? 'Pause photo slideshow' : 'Play photo slideshow'}
              className="rounded-full border border-cream/30 px-3 py-1 text-xs uppercase tracking-[0.15em] text-cream/85 transition hover:border-gold hover:text-gold"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>

          <ul className="hidden flex-wrap items-center gap-x-6 gap-y-1 text-sm text-cream/85 sm:flex">
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="text-gold">
                &#10022;
              </span>
              Sessions from £{startingPrice}/hour
            </li>
            {heroFacts.map((fact) => (
              <li key={fact} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-gold">
                  &#10022;
                </span>
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}