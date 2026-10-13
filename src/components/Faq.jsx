import { faqs } from '../data/studioData'

export default function FaqList() {
  return (
    <div>
      {faqs.map((item, index) => (
        <details key={item.question} open={index === 0} className="group border-t border-cream/20 last:border-b">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg text-cream transition hover:text-gold [&::-webkit-details-marker]:hidden">
            {item.question}
            <span aria-hidden="true" className="shrink-0 text-3xl leading-none text-gold transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-4 pr-10 text-cream/75">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}