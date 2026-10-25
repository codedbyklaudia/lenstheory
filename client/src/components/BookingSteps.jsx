import Doodle from './Doodle'
import Reveal from './Reveal'

// "How booking works": three steps shown right under the services, because that is where people decide.
// Big outlined numbers, and on wide screens a curly arrow doodle leads from one step to the next.
export default function BookingSteps({ title, titleHighlight, steps }) {
  return (
    <div className="mt-24 border-t border-ink/15 pt-14">
      <h3 className="mb-12 text-center font-display text-3xl text-ink sm:text-4xl lg:text-5xl">
        {title} <em className="italic text-ember">{titleHighlight}</em>
      </h3>

      {/* Everything is centred: the heading, and each step's number and text within its column */}
      <ol className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3 md:gap-10 xl:gap-20">
        {steps.map((step, index) => (
          <Reveal as="li" key={index} delay={index * 150} className="group relative flex flex-col items-center text-center">
            {/* The number is drawn as an outline (transparent fill + text stroke) and fills in on hover */}
            <span
              aria-hidden="true"
              className="block font-display text-8xl font-medium italic leading-none text-transparent transition duration-500 [-webkit-text-stroke:1.5px_var(--color-ember)] group-hover:text-ember"
            >
              0{index + 1}
            </span>

            <h4 className="mt-6 font-display text-2xl text-ink">{step.title}</h4>
            <p className="mt-2 max-w-sm text-pretty text-ink-soft">{step.text}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-ember">{step.meta}</p>

            {index < steps.length - 1 && (
              <Doodle
                name="arrow"
                className="absolute -right-14 top-6 hidden h-12 w-24 animate-float text-ember/60 md:block xl:-right-20 xl:w-28"
              />
            )}
          </Reveal>
        ))}
      </ol>
    </div>
  )
}
