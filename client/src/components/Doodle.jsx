// Hand-drawn style illustrations that give the site its playful side.
//   <Doodle name="camera" className="size-16 animate-float text-gold" />
// They are drawn with `currentColor`, so a text-* class sets their colour, and they are purely
// decorative (aria-hidden), so screen readers skip them.

const doodles = {
  // little four-pointed star
  sparkle: {
    viewBox: '0 0 24 24',
    filled: true,
    paths: ['M12 1.5c.9 6.3 4.2 9.6 10.5 10.5-6.3.9-9.6 4.2-10.5 10.5C11.1 16.2 7.8 12.9 1.5 12 7.8 11.1 11.1 7.8 12 1.5Z'],
  },
  camera: {
    viewBox: '0 0 64 64',
    paths: [
      'M9 23h9l4.5-6.5h19L46 23h9a4 4 0 0 1 4 4v22.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V27a4 4 0 0 1 4-4Z',
      'M32 47a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
      'M32 41.5a4.5 4.5 0 1 0 0-9',
      'M49 30h4',
      // flash "pop" lines
      'M52 13l2.5-5M57.5 17l5-2M47 11.5V5.5',
    ],
  },
  heart: {
    viewBox: '0 0 64 64',
    paths: [
      'M32 53C12 41 5 28.5 11.5 18.5c6-9 16-7.5 20.5 1.5 4.5-9 14.5-10.5 20.5-1.5C59 28.5 52 41 32 53Z',
      'M50 8l-2 5M57 13l-5 2M44 6.5l.5 5',
    ],
  },
  sun: {
    viewBox: '0 0 64 64',
    paths: [
      'M32 43a11 11 0 1 0 0-22 11 11 0 0 0 0 22Z',
      'M32 5v8M32 51v8M5 32h8M51 32h8M13 13l5.5 5.5M45.5 45.5 51 51M13 51l5.5-5.5M45.5 18.5 51 13',
    ],
  },
  polaroid: {
    viewBox: '0 0 64 64',
    paths: [
      'M11 7.5 54 5l3 51.5-43 2.5Z',
      'M16.5 13 49 11l1.8 31.5-32.5 2Z',
      // a little mountain and sun inside the photo
      'M19 41l9-11 6 7 4-4.5 11 9.5',
      'M42 20.5a3 3 0 1 0 0 .1',
    ],
  },
  // a strip of film with two frames and the sprocket holes
  film: {
    viewBox: '0 0 64 64',
    paths: [
      'M5 17.5 59 15l1.5 31-54 2.5Z',
      'M17 25.5l13-.5.6 14-13 .5ZM35 24.6l13-.6.6 14-13 .6Z',
      'M10 20.5h3M20 20h3M30 19.5h3M40 19h3M50 18.5h3',
      'M11 44.5h3M21 44h3M31 43.5h3M41 43h3M51 42.5h3',
    ],
  },
  flower: {
    viewBox: '0 0 64 64',
    paths: [
      'M32 33a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
      'M32 23c-5-9-1-16 0-16s5 7 0 16ZM37 27c8-5 15-2 15-1s-6 6-15 1ZM35 33c6 7 5 14 4 14s-7-4-4-14ZM29 33c-3 10-9 14-10 14s-2-7 10-14ZM27 27c-9 4-15 0-15-1s7-5 15 1Z',
      'M32 38c0 8 1 13 0 21M32 52c4-5 9-6 12-5-1 4-6 7-12 5',
    ],
  },
  // a lightning bolt, like a camera flash
  flash: {
    viewBox: '0 0 64 64',
    paths: ['M37 5 15 35h15l-5 24 25-33H35Z'],
  },
  cloud: {
    viewBox: '0 0 64 64',
    paths: ['M17 46h31a10 10 0 0 0 1-20 15 15 0 0 0-28-3 11.5 11.5 0 0 0-4 23Z'],
  },
  // a calendar page with a little heart on it
  calendar: {
    viewBox: '0 0 64 64',
    paths: [
      'M9 14.5 55 13l1 41-46 1.5Z',
      'M9.5 25 55.5 24',
      'M21 8v11M43 7.5v11',
      'M32.5 48c-7-4.5-10-8-8-11.5 1.6-2.7 5.5-2.3 8 1 2.3-3.5 6.3-4 8-1.2 2.2 3.5-1 7.2-8 11.7Z',
    ],
  },
  star: {
    viewBox: '0 0 64 64',
    paths: ['M32 6l7.5 16.5L57 24.5 44 36.5l3.5 18L32 45.5 16.5 54.5 20 36.5 7 24.5l17.5-2Z'],
  },
  arrow: {
    viewBox: '0 0 120 60',
    paths: [
      'M5 42C22 12 48 10 54 29c5 17-17 21-14 6 3.5-17 36-21 70-10',
      'M99 15.5l11 9.5-13 5',
    ],
  },
}

// `style` is optional, e.g. for CSS variables that steer an animation (the contact form's confetti).
export default function Doodle({ name, className = '', style }) {
  const doodle = doodles[name]

  return (
    <svg
      viewBox={doodle.viewBox}
      fill={doodle.filled ? 'currentColor' : 'none'}
      stroke={doodle.filled ? 'none' : 'currentColor'}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
      className={`pointer-events-none motion-reduce:animate-none ${className}`}
    >
      {doodle.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

// A hand-drawn underline that draws itself from left to right.
// Put it inside a `relative` element (e.g. the span around a word) and it sits just below the text.
export function Squiggle({ className = '', delay = 0 }) {
  return (
    <svg
      viewBox="0 0 200 20"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.18em] w-full ${className}`}
    >
      <path
        d="M4 13C30 4 52 4 72 11s42 9 62 0 44-8 62-1"
        pathLength="1"
        strokeDasharray="1"
        style={{ animationDelay: `${delay}ms` }}
        className="animate-draw motion-reduce:animate-none"
      />
    </svg>
  )
}
