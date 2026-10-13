export const MAX_HOURS = 10

export const navLinks = [
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

export const specialisms = ['Portraits', 'Weddings', 'Family sessions', 'Events']

// Gallery: the main grid, filtered by `category`
export const galleryPhotos = [
  { id: 'photo-1', src: '/images/portrait-photo.jpg', alt: 'Portrait photograph by Lens Theory', category: 'Portraits' },
  { id: 'photo-2', src: '/images/wedding-photo.jpeg', alt: 'Wedding photograph by Lens Theory', category: 'Weddings' },
  { id: 'photo-3', src: '/images/family-photo.jpg', alt: 'Family photograph by Lens Theory', category: 'Family' },
  { id: 'photo-4', src: '/images/portrait-1.jpg', alt: 'Portrait photograph by Lens Theory', category: 'Portraits' },
  { id: 'photo-5', src: '/images/wedding-1.webp', alt: 'Wedding photograph by Lens Theory', category: 'Weddings' },
  { id: 'photo-6', src: '/images/event-1.jpg', alt: 'Event photograph by Lens Theory', category: 'Events' },
  { id: 'photo-7', src: '/images/portrait-2.jpg', alt: 'Portrait photograph by Lens Theory', category: 'Portraits' },
  { id: 'photo-8', src: '/images/pet.webp', alt: 'Pet photograph by Lens Theory', category: 'Pets' },
]

// Services: priced per hour. bookable: false means "enquire only" 
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

export const aboutPoints = [
  { title: 'Natural light', text: 'Soft, flattering daylight wherever we can find it.' },
  { title: 'Honest moments', text: 'Gentle direction, so expressions stay real and never staged.' },
  { title: 'Timeless edit', text: 'Refined, true-to-life colour that still looks right in twenty years.' },
]

export const processSteps = [
  { title: 'Enquire', text: 'Tell us what you have in mind and your preferred date.', meta: 'Reply within two working days' },
  { title: 'Plan', text: 'We talk through the look, the location and the timing, so the day feels easy.', meta: 'Look, location, timing' },
  { title: 'Shoot & deliver', text: 'Relax in front of the camera. Your edited gallery follows, ready to share and print.', meta: 'Gallery in two to three weeks' },
]

export const faqs = [
  { question: 'How far in advance should I book?', answer: 'Weddings book up early, so get in touch as soon as you have a date. Portrait and family sessions can often be arranged within a few weeks.' },
  { question: 'Do you shoot on location?', answer: 'Yes. We photograph in the studio and on location. Travel beyond the local area is quoted individually.' },
  { question: 'When will I receive my photos?', answer: 'Most sessions are delivered within two to three weeks. Weddings can take a little longer, and we will always give you a date upfront.' },
  { question: 'What should I wear?', answer: 'Choose outfits you feel comfortable in. Soft, solid colours photograph beautifully, and we are happy to help you plan before the day.' },
  { question: 'Can I print my photos?', answer: 'Yes. You receive high-resolution images that are ready for printing and sharing.' },
]

export const shootTypes = ['Portrait', 'Wedding', 'Family session', 'Something else']