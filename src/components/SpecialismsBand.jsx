import { Fragment } from 'react'
import { specialisms } from '../data/studioData'

export default function SpecialismsBand() {
  return (
    <section aria-label="What we photograph" className="border-b border-line px-5 py-5">
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-display text-lg italic">
        {specialisms.map((name, index) => (
          <Fragment key={name}>
            {index > 0 && (
              <li aria-hidden="true" className="text-xs not-italic text-ember">
                &#10022;
              </li>
            )}
            <li>{name}</li>
          </Fragment>
        ))}
      </ul>
    </section>
  )
}