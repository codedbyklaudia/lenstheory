import { aboutPoints } from '../data/studioData'
import Button from './Button'
import Section from './Section'
import SectionHeading from './SectionHeading'

export default function About() {
  return (
    <Section id="about" tone="tint">
      <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
        <figure className="relative">
          <img
            src="/images/portrait-photo.jpg"
            alt="Portrait photograph by Lens Theory"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-xl object-cover object-[center_25%] outline outline-1 outline-offset-[0.6rem] outline-ember"
          />
          <figcaption className="absolute bottom-5 left-5 flex flex-col rounded-lg bg-cream/90 px-5 py-3 text-xs tracking-wide text-ink-soft">
            <span className="font-display text-lg italic tracking-normal text-ink">Studio &amp; on location</span>
            Portraits &middot; Weddings &middot; Families
          </figcaption>
        </figure>

        <div className="flex flex-col items-start">
          <SectionHeading eyebrow="About" number="02" title="Every good photograph starts with a point of view">
            Lens Theory is a photography studio built on honest moments and considered light. We take
            time to understand the people in front of the camera, so the images still feel like you
            years from now.
          </SectionHeading>

          <ul className="mb-8 w-full">
            {aboutPoints.map((point) => (
              <li
                key={point.title}
                className="grid gap-1 border-t border-ink/15 py-4 last:border-b sm:grid-cols-[9rem_1fr] sm:gap-4"
              >
                <h3 className="font-display text-lg text-ember">{point.title}</h3>
                <p className="text-sm text-ink-soft">{point.text}</p>
              </li>
            ))}
          </ul>

          <Button href="#contact" variant="ghost">
            Get in touch
          </Button>
        </div>
      </div>
    </Section>
  )
}