import { useState } from 'react'
import Button from './Button'
import Doodle from './Doodle'
import HoursStepper from './HoursStepper'

// `number` is the card's position (1, 2, 3), shown as a small "01" tag on the photo.
export default function ServiceCard({ service, number, onAddToBasket, onShowTerms, onEnquire }) {
  // STATE: how many hours this card's stepper is set to.
  // Every card has its OWN copy of this state, because each card is its own component instance.
  const [hours, setHours] = useState(1)

  function handleAdd() {
    onAddToBasket(service, hours) // tell the parent (App) what to put in the basket
    setHours(1) // reset this card's stepper
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream transition duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative overflow-hidden">
        <img
          src={service.image}
          alt={service.alt}
          loading="lazy"
          className="aspect-[5/4] w-full object-cover object-[center_25%] transition duration-1000 group-hover:scale-110"
        />
        <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 font-display text-lg italic text-ember backdrop-blur-sm">
          0{number}
        </span>
        {!service.bookable && (
          <span className="absolute right-4 top-4 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-cream backdrop-blur-sm">
            Enquire only
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-start gap-4 p-6 xl:p-8">
        <h3 className="font-display text-3xl text-ink transition duration-300 group-hover:text-ember">{service.name}</h3>
        <p className="text-ink-soft">{service.description}</p>

        <ul className="flex flex-col gap-2 text-sm text-ink-soft">
          {service.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5">
              <Doodle name="sparkle" className="size-3.5 shrink-0 text-ember" />
              {feature}
            </li>
          ))}
        </ul>

        {service.terms && (
          <button
            type="button"
            onClick={() => onShowTerms(service)}
            className="font-medium text-ember underline underline-offset-4 transition hover:text-ink"
          >
            View more details &rarr;
          </button>
        )}

        <div className="mt-auto flex w-full flex-col gap-4 border-t border-line pt-4">
          {service.bookable ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col leading-tight">
                  <span className="text-xs uppercase tracking-[0.12em] text-ink-soft">Per hour</span>
                  <strong className="font-display text-2xl font-medium text-ink">£{service.pricePerHour}</strong>
                </div>

                {/* Controlled component: this card owns `hours`, the stepper just displays it */}
                <HoursStepper value={hours} onChange={setHours} label={service.name} />
              </div>

              <Button onClick={handleAdd} className="w-full">
                Add to basket &middot; £{service.pricePerHour * hours}
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col leading-tight">
                <span className="text-xs uppercase tracking-[0.12em] text-ink-soft">Pricing</span>
                <strong className="font-display text-2xl font-medium text-ink">Custom quote</strong>
              </div>

              <Button href="#contact" onClick={() => onEnquire(service.enquiryType)}>
                Enquire
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}