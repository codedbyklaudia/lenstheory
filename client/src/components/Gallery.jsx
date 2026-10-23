import { useState } from 'react'
import { useApi } from '../lib/api'
import Lightbox from './Lightbox'
import Section from './Section'
import SectionHeading from './SectionHeading'

// Each photo has a `shape` in the data. Mixing heights is what gives the grid its masonry rhythm.
const shapeClasses = {
  tall: 'aspect-[3/4]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
}

export default function Gallery() {
  // The photos come from the database, through GET /api/photos.
  const { data, error, isLoading } = useApi('/api/photos')
  const galleryPhotos = data ?? []

  // STATE 1: which filter button is selected. Starts as 'All'.
  const [activeCategory, setActiveCategory] = useState('All')
  // STATE 2: which photo is open in the viewer. null means the viewer is closed.
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // The filter buttons are built from the data: "All" plus every category that exists.
  // new Set(...) removes duplicates, so adding a photo with a new category adds a button.
  const categories = ['All', ...new Set(galleryPhotos.map((photo) => photo.category))]

  const countFor = (category) =>
    category === 'All'
      ? galleryPhotos.length
      : galleryPhotos.filter((photo) => photo.category === category).length

  // DERIVED DATA: not stored in state, just calculated from the state on every render.
  const visiblePhotos =
    activeCategory === 'All'
      ? galleryPhotos
      : galleryPhotos.filter((photo) => photo.category === activeCategory)

  const filterButtons = (
    <div role="group" aria-label="Filter photos by category" className="flex flex-wrap gap-2 xl:justify-end">
      {categories.map((category) => {
        const isActive = category === activeCategory
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => setActiveCategory(category)}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${
              isActive ? 'border-ink bg-ink text-cream shadow-md' : 'border-ink/30 text-ink hover:border-ink'
            }`}
          >
            {category}
            <span className={`text-xs ${isActive ? 'text-gold' : 'text-ink-soft'}`}>{countFor(category)}</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <Section id="gallery">
      <SectionHeading
        eyebrow="Gallery"
        number="01"
        title={
          <>
            Selected <em>work</em>
          </>
        }
        doodle="camera"
        aside={filterButtons}
      >
        A look at recent sessions, from quiet portraits to wedding days and family afternoons.
      </SectionHeading>

      <p aria-live="polite" className="mb-6 text-sm text-ink-soft">
        {isLoading && 'Loading photos…'}
        {error && `Sorry, the photos could not be loaded (${error}).`}
        {data && (
          <>
            Showing {visiblePhotos.length} of {galleryPhotos.length} photos
            <span className="hidden sm:inline"> &middot; Click a photo to view it larger</span>
          </>
        )}
      </p>

      {/* Masonry: CSS columns let photos of different heights stack without gaps.
          The key includes the filter, so every photo fades in again when you change filter. */}
      <ul className="columns-2 gap-3 md:columns-3 xl:columns-4 2xl:columns-5">
        {visiblePhotos.map((photo, index) => (
          <li
            key={`${activeCategory}-${photo.id}`}
            style={{ animationDelay: `${index * 70}ms` }}
            className="mb-3 animate-photo-in break-inside-avoid motion-reduce:animate-none"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={`View larger: ${photo.alt}`}
              className="group relative block w-full overflow-hidden rounded-xl"
            >
              <img
                src={photo.src}
                alt=""
                loading="lazy"
                className={`${shapeClasses[photo.shape]} w-full object-cover transition duration-700 group-hover:scale-105`}
              />

              {/* Hover / keyboard-focus overlay */}
              <span className="pointer-events-none absolute inset-0 flex items-end justify-between bg-linear-to-t from-ink/70 via-transparent to-transparent p-4 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="font-display text-lg italic text-cream">{photo.category}</span>
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center rounded-full border border-cream/60 text-lg leading-none text-cream"
                >
                  +
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {lightboxIndex !== null && (
        <Lightbox
          photos={visiblePhotos}
          index={lightboxIndex}
          onChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </Section>
  )
}