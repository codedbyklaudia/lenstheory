// Bigger illustrations (account page and footer), drawn as inline SVG so they use the site's colours
// (fill-cream, stroke-ink...) and scale to any size. All are decorative (aria-hidden).
// Animations stop for people who prefer reduced motion.

const line = 'stroke-ink [stroke-linecap:round] [stroke-linejoin:round]'

// "Snappy", the Lens Theory camera, waving hello. Used in the account welcome banner, the footer, and when
// there are no sessions yet.
export function CameraBuddy({ className = '' }) {
  return (
    <svg viewBox="0 0 200 170" aria-hidden="true" focusable="false" className={`overflow-visible ${className}`}>
      {/* shadow on the "floor" */}
      <ellipse cx="100" cy="162" rx="62" ry="6" className="fill-ink/15" />

      <g className="animate-float motion-reduce:animate-none">
        {/* waving arm (left) - it rotates around the shoulder */}
        <g className="origin-[32px_98px] animate-wiggle motion-reduce:animate-none">
          <path d="M32 98C18 92 10 78 14 64" fill="none" strokeWidth="5" className={line} />
          <circle cx="14" cy="58" r="8" strokeWidth="3.5" className={`fill-gold ${line}`} />
        </g>
        {/* resting arm (right) */}
        <path d="M168 104c14 4 20 16 14 26" fill="none" strokeWidth="5" className={line} />
        <circle cx="181" cy="134" r="8" strokeWidth="3.5" className={`fill-gold ${line}`} />

        {/* body, viewfinder bump, shutter button and flash */}
        <path d="M78 30h44l6 16H72Z" strokeWidth="3.5" className={`fill-clay ${line}`} />
        <rect x="30" y="44" width="140" height="100" rx="20" strokeWidth="3.5" className={`fill-cream ${line}`} />
        <rect x="42" y="34" width="22" height="12" rx="4" strokeWidth="3" className={`fill-ember ${line}`} />
        <rect x="134" y="56" width="22" height="13" rx="3" strokeWidth="3" className={`fill-gold ${line}`} />
        <path d="M162 40l7-9M170 52l10-3M154 34l2-10" fill="none" strokeWidth="3" className={`${line} stroke-ember`} />

        {/* cheeks */}
        <circle cx="54" cy="112" r="7" className="fill-gold/70" />
        <circle cx="146" cy="112" r="7" className="fill-gold/70" />

        {/* the lens is the face: eyes that blink, and a smile */}
        <circle cx="100" cy="98" r="36" strokeWidth="3.5" className={`fill-night ${line}`} />
        <circle cx="100" cy="98" r="26" className="fill-ink/40" />
        <g className="origin-[100px_92px] animate-blink motion-reduce:animate-none">
          <ellipse cx="89" cy="92" rx="4.5" ry="5.5" className="fill-cream" />
          <ellipse cx="111" cy="92" rx="4.5" ry="5.5" className="fill-cream" />
        </g>
        <path d="M88 106q12 11 24 0" fill="none" strokeWidth="3.5" className="stroke-cream [stroke-linecap:round]" />
        {/* shine on the lens */}
        <path d="M78 80q6-9 16-11" fill="none" strokeWidth="3.5" className="stroke-cream/60 [stroke-linecap:round]" />
      </g>
    </svg>
  )
}

// Snappy as a LINE drawing (only outlines, in the text colour), for dark backgrounds like the footer.
// Here Snappy is an instant camera: every few seconds a little polaroid with a heart slides out
// of the slot at the bottom, hangs there for a moment, then fades away.
// `fill` is the colour of the background behind it: the body is filled with it so the photo
// waiting inside is hidden, which keeps the drawing looking like pure line art.
// `mood` changes the face: 'happy', 'curious', 'love' (heart eyes), 'excited' or 'sleepy'.
// `printing` turns the polaroid animation on or off.
export function SnappyLine({ className = '', fill = 'fill-night', mood = 'happy', printing = true }) {
  const stroke = 'stroke-current [stroke-linecap:round] [stroke-linejoin:round]'
  const face = faces[mood] ?? faces.happy
  return (
    <svg viewBox="0 0 200 215" fill="none" aria-hidden="true" focusable="false" className={`overflow-visible ${className}`}>
      <g className="animate-float motion-reduce:animate-none">
        {/* the polaroid printing out (drawn first, so the camera body covers it while it is inside) */}
        <g className={printing ? 'animate-print motion-reduce:hidden' : 'hidden'}>
          <rect x="74" y="88" width="52" height="56" rx="3" strokeWidth="3" className={`${fill} ${stroke}`} />
          <rect x="81" y="95" width="38" height="32" rx="1.5" strokeWidth="2.5" className={stroke} />
          <path d="M100 120c-7-4.5-9.5-8.5-7.5-11.5 1.6-2.5 5-2 7.5 1 2.5-3 5.9-3.5 7.5-1 2 3-.5 7-7.5 11.5Z" strokeWidth="2.5" className={stroke} />
        </g>

        {/* waving arm (left), rotating at the shoulder */}
        <g className="origin-[32px_98px] animate-wiggle motion-reduce:animate-none">
          <path d="M32 98C18 92 10 78 14 64" strokeWidth="3.5" className={stroke} />
          <circle cx="14" cy="57" r="7" strokeWidth="3" className={stroke} />
        </g>
        {/* resting arm (right), giving a thumbs-up-ish wave */}
        <path d="M168 104c14 4 20 16 14 26" strokeWidth="3.5" className={stroke} />
        <circle cx="181" cy="134" r="7" strokeWidth="3" className={stroke} />

        {/* body (filled with the background colour), viewfinder, shutter button, flash */}
        <path d="M78 30h44l6 16H72Z" strokeWidth="3.5" className={`${fill} ${stroke}`} />
        <rect x="30" y="44" width="140" height="100" rx="20" strokeWidth="3.5" className={`${fill} ${stroke}`} />
        <rect x="42" y="35" width="22" height="10" rx="4" strokeWidth="3" className={stroke} />
        <rect x="134" y="56" width="22" height="13" rx="3" strokeWidth="3" className={stroke} />
        {/* the slot the photo comes out of */}
        <path d="M70 136h60" strokeWidth="3" className={stroke} />
        {/* flash "pop" lines, twinkling */}
        <path d="M162 40l7-9M170 52l10-3M154 34l2-10" strokeWidth="3" className={`${stroke} animate-twinkle motion-reduce:animate-none`} />

        {/* the lens is the face: blinking eyes and a big smile */}
        <circle cx="100" cy="92" r="32" strokeWidth="3.5" className={stroke} />
        <circle cx="100" cy="92" r="23" strokeWidth="2" className={`${stroke} opacity-50`} />
        {/* key={mood}: a new face "pops" in each time the mood changes */}
        <g key={mood} className="origin-[100px_92px] animate-pop motion-reduce:animate-none">
          {face(stroke)}
        </g>
        <path d="M79 76q5-7 13-9" strokeWidth="3" className={`${stroke} opacity-60`} />
        {/* rosy cheeks, as little dashes */}
        <path d="M50 108h10M140 108h10" strokeWidth="3" className={`${stroke} opacity-60`} />
      </g>
    </svg>
  )
}

// Snappy's faces. Each one draws the eyes and mouth inside the lens (centre 100,92).
const faces = {
  happy: (stroke) => (
    <>
      <g className="origin-[100px_86px] animate-blink motion-reduce:animate-none">
        <circle cx="90" cy="86" r="4" className="fill-current" />
        <circle cx="110" cy="86" r="4" className="fill-current" />
      </g>
      <path d="M88 99q12 10 24 0" strokeWidth="3.5" className={stroke} />
    </>
  ),
  // big round eyes and a little "ooh" mouth
  curious: (stroke) => (
    <>
      <circle cx="90" cy="85" r="5.5" strokeWidth="3" className={stroke} />
      <circle cx="110" cy="85" r="5.5" strokeWidth="3" className={stroke} />
      <circle cx="91" cy="86" r="2" className="fill-current" />
      <circle cx="111" cy="86" r="2" className="fill-current" />
      <circle cx="100" cy="102" r="4.5" strokeWidth="3" className={stroke} />
    </>
  ),
  // heart eyes (for weddings, obviously)
  love: (stroke) => (
    <>
      <path d="M90 92c-6-3.6-8-7-6.4-9.5 1.4-2.1 4.3-1.7 6.4.8 2.1-2.5 5-2.9 6.4-.8 1.6 2.5-.4 5.9-6.4 9.5Z" className="fill-current" />
      <path d="M110 92c-6-3.6-8-7-6.4-9.5 1.4-2.1 4.3-1.7 6.4.8 2.1-2.5 5-2.9 6.4-.8 1.6 2.5-.4 5.9-6.4 9.5Z" className="fill-current" />
      <path d="M88 99q12 10 24 0" strokeWidth="3.5" className={stroke} />
    </>
  ),
  // happy closed eyes ( ^ ^ ) and a wide-open grin
  excited: (stroke) => (
    <>
      <path d="M84 88l6-6 6 6M104 88l6-6 6 6" strokeWidth="3.5" className={stroke} />
      <path d="M86 96q14 18 28 0Z" strokeWidth="3" className={`fill-current ${stroke}`} />
    </>
  ),
  // eyes closed, a tiny mouth, and a "z" drifting up
  sleepy: (stroke) => (
    <>
      <path d="M84 86q6 4 12 0M104 86q6 4 12 0" strokeWidth="3" className={stroke} />
      <path d="M96 101h8" strokeWidth="3" className={stroke} />
      <path d="M120 60h8l-8 9h8" strokeWidth="2.5" className={`${stroke} animate-float`} />
    </>
  ),
}

// A little post box on a stand, drawn in lines. When `isSent` is true its flag swings up and a
// postcard pokes out of the slot, to show the enquiry has been "posted".
export function Mailbox({ className = '', isSent = false, fill = 'fill-night' }) {
  const stroke = 'stroke-current [stroke-linecap:round] [stroke-linejoin:round]'
  return (
    <svg viewBox="0 0 120 170" fill="none" aria-hidden="true" focusable="false" className={`overflow-visible ${className}`}>
      {/* the postcard, sliding into the slot once sent (drawn first, so the box covers its bottom half) */}
      <g className={`transition duration-700 ${isSent ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'}`}>
        <rect x="34" y="34" width="40" height="26" rx="2" strokeWidth="2.5" className={`${fill} ${stroke} -rotate-6 origin-[54px_47px]`} />
        <path d="M40 42h14M40 48h10" strokeWidth="2" className={`${stroke} -rotate-6 origin-[54px_47px]`} />
      </g>
      {/* the post and the grass at its foot */}
      <path d="M60 104v58M44 162h32" strokeWidth="3.5" className={stroke} />
      <path d="M36 162c1-6 3-9 5-10M84 162c-1-6-3-9-5-10M48 162c0-4 1-6 3-7" strokeWidth="2.5" className={stroke} />
      {/* the box: a rounded top like a classic mailbox, with a slot */}
      <path d="M20 104V70a28 28 0 0 1 56 0v34Z" strokeWidth="3.5" className={`${fill} ${stroke}`} />
      <path d="M76 70a28 28 0 0 1 24 28v6H76" strokeWidth="3.5" className={`${fill} ${stroke}`} />
      <path d="M34 58h28" strokeWidth="3.5" className={stroke} />
      <path d="M40 84q8 6 16 0" strokeWidth="2.5" className={`${stroke} opacity-60`} />
      {/* the flag: lying down until sent, then it swings up (and wiggles happily) */}
      <g className={`origin-[92px_86px] transition duration-700 ${isSent ? '-rotate-90' : 'rotate-0'}`}>
        <path d="M92 86h22" strokeWidth="3" className={stroke} />
        <path d="M108 80h10v8h-10Z" strokeWidth="2.5" className={`fill-current ${stroke}`} />
      </g>
    </svg>
  )
}

// A washing line strung across the top of the gallery, with photos pegged on it "drying",
// like prints in a darkroom. `photos` is a list of image URLs; without any, blank frames hang there.
export function Clothesline({ photos = [], className = '' }) {
  const frames = photos.length > 0 ? photos.slice(0, 6) : [null, null, null, null]
  const tilts = ['-rotate-6', 'rotate-3', '-rotate-2', 'rotate-6', '-rotate-3', 'rotate-2']

  return (
    <div aria-hidden="true" className={`relative ${className}`}>
      {/* the line itself: a gentle sag across the full width. It stays within the pegs' height
          (about 10-20px from the top), so every peg grips it, however many photos fit on screen. */}
      <svg viewBox="0 0 1000 30" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-7 w-full">
        <path d="M0 10 Q500 32 1000 10" fill="none" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="stroke-ink/60" />
      </svg>

      <div className="relative flex justify-around px-4">
        {frames.map((src, index) => (
          <div
            key={index}
            className={`mt-1 flex origin-top flex-col items-center transition duration-500 hover:rotate-0 ${tilts[index]} ${
              index > 3 ? 'hidden lg:flex' : index > 2 ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {/* the wooden peg */}
            <span className="relative z-10 -mb-2 h-6 w-2.5 rounded-sm bg-ember" />
            <div className="w-24 bg-cream p-1.5 pb-5 shadow-lg sm:w-28 xl:w-32">
              {src ? (
                <img src={src} alt="" className="aspect-square w-full object-cover" />
              ) : (
                // a blank print that is still "developing"
                <div className="aspect-square w-full animate-pulse bg-linear-to-br from-clay to-line motion-reduce:animate-none" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// A paper shopping bag with a heart on it, for "No orders yet".
export function ShoppingBag({ className = '' }) {
  return (
    <svg viewBox="0 0 160 160" aria-hidden="true" focusable="false" className={`overflow-visible ${className}`}>
      <ellipse cx="80" cy="150" rx="46" ry="5" className="fill-ink/15" />
      <g className="animate-float motion-reduce:animate-none">
        <path d="M58 52V40a22 22 0 0 1 44 0v12" fill="none" strokeWidth="4" className={line} />
        <path d="M30 52h100l-8 92H38Z" strokeWidth="4" className={`fill-clay ${line}`} />
        <path d="M30 52l14 12 14-12 14 12 14-12 14 12 14-12 14 12" fill="none" strokeWidth="2.5" className="stroke-ember/50 [stroke-linejoin:round]" />
        <path
          d="M80 120c-15-9-21-17-17-24 3-5.5 11-5 17 2 6-7 14-7.5 17-2 4 7-2 15-17 24Z"
          strokeWidth="3.5"
          className={`fill-ember ${line} origin-[80px_105px] animate-heartbeat motion-reduce:animate-none`}
        />
      </g>
    </svg>
  )
}
