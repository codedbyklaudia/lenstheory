import { useEffect, useState } from 'react'
import { navLinks } from '../data/studioData'
import BasketButton from './BasketButton'
import Button from './Button'

// Small camera-lens mark shown next to the studio name.
function LensMark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}

export default function Header({ basketCount, onOpenBasket }) {
  // STATE 1: has the visitor scrolled down? Starts false (page is at the top).
  const [isScrolled, setIsScrolled] = useState(false)
  // STATE 2: is the mobile menu open?
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // EFFECT: listen to the browser's scroll event and keep `isScrolled` up to date.
  // The returned function removes the listener if the Header ever disappears.
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // EFFECT: while the mobile menu is open, Escape closes it.
  useEffect(() => {
    if (!isMenuOpen) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  // The header is see-through over the hero photo, and turns solid cream once you scroll
  // (or when the mobile menu is open, so the text is always readable).
  const isSolid = isScrolled || isMenuOpen

  const linkClasses =
    'relative py-1 font-medium after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none'

  return (
    <header
      id="top"
      className={`fixed inset-x-0 top-0 z-40 border-b transition duration-300 ${
        isSolid
          ? 'border-line bg-cream/90 text-ink shadow-sm backdrop-blur-md'
          : 'border-cream/25 bg-transparent text-cream'
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8 md:py-4"
      >
        <a href="#top" onClick={closeMenu} className="flex items-center gap-2 font-display text-xl font-semibold">
          <LensMark className={isSolid ? 'text-ember' : 'text-gold'} />
          <span>
            Lens <span className={isSolid ? 'text-ember' : 'text-gold'}>Theory</span>
          </span>
        </a>

        {/* Desktop links (hidden on mobile, shown from md upwards) */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClasses}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-3">
          <a
            href="#contact"
            className={`hidden rounded-full px-5 py-2 font-medium transition md:inline-flex ${
              isSolid ? 'bg-ink text-cream hover:bg-ember' : 'bg-cream text-ink hover:bg-gold'
            }`}
          >
            Book a Session
          </a>

          <BasketButton
            count={basketCount}
            onClick={onOpenBasket}
            className={`p-2 transition ${isSolid ? 'hover:text-ember' : 'hover:text-gold'}`}
          />

          {/* Hamburger (mobile only). The three bars turn into an X when the menu is open. */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="relative size-10 md:hidden"
          >
            <span
              className={`absolute left-2.5 h-0.5 w-5 bg-current transition duration-300 ${
                isMenuOpen ? 'top-[calc(50%-1px)] rotate-45' : 'top-3'
              }`}
            />
            <span
              className={`absolute left-2.5 top-[calc(50%-1px)] h-0.5 w-5 bg-current transition duration-300 ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute left-2.5 h-0.5 w-5 bg-current transition duration-300 ${
                isMenuOpen ? 'bottom-[calc(50%-1px)] -rotate-45' : 'bottom-3'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="animate-menu-in border-t border-line bg-cream text-ink motion-reduce:animate-none md:hidden"
        >
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-2 sm:px-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className="block border-b border-line py-4 font-display text-2xl transition hover:text-ember"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="py-5">
              <Button href="#contact" onClick={closeMenu} className="w-full">
                Book a Session
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}