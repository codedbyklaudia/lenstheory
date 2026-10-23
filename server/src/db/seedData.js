// The starting content for the database. This used to be hardcoded in the React app
// (client/src/data/studioData.js). `npm run db:seed` copies it into the real tables.
// After seeding, the database is the source of truth and the frontend fetches it from the API.

// ---- Gallery ----------------------------------------------------------------
// `src` points at files in client/public/images (served by the frontend).
// `shape` ('tall', 'portrait' or 'square') sets the photo's height in the masonry grid.
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
