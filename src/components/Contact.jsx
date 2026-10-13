import { useState } from 'react'
import { shootTypes } from '../data/studioData'
import Button from './Button'
import SectionHeading from './SectionHeading'

const fieldBase =
  'w-full appearance-none rounded-lg border border-cream/25 bg-cream/5 placeholder:text-cream/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 [color-scheme:dark]'

const inputClasses = `${fieldBase} h-13 px-4 text-cream`

const labelClasses = 'mb-1.5 block text-sm text-cream/85'

export default function Contact({ shootType, onShootTypeChange }) {
  const [sent, setSent] = useState(false)

  function handleSubmit(event) {
    event.preventDefault() 
    setSent(true)
  }

  return (
    <section id="contact" className="bg-ink px-5 py-16 text-cream sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow="Book a session" title="Let's make something worth framing" dark>
            Tell us about your shoot and we will get back to you within two working days.
          </SectionHeading>

          <dl className="flex flex-col gap-4 border-t border-cream/20 pt-8 text-cream/90">
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-gold">Email</dt>
              <dd>
                <a
                  href="mailto:hello@lenstheory.co.uk"
                  className="font-display text-xl text-cream transition hover:text-gold"
                >
                  hello@lenstheory.co.uk
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-gold">Reply time</dt>
              <dd>Within two working days</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-gold">Sessions</dt>
              <dd>Studio and on location</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-cream/10 bg-cream/5 p-5 sm:p-8">
          {sent ? (
            <div role="status" className="flex flex-col items-start gap-4 py-8">
              <h3 className="font-display text-3xl text-cream">Thank you</h3>
              <p className="text-cream/80">
                Your enquiry is noted. We will get back to you within two working days.
              </p>
              <Button variant="light" onClick={() => setSent(false)}>
                Send another enquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClasses}>
                  Name
                </label>
                <input id="name" name="name" type="text" autoComplete="name" required className={inputClasses} />
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email
                </label>
                <input id="email" name="email" type="email" autoComplete="email" required className={inputClasses} />
              </div>

              <div>
                <label htmlFor="type" className={labelClasses}>
                  Type of shoot
                </label>
                <div className="relative">
                  <select
                    id="type"
                    name="type"
                    required
                    value={shootType}
                    onChange={(event) => onShootTypeChange(event.target.value)}
                    className={`${fieldBase} h-13 pl-4 pr-10 [&>option]:bg-ink [&>option]:text-cream ${
                      shootType === '' ? 'text-cream/60' : 'text-cream'
                    }`}
                  >
                    <option value="" disabled>
                      Choose one
                    </option>
                    {shootTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold"
                  >
                    &#9662;
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="date" className={labelClasses}>
                  Preferred date
                </label>
                <input id="date" name="date" type="date" className={inputClasses} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className={labelClasses}>
                  Tell us about your shoot
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className={`${fieldBase} resize-y px-4 py-3 text-cream`}
                />
              </div>

              <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:gap-6">
                <Button type="submit" variant="light" className="w-full sm:w-auto">
                  Send enquiry
                </Button>
                <p className="text-sm text-cream/70">
                  We reply within two working days. Your details are only used to answer your enquiry.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}