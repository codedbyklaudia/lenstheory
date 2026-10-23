import { useEffect, useRef, useState } from 'react'

// Where the content starts before it slides into place.
const hiddenFrom = {
  up: 'translate-y-10', // starts lower, rises up (default)
  left: '-translate-x-24', // starts to the left, slides right
  right: 'translate-x-24', // starts to the right, slides left
}

// Wraps content so it fades and slides into place the first time it scrolls into view.
//   <Reveal delay={150}>...</Reveal>          rises up
//   <Reveal from="left">...</Reveal>          slides in from the left
// IntersectionObserver tells us when the element enters the screen; we then flip `isVisible`
// once and stop watching. People who prefer reduced motion just see the content straight away.
export default function Reveal({ as: Tag = 'div', from = 'up', delay = 0, className = '', children, ...props }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      // Start a little before the element is fully on screen, so it never feels late.
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:translate-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        isVisible ? 'translate-0 opacity-100' : `${hiddenFrom[from]} opacity-0`
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
