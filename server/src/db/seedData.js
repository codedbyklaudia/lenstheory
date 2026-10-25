// The starting content for the database. This used to be hardcoded in the React app
// (client/src/data/studioData.js). `npm run db:seed` copies it into the real tables.
// After seeding, the database is the source of truth: admins change photos and services in the
// dashboard, and the frontend fetches them from the API.

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

// ---- Page text and images ------------------------------------------------------
// Everything an admin can edit in the dashboard's "Page content" tab, one object per section.
// These are NOT copied into the database: GET /api/content starts from these defaults and lays
// whatever an admin has saved (the `site_content` table) on top of them.
//
// Headings are split in two: `title` is the normal part and `titleHighlight` is the italic,
// coloured ending (e.g. "Selected" + "work").
export const siteContent = {
  hero: {
    title: 'Portraits that feel',
    titleHighlight: 'like you.',
    subtitle:
      'Portraits, weddings and family stories shaped by a clear point of view. Thoughtful light, honest moments, and photographs made to last.',
    // `position` is the CSS object-position: 'center 20%' shows more of the top of the photo.
    slides: [
      { src: '/images/studio-1.avif', label: 'Studio', position: 'center 30%' },
      { src: '/images/wedding-photo.jpeg', label: 'Weddings', position: 'center 35%' },
      { src: '/images/portrait-photo.jpg', label: 'Portraits', position: 'center 25%' },
      { src: '/images/family-photo.jpg', label: 'Family', position: 'center 40%' },
    ],
  },

  // The two bands of gliding words: under the hero, and above the contact section.
  marquees: {
    top: ['Portraits', 'Weddings', 'Family', 'Pets', 'Events'],
    bottom: ['Golden hour', 'Say cheese!', 'Soft bokeh', 'Candids', 'Studio lights', 'Just one more shot'],
  },

  gallery: {
    title: 'Selected',
    titleHighlight: 'work',
    intro: 'A look at recent sessions, from quiet portraits to wedding days and family afternoons.',
  },

  about: {
    title: 'Every good photograph starts with a',
    titleHighlight: 'point of view',
    intro:
      'Lens Theory is a photography studio built on honest moments and considered light. We take time to understand the people in front of the camera, so the images still feel like you years from now.',
    image: '/images/portrait-photo.jpg',
    imageAlt: 'Portrait photograph by Lens Theory',
    captionTitle: 'Studio & on location',
    captionText: 'Portraits · Weddings · Families',
    points: [
      { title: 'Natural light', text: 'Soft, flattering daylight wherever we can find it.' },
      { title: 'Honest moments', text: 'Gentle direction, so expressions stay real and never staged.' },
      { title: 'Timeless edit', text: 'Refined, true-to-life colour that still looks right in twenty years.' },
    ],
  },

  services: {
    title: 'Choose your',
    titleHighlight: 'session',
    intro:
      'Sessions are priced per hour. Pick how long you need and add it to your basket, or enquire for a custom quote.',
    stepsTitle: 'How booking',
    stepsTitleHighlight: 'works',
    steps: [
      { title: 'Enquire', text: 'Tell us what you have in mind and your preferred date.', meta: 'Reply within two working days' },
      { title: 'Plan', text: 'We talk through the look, the location and the timing, so the day feels easy.', meta: 'Look, location, timing' },
      { title: 'Shoot & deliver', text: 'Relax in front of the camera. Your edited gallery follows, ready to share and print.', meta: 'Gallery in two to three weeks' },
    ],
  },

  contact: {
    title: "Let's make something",
    titleHighlight: 'worth framing',
    intro: 'Tell us about your shoot and we will get back to you within two working days.',
    email: 'hello@lenstheory.co.uk',
    replyTime: 'Within two working days',
    sessions: 'Studio and on location',
    backgroundImage: '/images/family-photo.jpg',
    faqTitle: 'Good to know before you book',
    faqs: [
      { question: 'How far in advance should I book?', answer: 'Weddings book up early, so get in touch as soon as you have a date. Portrait and family sessions can often be arranged within a few weeks.' },
      { question: 'Do you shoot on location?', answer: 'Yes. We photograph in the studio and on location. Travel beyond the local area is quoted individually.' },
      { question: 'When will I receive my photos?', answer: 'Most sessions are delivered within two to three weeks. Weddings can take a little longer, and we will always give you a date upfront.' },
      { question: 'What should I wear?', answer: 'Choose outfits you feel comfortable in. Soft, solid colours photograph beautifully, and we are happy to help you plan before the day.' },
      { question: 'Can I print my photos?', answer: 'Yes. You receive high-resolution images that are ready for printing and sharing.' },
    ],
  },

  footer: {
    eyebrow: 'Ready when you are',
    title: 'Your story,',
    titleHighlight: 'beautifully framed.',
    blurb: 'A photography studio for portraits, weddings and family sessions, in the studio and on location.',
    // The row of photos gliding across the top of the footer. About 10 fills a big screen.
    photos: [
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
    ],
  },
}
