import { processSteps } from '../data/studioData'
import Button from './Button'
import SectionHeading from './SectionHeading'

export default function Process() {
  return (
    <section id="process" className="bg-ink px-5 py-16 text-cream sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="How it works" title="From first hello to final gallery" center dark>
          Three simple steps, and we guide you through every one.
        </SectionHeading>

        <ol className="grid gap-6 md:grid-cols-3">
          {processSteps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-2 rounded-xl border border-cream/15 bg-cream/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/60"
            >
              <span
                aria-hidden="true"
                className="mb-3 flex size-13 items-center justify-center rounded-full border border-gold font-display text-xl italic text-gold"
              >
                0{index + 1}
              </span>
              <h3 className="font-display text-2xl text-cream">{step.title}</h3>
              <p className="text-pretty text-cream/80">{step.text}</p>
              <span className="mt-auto pt-4 text-xs uppercase tracking-[0.12em] text-gold">
                {step.meta}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <Button href="#contact" variant="light">
            Start your enquiry
          </Button>
        </div>
      </div>
    </section>
  )
}