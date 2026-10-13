import { processSteps } from '../data/studioData'

// "How booking works": three steps shown right under the services, because that is where people decide.
export default function BookingSteps() {
  return (
    <div className="mt-16 border-t border-ink/15 pt-12">
      <h3 className="mb-8 font-display text-2xl text-ink sm:text-3xl">How booking works</h3>

      <ol className="grid gap-8 md:grid-cols-3">
        {processSteps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-ember font-display text-xl italic text-ember"
            >
              0{index + 1}
            </span>
            <div>
              <h4 className="font-display text-xl text-ink">{step.title}</h4>
              <p className="mt-1 text-pretty text-ink-soft">{step.text}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.12em] text-ember">{step.meta}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}