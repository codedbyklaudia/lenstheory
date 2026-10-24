import { useEffect, useState } from 'react'
import { navLinks } from '../data/studioData'
import AccountButton, { MobileAccount } from './AccountButton'
import BasketButton from './BasketButton'
import Button from './Button'
import LensMark from './LensMark'

// `user` is the signed-in user from Better Auth, or null when signed out.
export default function Header({ basketCount, onOpenBasket, user, isAdmin, onSignIn, onSignOut }) {
  // STATE 1: has the visitor scrolled down? Starts false (page is at the top).
  const [isScrolled, setIsScrolled] = useState(false)
  // STATE 2: is the mobile menu open?
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // STATE 3: how far down the page we are, from 0 (top) to 1 (bottom). Drives the gold progress line.
  const [scrollProgress, setScrollProgress] = useState(0)

  // EFFECT: listen to the browser's scroll event and keep `isScrolled` and `scrollProgress` up to date.
  // The returned function removes the listener if the Header ever disappears.
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24)
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(scrollable > 0 ? window.scrollY / scrollable : 0)
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

  // See-through over the hero photo, solid cream once you scroll (or when the mobile menu is open).
  const isSolid = isScrolled || isMenuOpen

  const linkClasses =
    'relative py-1 text-[1.05rem] font-medium after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none'

  return (
    <header
      id="top"
      className={`fixed inset-x-0 top-0 z-40 animate-header-in border-b transition duration-300 motion-reduce:animate-none ${
        isSolid
          ? 'border-line bg-cream/90 text-ink shadow-sm backdrop-blur-md'
          : 'border-cream/25 bg-transparent text-cream'
      }`}
    >
      {/* Tall and airy over the hero, then it shrinks smoothly once you start scrolling.
          It uses the full width of the screen: logo on the left, actions on the right,
          and the links exactly centred. From lg upwards it is a 3-column grid (1fr | auto | 1fr):
          the two outer columns are always equal, so the links stay centred whatever is on either side. */}
      <nav
        aria-label="Main navigation"
        className={`flex items-center justify-between gap-4 px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-8 transition-[padding] duration-500 sm:px-8 lg:px-12 xl:px-16 ${
          isScrolled ? 'py-3 md:py-4' : 'py-5 md:py-7'
        }`}
      >
        <a
          href="#top"
          onClick={closeMenu}
          className="group flex items-center gap-2.5 justify-self-start whitespace-nowrap font-display text-2xl font-semibold md:text-3xl"
        >
          <LensMark className={`size-7 md:size-8 ${isSolid ? 'text-ember' : 'text-gold'}`} />
          <span>
            Lens <span className={isSolid ? 'text-ember' : 'text-gold'}>Theory</span>
          </span>
        </a>

        {/* Desktop links (hidden on phones and tablets, shown from lg upwards) */}
        <ul className="hidden items-center justify-center gap-8 lg:flex xl:gap-12 2xl:gap-16">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClasses}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-3 lg:justify-self-end">
          {/* "Sign in" pill, or the signed-in user's chip with an account menu (desktop; mobile is in the menu) */}
          <AccountButton user={user} isAdmin={isAdmin} isSolid={isSolid} onSignIn={onSignIn} onSignOut={onSignOut} />

          {/* Guests get the big "Book a Session" button. Signed-in users already have it in their account menu. */}
          {!user && (
            <a
              href="#contact"
              className={`hidden rounded-full px-6 py-2.5 whitespace-nowrap font-medium transition hover:-translate-y-0.5 lg:inline-flex ${
                isSolid ? 'bg-ink text-cream hover:bg-ember' : 'bg-cream text-ink hover:bg-gold'
              }`}
            >
              Book a Session
            </a>
          )}

          <BasketButton
            count={basketCount}
            onClick={onOpenBasket}
            className={`p-2 transition ${isSolid ? 'hover:text-ember' : 'hover:text-gold'}`}
          />

          {/* Hamburger (phones and tablets). The three bars turn into an X when the menu is open. */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="relative size-10 lg:hidden"
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

      {/* Reading progress: a gold line along the bottom edge that grows as you scroll down the page */}
      <div
        aria-hidden="true"
        style={{ transform: `scaleX(${scrollProgress})` }}
        className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-gold"
      />

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="animate-menu-in border-t border-line bg-cream text-ink motion-reduce:animate-none lg:hidden"
        >
          <ul className="flex flex-col px-5 py-2 sm:px-8">
            {navLinks.map((link, index) => (
              <li
                key={link.href}
                style={{ animationDelay: `${80 + index * 60}ms` }}
                className="animate-fade-up motion-reduce:animate-none"
              >
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className="block border-b border-line py-4 font-display text-2xl transition hover:text-ember"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-5">
              <MobileAccount user={user} isAdmin={isAdmin} onSignIn={onSignIn} onSignOut={onSignOut} onDone={closeMenu} />
            </li>
            <li className="pb-5 pt-3">
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