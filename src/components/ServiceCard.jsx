import { useState } from 'react'
import Button from './Button'
import HoursStepper from './HoursStepper'

export default function ServiceCard({ service, onAddToBasket, onShowTerms, onEnquire }) {
  // STATE: how many hours this card's stepper is set to.
  // Every card has its OWN copy of this state, because each card is its own component instance.
  const [hours, setHours] = useState(1)

  function handleAdd() {
    onAddToBasket(service, hours) // tell the parent (App) what to put in the basket
    setHours(1) // reset this card's stepper
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-cream transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <div className="overflow-hidden">
        <img
          src={service.image}
          alt={service.alt}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover object-[center_25%] transition duration-700 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col items-start gap-4 p-6">
        <h3 className="font-display text-2xl text-ink">{service.name}</h3>
        <p className="text-ink-soft">{service.description}</p>

        <ul className="flex flex-col gap-2 text-sm text-ink-soft">
          {service.features.map((feature) => (
            <li key={feature} className="flex gap-2.5">
              <span aria-hidden="true" className="font-bold text-ember">
                &#10003;
              </span>
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