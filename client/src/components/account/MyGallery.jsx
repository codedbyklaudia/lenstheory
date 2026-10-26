import { useState } from 'react'
import Doodle from '../Doodle'
import Icon from '../Icon'
import Lightbox from '../Lightbox'
import { EmptyState, Loading } from './bits'
import { Clothesline } from '../Illustrations'

// The account page's "My gallery" tab: the finished photos the studio delivered, grouped by session.
// `request` is the GET /api/shoots request (loaded once by AccountPage); the server only includes
// photos of sessions marked 'delivered'. Photos are shown as POLAROIDS, each tilted a little,
// straightening up on hover. Clicking one opens the same Lightbox as the main gallery.
// `onShowSessions` switches to the "My sessions" tab.

// A small, fixed tilt per photo (by position), so the wall looks hand-pinned but never jumps around.
const tilts = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-3']

export default function MyGallery({ request, onShowSessions }) {
  const { data: shoots, error } = request
  // Which photo is open in the viewer: { shootId, index }, or null when it is closed.
  const [open, setOpen] = useState(null)

  if (error) return <p className="text-ember">Sorry, your gallery could not be loaded ({error}).</p>
  if (!shoots) return <Loading>Developing your photos&hellip;</Loading>

  const delivered = shoots.filter((shoot) => shoot.photos.length > 0)

  if (delivered.length === 0) {
    return (
      <EmptyState
        illustration={<Clothesline className="mb-4 w-full max-w-2xl" />}
        title="Your photos are still in the darkroom"
        action={
          shoots.length > 0 && (
            <button type="button" onClick={onShowSessions} className="font-medium text-ember underline underline-offset-4 hover:text-ink">
              Check on your sessions &rarr;
            </button>
          )
        }
      >
        After your session we edit every shot by hand. When they&rsquo;re ready they appear right here, to view and download.
      </EmptyState>
    )
  }

  // The Lightbox expects { id, src, alt, category } for each photo.
  const lightboxPhotos = (shoot) =>
    shoot.photos.map((photo) => ({ ...photo, alt: `Photo from your ${shoot.serviceName} session`, category: shoot.serviceName }))

  const openShoot = open && delivered.find((shoot) => shoot.id === open.shootId)

  // The newest photos (from the most recently delivered session) hang on the washing line.
  const newest = delivered[0].photos.map((photo) => photo.src)

  return (
    <div className="flex flex-col gap-14">
      <div className="relative overflow-hidden rounded-3xl bg-cream px-4 pb-10 pt-6 sm:px-8">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="flex items-center gap-2 font-display text-2xl">
            <Doodle name="sparkle" className="size-5 animate-twinkle text-gold motion-reduce:animate-none" />
            Fresh off the line
          </p>
          <p className="text-sm text-ink-soft">Your newest prints, hung up to dry</p>
        </div>
        <Clothesline photos={newest} />
      </div>

      {delivered.map((shoot) => (
        <section key={shoot.id} aria-labelledby={`gallery-${shoot.id}`}>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
            <h3 id={`gallery-${shoot.id}`} className="flex items-center gap-3 font-display text-3xl">
              <Doodle name="heart" className="size-8 animate-wiggle text-ember motion-reduce:animate-none" />
              {shoot.serviceName}
            </h3>
            <p className="text-sm text-ink-soft">{shoot.photos.length} photos &middot; tap one to see it big</p>
          </div>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {shoot.photos.map((photo, index) => (
              <li
                key={photo.id}
                style={{ animationDelay: `${index * 60}ms` }}
                className={`group relative animate-photo-in rounded-sm bg-cream p-2 pb-10 shadow-md transition duration-300 hover:z-10 hover:rotate-0 hover:scale-105 hover:shadow-2xl motion-reduce:animate-none ${
                  tilts[index % tilts.length]
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen({ shootId: shoot.id, index })}
                  aria-label={`View photo ${index + 1} larger`}
                  className="block w-full overflow-hidden bg-tint"
                >
                  <img src={photo.src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                </button>

                {/* The polaroid's white strip: a handwritten-looking number and a download button */}
                <div className="absolute inset-x-2 bottom-2 flex items-center justify-between">
                  <span className="font-display text-sm italic text-ink-soft">No. {index + 1}</span>
                  <a
                    href={photo.src}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Download photo ${index + 1}`}
                    className="flex size-7 items-center justify-center rounded-full text-ember transition hover:bg-ember hover:text-cream"
                  >
                    <Icon name="download" className="size-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {openShoot && (
        <Lightbox
          photos={lightboxPhotos(openShoot)}
          index={open.index}
          onChange={(index) => setOpen({ ...open, index })}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  )
}
