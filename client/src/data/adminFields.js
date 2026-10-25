// ============================================================================
// What the admin dashboard lets you edit, described as data.
// The editors loop over these lists and draw the right input for each `type`:
//   text      one-line text            textarea  several lines of text
//   number    a whole number           checkbox  yes / no
//   select    pick one of `options`    image     a photo: upload one, or paste its address
//   strings   a list of short texts    list      a list of items, each with its own `fields`
// So making something new editable = adding a line here (plus showing it in the component).
// ============================================================================

import { shootTypes } from './studioData'

const heading = [
  { name: 'title', label: 'Heading', type: 'text' },
  { name: 'titleHighlight', label: 'Heading: highlighted ending', type: 'text', hint: 'Shown in italic colour after the heading' },
]

// ---- The "Page content" tab: one form per section of the page ----
// `key` matches the section's name in GET /api/content (and in server/src/db/seedData.js).
export const contentSections = [
  {
    key: 'hero',
    label: 'Hero',
    description: 'The big photo slideshow at the very top of the page.',
    fields: [
      ...heading,
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      {
        name: 'slides',
        label: 'Slideshow photos',
        type: 'list',
        itemLabel: 'photo',
        fields: [
          { name: 'src', label: 'Photo', type: 'image' },
          { name: 'label', label: 'Name (for you only)', type: 'text' },
          { name: 'position', label: 'Crop focus', type: 'text', hint: "e.g. 'center 20%' shows more of the top" },
        ],
      },
    ],
  },
  {
    key: 'marquees',
    label: 'Moving word bands',
    description: 'The two bands of gliding words.',
    fields: [
      { name: 'top', label: 'Band under the hero', type: 'strings', itemLabel: 'word' },
      { name: 'bottom', label: 'Gold band above the contact section', type: 'strings', itemLabel: 'word' },
    ],
  },
  {
    key: 'gallery',
    label: 'Gallery heading',
    description: 'The text above the photos. The photos themselves are in the Gallery tab.',
    fields: [...heading, { name: 'intro', label: 'Intro text', type: 'textarea' }],
  },
  {
    key: 'about',
    label: 'About',
    fields: [
      ...heading,
      { name: 'intro', label: 'Intro text', type: 'textarea' },
      { name: 'image', label: 'Photo', type: 'image' },
      { name: 'imageAlt', label: 'Photo description (alt text)', type: 'text' },
      { name: 'captionTitle', label: 'Photo caption: title', type: 'text' },
      { name: 'captionText', label: 'Photo caption: text', type: 'text' },
      {
        name: 'points',
        label: 'Numbered points',
        type: 'list',
        itemLabel: 'point',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'text', label: 'Text', type: 'textarea' },
        ],
      },
    ],
  },
  {
    key: 'services',
    label: 'Services heading & booking steps',
    description: 'The text around the service cards. The services themselves are in the Services tab.',
    fields: [
      ...heading,
      { name: 'intro', label: 'Intro text', type: 'textarea' },
      { name: 'stepsTitle', label: '"How booking works" heading', type: 'text' },
      { name: 'stepsTitleHighlight', label: '"How booking works": highlighted ending', type: 'text' },
      {
        name: 'steps',
        label: 'Booking steps',
        type: 'list',
        itemLabel: 'step',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'text', label: 'Text', type: 'textarea' },
          { name: 'meta', label: 'Small note', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'contact',
    label: 'Contact & FAQ',
    fields: [
      ...heading,
      { name: 'intro', label: 'Intro text', type: 'textarea' },
      { name: 'email', label: 'Studio email address', type: 'text', hint: 'Also shown in the footer' },
      { name: 'replyTime', label: 'Reply time', type: 'text' },
      { name: 'sessions', label: 'Where sessions happen', type: 'text' },
      { name: 'backgroundImage', label: 'Background photo', type: 'image' },
      { name: 'faqTitle', label: 'FAQ heading', type: 'text' },
      {
        name: 'faqs',
        label: 'Questions & answers',
        type: 'list',
        itemLabel: 'question',
        fields: [
          { name: 'question', label: 'Question', type: 'text' },
          { name: 'answer', label: 'Answer', type: 'textarea' },
        ],
      },
    ],
  },
  {
    key: 'footer',
    label: 'Footer',
    fields: [
      { name: 'eyebrow', label: 'Small line above the heading', type: 'text' },
      ...heading,
      { name: 'blurb', label: 'Short description', type: 'textarea' },
      { name: 'photos', label: 'Moving photo strip', type: 'strings', itemType: 'image', itemLabel: 'photo' },
    ],
  },
]

// ---- The "Gallery" tab: the fields of one gallery photo ----
export const photoFields = [
  { name: 'src', label: 'Photo', type: 'image' },
  { name: 'alt', label: 'Description (alt text)', type: 'text', hint: 'Read aloud by screen readers' },
  { name: 'category', label: 'Category', type: 'text', hint: 'A new category adds a new filter button' },
  {
    name: 'shape',
    label: 'Shape in the grid',
    type: 'select',
    options: [
      { value: 'tall', label: 'Tall (3:4)' },
      { value: 'portrait', label: 'Portrait (4:5)' },
      { value: 'square', label: 'Square' },
    ],
  },
]

export const newPhoto = { src: '', alt: '', category: '', shape: 'portrait' }

// ---- The "Services" tab: the fields of one service card ----
export const serviceFields = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'image', label: 'Photo', type: 'image' },
  { name: 'alt', label: 'Photo description (alt text)', type: 'text' },
  { name: 'bookable', label: 'Bookable online (customers add hours to their basket)', type: 'checkbox' },
  { name: 'pricePerHour', label: 'Price per hour (£)', type: 'number', hint: 'Only used when bookable online' },
  {
    name: 'enquiryType',
    label: '"Enquire" button picks',
    type: 'select',
    hint: 'For enquire-only services: which shoot type the contact form selects',
    options: [{ value: '', label: 'Nothing' }, ...shootTypes.map((type) => ({ value: type, label: type }))],
  },
  { name: 'features', label: 'Features', type: 'strings', itemLabel: 'feature' },
  {
    name: 'terms',
    label: 'Terms ("View more details")',
    type: 'list',
    itemLabel: 'section',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'text', label: 'Text', type: 'textarea' },
    ],
  },
]

export const newService = {
  name: '',
  description: '',
  image: '',
  alt: '',
  bookable: true,
  pricePerHour: 100,
  enquiryType: '',
  features: [],
  terms: [],
}
