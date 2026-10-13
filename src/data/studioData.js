// ============================================================================
// All site content lives in this one file, as plain arrays of objects.
// Components loop over these arrays with .map(), so adding an object here adds
// a card, a photo, a question... to the page. No copy-pasted JSX.
// (In Week 3 these arrays are what a backend would send instead.)
// ============================================================================

export const MAX_HOURS = 10

export const navLinks = [
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

// ---- Gallery: the main grid, filtered by `category` ------------------------
// To add a photo: put the file in public/images and add one line here.
// `shape` ('tall', 'portrait' or 'square') sets the photo's height in the masonry grid.
// A new category name automatically creates a new filter button.
export const galleryPhotos = [
  { id: 'photo-1', src: '/images/portrait-photo.jpg', alt: 'Studio portrait of a young woman in a lace blouse against a dark backdrop', category: 'Portraits', shape: 'tall' },
  { id: 'photo-2', src: '/images/wedding-photo.jpeg', alt: 'Bride and groom walking hand in hand through a stone garden', category: 'Weddings', shape: 'portrait' },
  { id: 'photo-3', src: '/images/family-photo.jpg', alt: 'Family of four sitting together in a field of tall grass', category: 'Family', shape: 'square' },
  { id: 'photo-4', src: '/images/portrait-1.jpg', alt: 'Young woman with glasses in a red top, lit by neon light', category: 'Portraits', shape: 'tall' },
  { id: 'photo-5', src: '/images/family-5.jpg', alt: 'Family photograph by Lens Theory', category: 'Family', shape: 'portrait' },
  { id: 'photo-6', src: '/images/event-1.jpg', alt: 'Graduates throwing their caps in the air, in black and white', category: 'Events', shape: 'square' },
  { id: 'photo-7', src: '/images/wedding-1.webp', alt: 'Bride and groom kissing under a flower-covered arch', category: 'Weddings', shape: 'portrait' },
  { id: 'photo-8', src: '/images/pet.webp', alt: 'Golden retriever peeking out from behind a mossy tree', category: 'Pets', shape: 'tall' },
  { id: 'photo-9', src: '/images/family-7.jpg', alt: 'Family photograph by Lens Theory', category: 'Family', shape: 'square' },
  { id: 'photo-10', src: '/images/portrait-2.jpg', alt: 'Close portrait of an older man with a long beard holding a pipe', category: 'Portraits', shape: 'portrait' },
  { id: 'photo-11', src: '/images/wedding-4.webp', alt: 'Wedding photograph by Lens Theory', category: 'Weddings', shape: 'tall' },
  { id: 'photo-12', src: '/images/event-3.jpg', alt: 'Event photograph by Lens Theory', category: 'Events', shape: 'square' },
]

// ---- Services: priced per hour. bookable: false means "enquire only" -------
export const services = [
  {
    id: 'portraits',
    name: 'Portraits',
    description: 'Individual and personal-brand portraits in the studio or on location.',
    image: '/images/portrait-photo.jpg',
    alt: 'Portrait photograph by Lens Theory',
    bookable: true,
    pricePerHour: 150,
    features: ['Studio or location', 'Professional retouching', 'Private online gallery'],
    terms: null,
  },
  {
    id: 'weddings',
    name: 'Weddings',
    description: 'Relaxed, documentary-style coverage from the first look to the last dance.',
    image: '/images/wedding-photo.jpeg',
    alt: 'Wedding photograph by Lens Theory',
    bookable: false,
    enquiryType: 'Wedding',
    pricePerHour: null,
    features: ['Half-day or full-day coverage', 'Pre-wedding consultation', 'Private online gallery'],
    terms: null,
  },
  {
    id: 'family',
    name: 'Family sessions',
    description: 'Natural, unposed family photographs at home, outdoors or in the studio.',
    image: '/images/family-photo.jpg',
    alt: 'Family photograph by Lens Theory',
    bookable: true,
    pricePerHour: 200,
    features: ['Indoors or outdoors', 'Relaxed, unposed direction', 'Print-ready images'],
    // NOTE: placeholder wording. Replace with the studio's real terms.
    terms: [
      { heading: 'What is included', text: 'Family sessions are priced at £200 per hour of session time. Each session includes relaxed, unposed direction, a private online gallery and print-ready, professionally edited images. Sessions can take place at home, outdoors or in the studio.' },
      { heading: 'Booking and payment', text: 'Your session is confirmed once your booking has been made and payment received. The total depends on the number of hours you book.' },
      { heading: 'Session length and timing', text: 'The clock starts at the agreed start time, so late arrivals shorten the session. Extra time can be added on the day, subject to availability, at the same hourly rate.' },
      { heading: 'Rescheduling and cancellation', text: "You can reschedule free of charge with at least 48 hours' notice. Cancellations with less than 48 hours' notice may not be refundable." },
      { heading: 'Weather', text: 'If the weather is poor for an outdoor session, we will happily move it to another date at no extra cost.' },
      { heading: 'Delivery of your images', text: 'Your edited gallery is delivered within two to three weeks of the session.' },
      { heading: 'Copyright and usage', text: 'Copyright stays with Lens Theory. You receive a personal licence to print and share your images. We may feature images in our portfolio unless you ask us not to.' },
      { heading: 'Children', text: 'A parent or guardian must be present for the whole session.' },
    ],
  },
]

// ---- Hero slideshow: the photos that fade in the background ----------------
// `position` is the CSS object-position, so you can move the crop (e.g. 'center 20%' to show more of the top).
export const heroSlides = [
  { id: 'hero-1', src: '/images/studio-1.avif', label: 'Studio', position: 'center 30%' },
  { id: 'hero-2', src: '/images/wedding-photo.jpeg', label: 'Weddings', position: 'center 35%' },
  { id: 'hero-3', src: '/images/portrait-photo.jpg', label: 'Portraits', position: 'center 25%' },
  { id: 'hero-4', src: '/images/family-photo.jpg', label: 'Family', position: 'center 40%' },
]

// Small facts shown at the bottom of the hero (the "from £x/hour" fact is worked out from the services).
export const heroFacts = ['Studio & on location', 'Replies within two working days']

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

// Photo shown softly behind the contact section.
export const contactPhoto = { src: '/images/family-photo.jpg', position: 'center 40%' }