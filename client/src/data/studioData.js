// ============================================================================
// All site content lives in this one file, as plain arrays of objects.
// Components loop over these arrays with .map(), so adding an object here adds
// a card, a photo, a question... to the page. No copy-pasted JSX.
// The gallery photos and services moved to the database in Week 3 (see below).
// ============================================================================

export const MAX_HOURS = 10

export const navLinks = [
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

// ---- Gallery photos and services now live in the DATABASE --------------------
// They are fetched from the API (/api/photos and /api/services).
// To change them, edit server/src/db/seedData.js and run `npm run db:seed` in server/.

// ---- The scrolling band of big words under the hero (same names as the gallery categories) ----
export const specialisms = ['Portraits', 'Weddings', 'Family', 'Pets', 'Events']

// ---- The gold band above the contact section: little bits of photographer talk ----
export const photoTalk = ['Golden hour', 'Say cheese!', 'Soft bokeh', 'Candids', 'Studio lights', 'Just one more shot']

// ---- Hero slideshow: the photos that fade in the background ----------------
// `position` is the CSS object-position, so you can move the crop (e.g. 'center 20%' to show more of the top).
export const heroSlides = [
  { id: 'hero-1', src: '/images/studio-1.avif', label: 'Studio', position: 'center 30%' },
  { id: 'hero-2', src: '/images/wedding-photo.jpeg', label: 'Weddings', position: 'center 35%' },
  { id: 'hero-3', src: '/images/portrait-photo.jpg', label: 'Portraits', position: 'center 25%' },
  { id: 'hero-4', src: '/images/family-photo.jpg', label: 'Family', position: 'center 40%' },
]

// ---- About ------------------------------------------------------------------
export const aboutPoints = [
  { title: 'Natural light', text: 'Soft, flattering daylight wherever we can find it.' },
  { title: 'Honest moments', text: 'Gentle direction, so expressions stay real and never staged.' },
  { title: 'Timeless edit', text: 'Refined, true-to-life colour that still looks right in twenty years.' },
]

// ---- How booking works (shown under the services) -----------------------------
export const processSteps = [
  { title: 'Enquire', text: 'Tell us what you have in mind and your preferred date.', meta: 'Reply within two working days' },
  { title: 'Plan', text: 'We talk through the look, the location and the timing, so the day feels easy.', meta: 'Look, location, timing' },
  { title: 'Shoot & deliver', text: 'Relax in front of the camera. Your edited gallery follows, ready to share and print.', meta: 'Gallery in two to three weeks' },
]

// ---- FAQ (shown next to the contact form, where people have questions) ----------
export const faqs = [
  { question: 'How far in advance should I book?', answer: 'Weddings book up early, so get in touch as soon as you have a date. Portrait and family sessions can often be arranged within a few weeks.' },
  { question: 'Do you shoot on location?', answer: 'Yes. We photograph in the studio and on location. Travel beyond the local area is quoted individually.' },
  { question: 'When will I receive my photos?', answer: 'Most sessions are delivered within two to three weeks. Weddings can take a little longer, and we will always give you a date upfront.' },
  { question: 'What should I wear?', answer: 'Choose outfits you feel comfortable in. Soft, solid colours photograph beautifully, and we are happy to help you plan before the day.' },
  { question: 'Can I print my photos?', answer: 'Yes. You receive high-resolution images that are ready for printing and sharing.' },
]

export const shootTypes = ['Portrait', 'Wedding', 'Family session', 'Something else']

// ---- Contact details, used by the contact section and the footer -----------------
export const contactInfo = {
  email: 'hello@lenstheory.co.uk',
  replyTime: 'Within two working days',
  sessions: 'Studio and on location',
}

// The row of photos gliding across the top of the footer (they all link to the gallery).
// Use enough photos that one copy of the row is wider than a big screen (about 10).
export const footerPhotos = [
  '/images/portrait-1.jpg',
  '/images/wedding-1.webp',
  '/images/family-6.jpg',
  '/images/pet.webp',
  '/images/event-1.jpg',
  '/images/portrait-2.jpg',
  '/images/family-5.jpg',
  '/images/wedding-4.webp',
  '/images/event-3.jpg',
  '/images/family-7.jpg',
]

// Photo shown softly behind the contact section.
export const contactPhoto = { src: '/images/family-photo.jpg', position: 'center 40%' }