// A round badge whose words circle slowly around a centre (the eye-catcher used across the site).
//   <SpinningBadge text="Book a session · " href="#contact" label="Book a session" id="footer-ring">…</SpinningBadge>
// The text follows an SVG circle (textPath) and the whole ring spins; the centre stays still.
// With `href` it is a link; without, it is just decoration.
// `repeat`: how many times the text goes round the ring (use 1 for long phrases).
// `className` sets size AND position (default: relative), e.g. 'absolute -top-10 size-40'.

// Length of the circle the text sits on (2 × π × radius 78), so the text exactly fills one lap.
const RING_LENGTH = 488

export default function SpinningBadge({
  text,
  repeat = 2,
  href,
  label,
  id,
  className = 'relative size-36 sm:size-44',
  ringClassName = 'text-gold',
  children,
}) {
  const Tag = href ? 'a' : 'div'

  return (
    <Tag
      href={href}
      aria-label={href ? label : undefined}
      aria-hidden={href ? undefined : 'true'}
      className={`group flex shrink-0 items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className={`absolute inset-0 size-full animate-slow-spin motion-reduce:animate-none ${ringClassName}`}
      >
        <defs>
          {/* every badge needs its own path id, otherwise they would share one circle */}
          <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text fill="currentColor" className="font-body text-[16px] font-medium uppercase">
          {/* textLength stretches/squeezes the spacing so any text fills the ring exactly once */}
          <textPath href={`#${id}`} textLength={RING_LENGTH} lengthAdjust="spacing">
            {text.repeat(repeat)}
          </textPath>
        </text>
      </svg>

      {children}
    </Tag>
  )
}

// The usual centre: a gold disc with an arrow that grows and tilts on hover.
// `className` sets the disc's size (smaller badges want a smaller disc).
export function BadgeArrow({ direction = 'right', className = 'size-16 sm:size-20' }) {
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-gold text-night transition duration-500 group-hover:scale-125 group-hover:bg-cream ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`size-6 transition duration-500 sm:size-7 ${
          direction === 'down' ? 'rotate-90 group-hover:translate-y-1' : 'group-hover:-rotate-45'
        }`}
      >
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </span>
  )
}
