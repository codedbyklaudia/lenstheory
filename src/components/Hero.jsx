import Button from './Button'

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh items-center overflow-hidden px-5 pb-24 pt-36 text-cream sm:px-8"
    >
      {/* Full-bleed background photo + two dark layers so the text stays readable */}
      <img
        src="/images/studio-1.avif"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full animate-hero-zoom object-cover object-[center_30%] motion-reduce:animate-none"
      />
      <div className="absolute inset-0 -z-10 bg-ink/55" />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-ink/60 via-transparent to-ink/70" />

      <div className="mx-auto w-full max-w-6xl animate-fade-up text-center motion-reduce:animate-none">
        <p className="mb-4 inline-flex items-center gap-4 text-xs font-medium uppercase tracking-[0.2em] text-gold before:h-px before:w-6 before:bg-gold after:h-px after:w-6 after:bg-gold sm:text-sm sm:before:w-10 sm:after:w-10">
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

      <a
        href="#gallery"
        aria-label="Scroll to the gallery"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[0.2em] text-cream/85 md:flex"
      >
        Scroll
        <span className="h-10 w-px bg-gold" />
      </a>
    </section>
  )
}