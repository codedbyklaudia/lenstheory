import { useState } from 'react'
import { galleryPhotos } from '../data/studioData'
import Button from './Button'
import SectionHeading from './SectionHeading'

// The filter buttons are built from the data: "All" plus every category that exists.
// new Set(...) removes duplicates, so adding a photo with a new category adds a button.
const categories = ['All', ...new Set(galleryPhotos.map((photo) => photo.category))]

export default function Gallery() {
  // STATE: which filter button is selected. Starts as 'All'.
  // Clicking a button calls setActiveCategory(...), React re-renders this component,
  // and the line below works out which photos to show.
  const [activeCategory, setActiveCategory] = useState('All')

  // DERIVED DATA: not stored in state, just calculated from the state on every render.
  const visiblePhotos =
    activeCategory === 'All'
      ? galleryPhotos
      : galleryPhotos.filter((photo) => photo.category === activeCategory)

  return (
    <section id="gallery" className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Gallery" title="Selected work">
          A look at recent sessions, from quiet portraits to wedding days and family afternoons.
        </SectionHeading>

        <div role="group" aria-label="Filter photos by category" className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = category === activeCategory
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-ink bg-ink text-cream'
                    : 'border-ink/30 text-ink hover:border-ink'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        <p aria-live="polite" className="mb-4 text-sm text-ink-soft">
          Showing {visiblePhotos.length} of {galleryPhotos.length} photos
        </p>

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {visiblePhotos.map((photo) => (
            <li key={photo.id} className="group overflow-hidden rounded-xl">
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Button href="#contact" variant="ghost">
            Book your own session
          </Button>
        </div>
      </div>
    </section>
  )
}