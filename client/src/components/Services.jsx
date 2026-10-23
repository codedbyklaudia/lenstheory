import BookingSteps from './BookingSteps'
import Reveal from './Reveal'
import Section from './Section'
import SectionHeading from './SectionHeading'
import ServiceCard from './ServiceCard'

// `services` comes from App, which fetched it from GET /api/services.
export default function Services({ services, error, onAddToBasket, onShowTerms, onEnquire }) {
  return (
    <Section id="services">
      <SectionHeading
        eyebrow="Services"
        number="03"
        title={
          <>
            Choose your <em>session</em>
          </>
        }
        doodle="sun"
      >
        Sessions are priced per hour. Pick how long you need and add it to your basket, or enquire for
        a custom quote.
      </SectionHeading>

      {error && <p className="mb-6 text-ink-soft">Sorry, the services could not be loaded ({error}).</p>}

      <div className="grid gap-6 md:grid-cols-3 xl:gap-10">
        {/* The cards rise in one after another (each one 150ms after the previous) */}
        {services.map((service, index) => (
          <Reveal key={service.id} delay={index * 150} className="flex *:w-full">
            <ServiceCard
              service={service}
              number={index + 1}
              onAddToBasket={onAddToBasket}
              onShowTerms={onShowTerms}
              onEnquire={onEnquire}
            />
          </Reveal>
        ))}
      </div>

      <BookingSteps />
    </Section>
  )
}