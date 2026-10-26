import { useState } from 'react'
import { useApi } from '../lib/api'
import MyDetails from './account/MyDetails'
import MyGallery from './account/MyGallery'
import MyOrders from './account/MyOrders'
import MySessions from './account/MySessions'
import { CameraBuddy } from './Illustrations'
import Button from './Button'
import Doodle, { Squiggle } from './Doodle'
import Icon from './Icon'
import LensMark from './LensMark'
import { gutter } from './Section'

// The customer's own dashboard, shown at /account (App decides which page to show).
// Any signed-in user can open it, and it only ever shows THEIR data:
//   My sessions  -> GET /api/shoots (account/MySessions.jsx)
//   My gallery   -> the same data: the photos of delivered sessions (account/MyGallery.jsx)
//   My orders    -> GET /api/orders (account/MyOrders.jsx)
//   My details   -> Better Auth's own endpoints (account/MyDetails.jsx)
// This file is the frame: the welcome banner, the tabs, and loading the data ONCE, which is then
// passed down to the banner's counters and to whichever tab is open.
// The open tab is kept in the address (/account?tab=gallery), so the account menu can link
// straight to any tab and a page refresh stays on the same one.

// Exported so the account menu (AccountButton) lists exactly the same tabs. `icon` is an Icon name.
export const accountTabs = [
  { id: 'sessions', label: 'My sessions', icon: 'calendar' },
  { id: 'gallery', label: 'My gallery', icon: 'image' },
  { id: 'orders', label: 'My orders', icon: 'bag' },
  { id: 'details', label: 'My details', icon: 'user' },
]

function tabFromAddress() {
  const tab = new URLSearchParams(window.location.search).get('tab')
  return accountTabs.some((t) => t.id === tab) ? tab : 'sessions'
}

export default function AccountPage({ user, isSessionPending, isAdmin, onSignIn, onSignOut }) {
  const [activeTab, setActiveTab] = useState(tabFromAddress)

  function changeTab(tab) {
    setActiveTab(tab)
    // Update the address without reloading the page.
    window.history.replaceState(null, '', `/account?tab=${tab}`)
  }

  return (
    <div className="relative isolate min-h-svh overflow-x-clip bg-tint text-ink">
      {/* Doodles drifting in the page background, behind everything (purely decoration) */}
      {/* (small enough to sit in the side margins, so they never cover the content) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden xl:block">
        <Doodle name="cloud" className="absolute left-2 top-[34rem] size-12 animate-float text-clay" />
        <Doodle name="flower" className="absolute right-2 top-[44rem] size-12 animate-wiggle text-gold" />
        <Doodle name="star" className="absolute left-4 top-[64rem] size-8 animate-twinkle text-gold" />
        <Doodle name="film" className="absolute right-2 top-[84rem] size-12 -rotate-12 text-clay" />
      </div>

      <header className={`flex items-center justify-between gap-4 border-b border-line bg-cream py-4 ${gutter}`}>
        <a href="/" className="group flex items-center gap-2.5 whitespace-nowrap font-display text-xl font-semibold sm:text-2xl">
          <LensMark className="size-7 text-ember transition duration-500 group-hover:rotate-90" />
          <span>
            Lens <span className="text-ember">Theory</span>
          </span>
        </a>
        <div className="flex items-center gap-2 text-sm sm:gap-3">
          {isAdmin && (
            <a href="/admin" className="hidden whitespace-nowrap font-medium text-ink-soft transition hover:text-ember sm:inline">
              Studio dashboard
            </a>
          )}
          <a href="/" className="whitespace-nowrap font-medium text-ink-soft transition hover:text-ember">
            &larr; <span className="hidden sm:inline">Back to </span>site
          </a>
          {user && (
            <Button variant="ghost" size="sm" onClick={onSignOut} className="whitespace-nowrap">
              Sign out
            </Button>
          )}
        </div>
      </header>

      {/* Full width, with the same side gutters as the rest of the site */}
      <main className={`py-8 md:py-12 ${gutter}`}>
        {isSessionPending ? (
          <p className="text-ink-soft">Loading&hellip;</p>
        ) : !user ? (
          <div className="relative mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-line bg-cream p-10 text-center">
            <Doodle name="camera" className="size-16 animate-float text-ember motion-reduce:animate-none" />
            <h1 className="font-display text-3xl">Who&rsquo;s behind the lens?</h1>
            <p className="text-ink-soft">Sign in to see your sessions, photos and orders.</p>
            <Button onClick={onSignIn}>Sign in</Button>
          </div>
        ) : (
          <Account user={user} activeTab={activeTab} onTabChange={changeTab} />
        )}
      </main>
    </div>
  )
}

// Only rendered once we know who is signed in, so the requests below always carry a session.
function Account({ user, activeTab, onTabChange }) {
  const shootsRequest = useApi('/api/shoots')
  const ordersRequest = useApi('/api/orders')

  return (
    <>
      <WelcomeBanner user={user} shoots={shootsRequest.data} orders={ordersRequest.data} onTabChange={onTabChange} />

      {/* The tabs: big and clear, each with its icon and how many things are inside */}
      <div role="tablist" aria-label="Your account" className="mb-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {accountTabs.map((tab) => {
          const isActive = tab.id === activeTab
          const count = tabCount(tab.id, shootsRequest.data, ordersRequest.data)
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`group flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 px-3 py-3 text-sm font-medium transition duration-300 sm:justify-start sm:gap-2.5 sm:px-5 sm:text-base ${
                isActive
                  ? '-rotate-1 border-ink bg-ink text-cream shadow-[4px_4px_0_var(--color-ember)]'
                  : 'border-ink/15 bg-cream text-ink hover:-translate-y-0.5 hover:rotate-1 hover:border-ink'
              }`}
            >
              <Icon name={tab.icon} className={`size-5 transition group-hover:scale-110 ${isActive ? 'text-gold' : 'text-ember'}`} />
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-gold text-ink' : 'bg-tint text-ink-soft'}`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* `key` replays the fade-in each time you switch tab */}
      <div key={activeTab} role="tabpanel" className="animate-fade-up motion-reduce:animate-none">
        {activeTab === 'sessions' && <MySessions request={shootsRequest} onShowGallery={() => onTabChange('gallery')} />}
        {activeTab === 'gallery' && <MyGallery request={shootsRequest} onShowSessions={() => onTabChange('sessions')} />}
        {activeTab === 'orders' && <MyOrders request={ordersRequest} />}
        {activeTab === 'details' && <MyDetails user={user} shoots={shootsRequest.data} orders={ordersRequest.data} />}
      </div>
    </>
  )
}

// How many things a tab holds, for its little counter (0 = no counter).
function tabCount(tabId, shoots, orders) {
  if (tabId === 'sessions') return shoots?.length ?? 0
  if (tabId === 'gallery') return photoCount(shoots)
  if (tabId === 'orders') return orders?.filter((order) => order.status === 'paid').length ?? 0
  return 0
}

const photoCount = (shoots) => shoots?.reduce((sum, shoot) => sum + shoot.photos.length, 0) ?? 0

// ---- The welcome banner -------------------------------------------------------------

// A different friendly line each visit, picked once when the page loads.
const greetings = [
  'Ready for your close-up?',
  'Everything you need, all in one frame.',
  'Lights, camera… your account!',
  'Say cheese! This is your corner of the studio.',
]
const greeting = greetings[Math.floor(Math.random() * greetings.length)]

function WelcomeBanner({ user, shoots, orders, onTabChange }) {
  const firstName = user.name.trim().split(/\s+/)[0]

  // DERIVED DATA: the next session with a date in the future, if there is one.
  const next = (shoots ?? [])
    .filter((shoot) => shoot.status === 'scheduled' && new Date(shoot.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0]
  const daysToGo = next && Math.ceil((new Date(next.scheduledAt) - new Date()) / 86_400_000)

  const stats = [
    { tab: 'sessions', value: shoots?.length, label: 'sessions', doodle: 'camera' },
    { tab: 'gallery', value: shoots && photoCount(shoots), label: 'photos', doodle: 'polaroid' },
    { tab: 'orders', value: orders?.filter((order) => order.status === 'paid').length, label: 'paid orders', doodle: 'heart' },
  ]

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl bg-night p-6 text-cream sm:p-10 xl:px-14">
      {/* Decorative doodles drifting around the edges */}
      <Doodle name="sparkle" className="absolute right-8 top-6 size-8 animate-twinkle text-gold motion-reduce:animate-none" />
      <Doodle name="sparkle" className="absolute right-24 top-16 size-4 animate-twinkle text-cream/70 [animation-delay:1.1s] motion-reduce:animate-none" />
      <Doodle name="sun" className="absolute -bottom-10 -right-6 size-40 animate-slow-spin text-gold/15 motion-reduce:animate-none" />
      <Doodle name="flash" className="absolute bottom-6 left-[42%] hidden size-10 animate-twinkle text-gold/60 [animation-delay:0.6s] lg:block" />
      <Doodle name="film" className="absolute -left-6 -top-4 size-24 -rotate-12 text-cream/10" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="lg:max-w-xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gold">{greeting}</p>
          <h1 className="font-display text-5xl font-medium leading-none tracking-tight sm:text-6xl">
            Hey,{' '}
            <span className="relative inline-block italic text-gold">
              {firstName}!
              <Squiggle delay={300} className="text-gold" />
            </span>
          </h1>

          {/* The most useful thing first: when is the next shoot? */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-cream/10 py-2 pl-2 pr-5 text-sm backdrop-blur">
            <span className="flex size-9 items-center justify-center rounded-full bg-gold text-ink">
              <Icon name="clock" className="size-4.5" />
            </span>
            {next ? (
              <span>
                Next shoot in <strong className="font-display text-lg text-gold">{daysToGo === 1 ? '1 day' : `${daysToGo} days`}</strong>:{' '}
                {next.serviceName}
              </span>
            ) : (
              <span>No shoot booked yet. We&rsquo;ll help you pick a date!</span>
            )}
          </div>
        </div>

        {/* Snappy the camera, waving hello (only where there is room for it) */}
        <div className="hidden flex-1 justify-center self-center xl:flex">
          <CameraBuddy className="w-56 2xl:w-64" />
        </div>

        {/* Little "polaroid" counters; each one opens its tab */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <button
              key={stat.tab}
              type="button"
              onClick={() => onTabChange(stat.tab)}
              style={{ animationDelay: `${index * 120}ms` }}
              className={`group animate-pop rounded-xl bg-cream p-3 pb-2 text-center text-ink shadow-lg transition duration-300 hover:-translate-y-1 hover:rotate-0 motion-reduce:animate-none sm:w-28 ${
                ['-rotate-3', 'rotate-2', '-rotate-1'][index]
              }`}
            >
              <span className="flex aspect-square items-center justify-center rounded-md bg-tint">
                <span className="font-display text-4xl font-medium">{stat.value ?? '–'}</span>
              </span>
              <span className="mt-2 flex items-center justify-center gap-1 text-xs font-medium">
                <Doodle name={stat.doodle} className="size-4 text-ember transition group-hover:scale-125" />
                {stat.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
