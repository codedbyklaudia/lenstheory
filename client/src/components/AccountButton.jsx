import { useEffect, useRef, useState } from 'react'
import { accountTabs } from './AccountPage'
import { adminTabs } from './AdminDashboard'
import Icon from './Icon'

// Every tab of the account page (/account) and, for admins, of the dashboard (/admin), as links.
// The pages read ?tab= from the address, so each link opens straight on its tab.
// The lists come from the pages themselves, so a new tab shows up here automatically.
const accountLinks = accountTabs.map((tab) => ({ ...tab, href: `/account?tab=${tab.id}` }))
const studioLinks = adminTabs.map((tab) => ({ ...tab, href: `/admin?tab=${tab.id}` }))

const menuHeading = 'px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-[0.15em] text-ink-soft'

// "Klaudia Smith" -> "KS", "sam" -> "S"
const initialsOf = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

// Gold circle with the user's initials. It pops in when it first appears (i.e. right after signing in).
function Avatar({ user, className = 'size-8 text-sm' }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 animate-pop items-center justify-center rounded-full bg-gold font-display font-semibold text-ink ring-2 ring-gold/30 motion-reduce:animate-none ${className}`}
    >
      {initialsOf(user.name)}
    </span>
  )
}

// ---- Desktop: the pill next to "Book a Session" ------------------------------
// Same shape and height as "Book a Session", but outlined, so the two read as a pair
// without competing. `isSolid` tells us whether the header is over the photo (light text)
// or on cream (dark text).
// The account card lists every tab of "My account" (for everyone), and for admins a second
// column, "Studio", with every tab of the admin dashboard.
export default function AccountButton({ user, isAdmin, isSolid, onSignIn, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  // EFFECT: while the account card is open, a click outside it or Escape closes it.
  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event) {
      if (!wrapperRef.current.contains(event.target)) setIsOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const pillClasses = `group hidden items-center gap-2.5 rounded-full border-[1.5px] py-1 pl-1 font-medium transition duration-300 hover:-translate-y-0.5 whitespace-nowrap lg:inline-flex ${
    isSolid ? 'border-ink/20 hover:border-ink' : 'border-cream/40 hover:border-gold'
  }`

  // ---- Signed out: [ (icon) Sign in → ] ----
  if (!user) {
    return (
      <button type="button" onClick={onSignIn} className={`${pillClasses} pr-5`}>
        <span
          className={`flex size-8 items-center justify-center rounded-full transition duration-300 group-hover:bg-gold group-hover:text-ink ${
            isSolid ? 'bg-ink/8' : 'bg-cream/15'
          }`}
        >
          <Icon name="user" />
        </span>
        Sign in
        {/* The arrow is hidden (zero width) until hover, then slides in */}
        <span className="-ml-2.5 w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:w-4 group-hover:opacity-100">
          <Icon name="arrow" />
        </span>
      </button>
    )
  }

  // ---- Signed in: [ (KS) Klaudia ▾ ] + account card ----
  const firstName = user.name.trim().split(/\s+/)[0]

  return (
    <div ref={wrapperRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="account-menu"
        aria-label={`Account: ${user.name}`}
        className={`${pillClasses} pr-3.5`}
      >
        <Avatar user={user} />
        <span className="max-w-[9ch] truncate">{firstName}</span>
        <Icon name="chevron" className={`size-4 transition duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="account-menu"
          className={`absolute right-0 top-[calc(100%+0.75rem)] max-h-[calc(100svh-7rem)] origin-top-right animate-menu-in overflow-y-auto rounded-2xl border border-line bg-cream text-ink shadow-2xl motion-reduce:animate-none ${
            isAdmin ? 'w-[32rem]' : 'w-72'
          }`}
        >
          {/* Who is signed in */}
          <div className="flex items-center gap-3 bg-tint p-4">
            <Avatar user={user} className="size-12 text-lg" />
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-tight">{user.name}</p>
              <p className="truncate text-sm text-ink-soft">{user.email}</p>
            </div>
          </div>

          <div className={`grid p-2 ${isAdmin ? 'grid-cols-2 gap-2' : ''}`}>
            <nav aria-label="My account" className="flex flex-col">
              <p className={menuHeading}>My account</p>
              {accountLinks.map((link) => (
                <a key={link.href} href={link.href} className="group/link flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:translate-x-1 hover:bg-tint">
                  <Icon name={link.icon} className="size-4.5 text-ember transition duration-300 group-hover/link:-rotate-12 group-hover/link:scale-125" />
                  {link.label}
                </a>
              ))}
            </nav>

            {isAdmin && (
              <nav aria-label="Studio dashboard" className="flex flex-col border-l border-line pl-2">
                <p className={`${menuHeading} flex items-center gap-2`}>
                  <Icon name="dashboard" className="size-3.5 text-ember" />
                  Studio
                </p>
                {studioLinks.map((link) => (
                  <a key={link.href} href={link.href} className="rounded-xl px-3 py-1.5 text-sm transition hover:translate-x-1 hover:bg-tint hover:text-ember">
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
          </div>

          <div className="flex flex-col border-t border-line p-2">
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-tint"
            >
              <Icon name="calendar" className="size-4.5 text-ember" />
              Book a session
            </a>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                onSignOut()
              }}
              className="group/out flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-ember hover:text-cream"
            >
              <Icon
                name="logout"
                className="size-4.5 text-ember transition group-hover/out:translate-x-0.5 group-hover/out:text-cream"
              />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Mobile: the account block inside the hamburger menu ----------------------
// `onDone` closes the menu before signing in/out.
export function MobileAccount({ user, isAdmin, onSignIn, onSignOut, onDone }) {
  if (!user) {
    return (
      <button
        type="button"
        onClick={() => {
          onDone()
          onSignIn()
        }}
        className="group flex w-full items-center gap-3 rounded-full border-[1.5px] border-ink/20 py-1.5 pl-1.5 pr-5 font-medium transition hover:border-ink"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-ink/8 transition group-hover:bg-gold">
          <Icon name="user" className="size-5" />
        </span>
        Sign in or create an account
        <Icon name="arrow" className="ml-auto size-4 transition group-hover:translate-x-1" />
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-2xl bg-tint p-3">
        <Avatar user={user} className="size-11 text-base" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg leading-tight">{user.name}</p>
          <p className="truncate text-sm text-ink-soft">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onDone()
            onSignOut()
          }}
          aria-label="Sign out"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ember transition hover:border-ember hover:bg-ember hover:text-cream"
        >
          <Icon name="logout" className="size-5" />
        </button>
      </div>
      {/* Two columns of tiles, so all four tabs fit without a long scroll */}
      <div className="grid grid-cols-2 gap-2">
        {accountLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center gap-2.5 rounded-2xl border border-ink/15 px-3 py-3 text-sm font-medium transition hover:border-ink"
          >
            <Icon name={link.icon} className="size-5 shrink-0 text-ember" />
            {link.label}
          </a>
        ))}
      </div>
      {isAdmin && (
        <div className="rounded-2xl border border-ink/15 p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-ink-soft">
            <Icon name="dashboard" className="size-4 text-ember" />
            Studio
          </p>
          <div className="flex flex-wrap gap-2">
            {studioLinks.map((link) => (
              <a key={link.href} href={link.href} className="rounded-full bg-tint px-3 py-1.5 text-sm transition hover:bg-ink hover:text-cream">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
