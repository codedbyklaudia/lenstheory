import { faqs } from '../data/studioData'
import Button from './Button'
import SectionHeading from './SectionHeading'

// Uses the browser's built-in <details> element, so there is no JavaScript to write for opening and closing.
export default function Faq() {
  return (
    <section id="faq" className="bg-tint px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div className="flex flex-col items-start">
          <SectionHeading eyebrow="FAQ" title="Good to know before you book">
            Can't find what you are looking for? Send us a message and we will happily help.
          </SectionHeading>
          <Button href="#contact" variant="ghost">
            Ask a question
          </Button>
        </div>

        <div>
          {faqs.map((item, index) => (
            <details key={item.question} open={index === 0} className="group border-t border-ink/20 last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg text-ink transition hover:text-ember [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden="true" className="shrink-0 text-3xl leading-none text-ember transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 pr-10 text-ink-soft">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}