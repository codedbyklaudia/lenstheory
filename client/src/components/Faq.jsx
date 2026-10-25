// `faqs` is a list of { question, answer } (from /api/content, set in the admin dashboard).
export default function FaqList({ faqs }) {
  return (
    <div>
      {faqs.map((item, index) => (
        <details key={index} open={index === 0} className="group border-t border-cream/20 last:border-b">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg text-cream transition hover:translate-x-1 hover:text-gold motion-reduce:hover:translate-x-0 [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/40 text-2xl leading-none text-gold transition duration-300 group-open:rotate-45 group-open:bg-gold group-open:text-night"
            >
              +
            </span>
          </summary>
          {/* The answer is only shown while open, so this animation plays every time it opens */}
          <p className="animate-menu-in pb-4 pr-10 text-cream/75 motion-reduce:animate-none">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}