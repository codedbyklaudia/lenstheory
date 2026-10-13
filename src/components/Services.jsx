import { services } from '../data/studioData'
import BookingSteps from './BookingSteps'
import Section from './Section'
import SectionHeading from './SectionHeading'
import ServiceCard from './ServiceCard'

export default function Services({ onAddToBasket, onShowTerms, onEnquire }) {
  return (
    <Section id="services">
      <SectionHeading eyebrow="Services" number="03" title="Choose your session">
        Sessions are priced per hour. Pick how long you need and add it to your basket, or enquire for
        a custom quote.
      </SectionHeading>

      <div className="grid gap-8 md:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onAddToBasket={onAddToBasket}
            onShowTerms={onShowTerms}
            onEnquire={onEnquire}
          />
        ))}
      </div>

      <BookingSteps />
    </Section>
  )
}