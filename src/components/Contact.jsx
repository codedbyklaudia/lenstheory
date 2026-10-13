import { useState } from 'react'
import { contactInfo, contactPhoto, shootTypes } from '../data/studioData'
import Button from './Button'
import FaqList from './Faq'
import Section from './Section'
import SectionHeading from './SectionHeading'

const fieldBase =
  'w-full rounded-lg border border-line bg-tint text-ink placeholder:text-ink-soft/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20'
const inputClasses = `${fieldBase} h-13 px-4`
const selectClasses = `${fieldBase} h-13 appearance-none pl-4 pr-10`
const labelClasses = 'mb-1.5 block text-sm font-medium text-ink'

const emptyForm = { name: '', email: '', date: '', time: 'Flexible', message: '' }

// Small line icons for the contact details.
function Icon({ name }) {
  const paths = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
        <circle cx="12" cy="11" r="2" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}

// `shootType` and `onShootTypeChange` come from App, so clicking "Enquire" on the wedding card
// can pre-select "Wedding" here. Every field below is a CONTROLLED input: React state holds the
// value, and each input just displays it and reports changes.
export default function Contact({ shootType, onShootTypeChange }) {
  const [form, setForm] = useState(emptyForm)
  const [sent, setSent] = useState(false)

  // One handler for all text fields: the input's `name` tells us which part of the state to update.
  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault() // no backend yet (Week 3), so we just show a thank-you message
    setSent(true)
  }

  function handleReset() {
    setForm(emptyForm)
    onShootTypeChange('')
    setSent(false)
  }

  const firstName = form.name.trim().split(' ')[0]

  const details = [
    {
      icon: 'mail',
      label: 'Email',
      value: (
        <a href={`mailto:${contactInfo.email}`} className="transition hover:text-gold">
          {contactInfo.email}
        </a>
      ),
    },
    { icon: 'clock', label: 'Reply time', value: contactInfo.replyTime },
    { icon: 'pin', label: 'Sessions', value: contactInfo.sessions },
  ]

  // A photo softly behind the section, fading into solid green at the bottom so it joins the footer.
  const background = (
    <>
      <img
        src={contactPhoto.src}
        alt=""
        loading="lazy"
        style={{ objectPosition: contactPhoto.position }}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-night/80 via-night/75 to-night" />
    </>
  )

  return (
    <Section id="contact" tone="night" background={background} wide>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-20 xl:gap-28">
        <div>
          <SectionHeading eyebrow="Book a session" number="04" title="Let's make something worth framing" dark>
            Tell us about your shoot and we will get back to you within two working days.
          </SectionHeading>

          <ul className="flex flex-col gap-5">
            {details.map((item) => (
              <li key={item.label} className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold">
                  <Icon name={item.icon} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gold">{item.label}</p>
                  <p className="font-display text-lg text-cream">{item.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* The form sits on a light card, so it stands out against the dark photo */}
        <div className="rounded-2xl bg-cream p-6 text-ink shadow-2xl sm:p-8">
          {sent ? (
            <div role="status" className="flex flex-col items-start gap-4 py-6">
              <span className="flex size-14 items-center justify-center rounded-full bg-ember/10 text-2xl text-ember">
                &#10003;
              </span>
              <h3 className="font-display text-3xl">Thank you{firstName ? `, ${firstName}` : ''}</h3>
              <p className="text-ink-soft">
                We have your enquiry{shootType ? ` for a ${shootType.toLowerCase()} session` : ''} and will
                reply to {form.email} within two working days.
              </p>
              <Button variant="ghost" onClick={handleReset}>
                Send another enquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClasses}>
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>

              {/* Pill buttons instead of a dropdown: quicker to tap, and you see every option at once */}
              <fieldset className="sm:col-span-2">
                <legend className={labelClasses}>What are you booking?</legend>
                <div className="flex flex-wrap gap-2">
                  {shootTypes.map((type) => {
                    const isSelected = shootType === type
                    return (
                      <label
                        key={type}
                        className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember ${
                          isSelected
                            ? 'border-ink bg-ink text-cream'
                            : 'border-ink/25 text-ink hover:border-ink'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          required
                          checked={isSelected}
                          onChange={() => onShootTypeChange(type)}
                          className="sr-only"
                        />
                        {type}
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <div>
                <label htmlFor="date" className={labelClasses}>
                  Preferred date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="time" className={labelClasses}>
                  Best time of day
                </label>
                <div className="relative">
                  <select
                    id="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className={selectClasses}
                  >
                    {['Flexible', 'Morning', 'Afternoon', 'Evening'].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ember"
                  >
                    &#9662;
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className={labelClasses}>
                  Tell us about your shoot
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={form.message}
                  onChange={handleChange}
                  className={`${fieldBase} resize-y px-4 py-3`}
                />
              </div>

              <div className="flex flex-col gap-3 sm:col-span-2">
                <Button type="submit" className="w-full">
                  Send enquiry
                </Button>
                <p className="text-center text-sm text-ink-soft">
                  We reply within two working days. Your details are only used to answer your enquiry.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Questions, answered right where people are about to enquire */}
      <div className="mt-20 border-t border-cream/20 pt-12 lg:mt-28 lg:grid lg:grid-cols-[1fr_1.6fr] lg:gap-20 xl:gap-28">
        <h3 className="mb-6 font-display text-2xl text-cream sm:text-3xl lg:mb-0">Good to know before you book</h3>
        <FaqList />
      </div>
    </Section>
  )
}