import { aboutPoints } from '../data/studioData'
import Button from './Button'
import Doodle from './Doodle'
import Reveal from './Reveal'
import Section from './Section'
import SectionHeading from './SectionHeading'
import SpinningBadge from './SpinningBadge'

export default function About() {
  return (
    <Section id="about" tone="tint">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
        <Reveal as="figure" className="group relative mx-auto w-full max-w-2xl">
          {/* The wrapper clips the photo, so it can slowly zoom on hover without spilling out */}
          <div className="overflow-hidden rounded-2xl outline outline-1 outline-offset-[0.75rem] outline-ember">
            <img
              src="/images/portrait-photo.jpg"
              alt="Portrait photograph by Lens Theory"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover object-[center_25%] transition duration-[1.5s] ease-out group-hover:scale-105 motion-reduce:transition-none"
            />
          </div>

          {/* Spinning badge hanging off the top corner, with a little heart in the middle */}
          <SpinningBadge
            text="Natural light · Honest moments · "
            repeat={1}
            id="about-ring"
            className="absolute -right-4 -top-10 size-32 rounded-full bg-cream shadow-xl sm:-right-10 sm:size-40"
            ringClassName="text-ink"
          >
            <Doodle name="heart" className="size-10 animate-wiggle text-ember sm:size-12" />
          </SpinningBadge>

          {/* A polaroid doodle tilting at the bottom-left corner */}
          <Doodle name="polaroid" className="absolute -bottom-10 -left-6 size-20 animate-float text-ember sm:-left-12 sm:size-24" />

          <figcaption className="absolute bottom-5 right-5 flex flex-col rounded-lg bg-cream/90 px-5 py-3 text-xs tracking-wide text-ink-soft backdrop-blur-sm transition duration-500 group-hover:-translate-y-1">
            <span className="font-display text-lg italic tracking-normal text-ink">Studio &amp; on location</span>
            Portraits &middot; Weddings &middot; Families
          </figcaption>
        </Reveal>

        <div className="flex flex-col items-start">
          <SectionHeading
            eyebrow="About"
            number="02"
            title={
              <>
                Every good photograph starts with a <em>point of view</em>
              </>
            }
          >
            Lens Theory is a photography studio built on honest moments and considered light. We take
            time to understand the people in front of the camera, so the images still feel like you
            years from now.
          </SectionHeading>

          {/* The three ideas, as a big numbered list */}
          <ul className="mb-10 w-full">
            {aboutPoints.map((point, index) => (
              <Reveal as="li" key={point.title} delay={index * 120}>
                <div className="group grid items-baseline gap-2 border-t border-ink/15 py-6 sm:grid-cols-[3rem_14rem_1fr] sm:gap-6 [li:last-child_&]:border-b">
                  <span className="font-display text-lg italic text-ember">0{index + 1}</span>
                  <h3 className="font-display text-2xl text-ink transition duration-300 group-hover:translate-x-2 group-hover:text-ember sm:text-3xl">
                    {point.title}
                  </h3>
                  <p className="text-ink-soft">{point.text}</p>
                </div>
              </Reveal>
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
