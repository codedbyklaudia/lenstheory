import { services } from '../data/studioData'
import SectionHeading from './SectionHeading'
import ServiceCard from './ServiceCard'

export default function Services({ onAddToBasket, onShowTerms, onEnquire }) {
  return (
    <section id="services" className="bg-clay px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Services" title="Choose your session">
          Every shoot starts with a conversation about what you need the images to do.
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

        <p className="mt-10 text-center text-ink-soft">
          Not sure which session is right for you?{' '}
          <a
            href="#contact"
            className="font-medium text-ink underline decoration-ember underline-offset-4 hover:text-ember"
          >
            Tell us what you have in mind
          </a>{' '}
          and we will help you choose.
        </p>
      </div>
    </section>
  )
}