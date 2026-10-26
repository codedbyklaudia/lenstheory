// The basket icon with a count badge. Used in the header and as a floating button.
// The badge is placed `absolute`, so the button needs a position: pass `relative` (header) or
// `fixed` (floating) in className. It is NOT built in here, because an element with both
// `relative` and `fixed` gets whichever comes later in Tailwind's CSS (relative), and the
// floating button would then sit at the very bottom of the page instead of floating.
export default function BasketButton({ count, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={count > 0 ? `Open basket, ${count} ${count === 1 ? 'hour' : 'hours'} booked` : 'Open basket'}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M5 8h14l-1 12H6L5 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>

      {count > 0 && (
        <span className="absolute -right-1.5 -top-1 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-gold px-1 text-[0.7rem] font-bold leading-none text-ink">
          {count}
        </span>
      )}
    </button>
  )
}