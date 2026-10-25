import { useState } from 'react'
import { useApi } from '../../lib/api'
import Lightbox from '../Lightbox'

// The account page's "My gallery" tab: the finished photos the studio delivered to this customer,
// grouped by session. Same data as "My sessions" (GET /api/shoots); the server only includes
// photos for sessions marked 'delivered'. Clicking a photo opens the same Lightbox as the main gallery.
export default function MyGallery() {
  const { data: shoots, error } = useApi('/api/shoots')
  // Which photo is open in the viewer: { shootId, index }, or null when it is closed.
  const [open, setOpen] = useState(null)

  if (error) return <p className="text-ember">Sorry, your gallery could not be loaded ({error}).</p>
  if (!shoots) return <p className="text-ink-soft">Loading your gallery&hellip;</p>

  const delivered = shoots.filter((shoot) => shoot.photos.length > 0)

  if (delivered.length === 0) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-8">
        <p className="font-display text-2xl">Your gallery is empty for now</p>
        <p className="text-ink-soft">After your session, your edited photos appear here, ready to view and download.</p>
      </div>
    )
  }

  // The Lightbox expects { id, src, alt, category } for each photo.
  const lightboxPhotos = (shoot) =>
    shoot.photos.map((photo) => ({ ...photo, alt: `Photo from your ${shoot.serviceName} session`, category: shoot.serviceName }))

  const openShoot = open && delivered.find((shoot) => shoot.id === open.shootId)

  return (
    <div className="flex flex-col gap-12">
      {delivered.map((shoot) => (
        <section key={shoot.id} aria-labelledby={`gallery-${shoot.id}`}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h3 id={`gallery-${shoot.id}`} className="font-display text-2xl">
              {shoot.serviceName}
            </h3>
            <p className="text-sm text-ink-soft">
              {shoot.photos.length} photos &middot; click one to view it larger, or use Download to save it
            </p>
          </div>

          <ul className="columns-2 gap-3 md:columns-3">
            {shoot.photos.map((photo, index) => (
              <li key={photo.id} className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl">
                <button type="button" onClick={() => setOpen({ shootId: shoot.id, index })} aria-label={`View photo ${index + 1} larger`} className="block w-full">
                  <img src={photo.src} alt="" loading="lazy" className="w-full transition duration-700 group-hover:scale-105" />
                </button>
                {/* Opens the full-size file in a new tab, where it can be saved */}
                <a
                  href={photo.src}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2 right-2 rounded-full bg-cream/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur transition focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  Download
                </a>
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
