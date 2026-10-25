import { useEffect, useState } from 'react'
import { MAX_HOURS } from './data/studioData'
import { apiFetch, useApi } from './lib/api'
import { authClient } from './lib/authClient'
import About from './components/About'
import AdminDashboard from './components/AdminDashboard'
import AuthModal from './components/AuthModal'
import BasketButton from './components/BasketButton'
import BasketDrawer from './components/BasketDrawer'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Gallery from './components/Gallery'
import Header from './components/Header'
import Hero from './components/Hero'
import LensMark from './components/LensMark'
import MarqueeBand from './components/MarqueeBand'
import Services from './components/Services'
import TermsModal from './components/TermsModal'

// Which page to show. The site is one page, except /admin which shows the dashboard instead.
// (No router library needed: we just look at the address once when the app starts.)
const isAdminPage = window.location.pathname.startsWith('/admin')

export default function App() {
  // ---- Data from the API ----
  // Services are used by the service cards and the basket, so App fetches them once.
  const servicesRequest = useApi('/api/services')
  const services = servicesRequest.data ?? []

  // The page's text and images (headlines, about, FAQ, footer...), which admins edit in the dashboard.
  // The page waits for them before showing, so visitors never see empty headings.
  const contentRequest = useApi('/api/content')
  const content = contentRequest.data

  // ---- Who is signed in? ----
  // useSession() asks the server on page load (so a refresh keeps you signed in, thanks to the
  // session cookie) and updates automatically after signing in or out.
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const user = session?.user ?? null
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  // ---- Is the signed-in user an admin? (decides whether to show the "Admin dashboard" link) ----
  // Only the server knows the admin list, so we ask it whenever the user changes.
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    apiFetch('/api/admin/check')
      .then((result) => setIsAdmin(result.isAdmin))
      .catch(() => setIsAdmin(false))
  }, [user?.id])

  // ---- State that more than one component needs lives here, in the parent ----
  const [basket, setBasket] = useState([]) // [{ id: 'portraits', hours: 2 }, ...]
  const [isBasketOpen, setIsBasketOpen] = useState(false)
  const [termsService, setTermsService] = useState(null) // the service whose terms are open, or null
  const [shootType, setShootType] = useState('') // the contact form's "Type of shoot" select

  const basketCount = basket.reduce((total, line) => total + line.hours, 0)

  // State is never changed directly. We give React a NEW array and it re-renders.
  function addToBasket(service, hours) {
    setBasket((current) => {
      const existing = current.find((line) => line.id === service.id)

      if (!existing) return [...current, { id: service.id, hours }]

      return current.map((line) =>
        line.id === service.id ? { ...line, hours: Math.min(line.hours + hours, MAX_HOURS) } : line,
      )
    })
  }

  function changeHours(id, hours) {
    setBasket((current) => current.map((line) => (line.id === id ? { ...line, hours } : line)))
  }

  function removeLine(id) {
    setBasket((current) => current.filter((line) => line.id !== id))
  }

  if (isAdminPage) {
    return (
      <>
        <AdminDashboard
          user={user}
          isSessionPending={isSessionPending}
          onSignIn={() => setIsAuthOpen(true)}
          onSignOut={() => authClient.signOut()}
        />
        {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      </>
    )
  }

  if (!content) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-night px-5 text-center text-cream">
        <LensMark className={`size-12 text-gold ${contentRequest.error ? '' : 'animate-spin motion-reduce:animate-none'}`} />
        {contentRequest.error && <p>Sorry, the site could not be loaded ({contentRequest.error}). Please try again.</p>}
      </div>
    )
  }

  return (
    <>
      <Header
        basketCount={basketCount}
        onOpenBasket={() => setIsBasketOpen(true)}
        user={user}
        isAdmin={isAdmin}
        onSignIn={() => setIsAuthOpen(true)}
        onSignOut={() => authClient.signOut()}
      />

      <main>
        <Hero content={content.hero} />
        <MarqueeBand label="What we photograph" items={content.marquees.top} />
        <Gallery content={content.gallery} />
        <About content={content.about} />
        <Services
          content={content.services}
          services={services}
          error={servicesRequest.error}
          onAddToBasket={addToBasket}
          onShowTerms={setTermsService}
          onEnquire={setShootType}
        />
        <MarqueeBand label="Photography" items={content.marquees.bottom} tone="gold" size="sm" reverse />
        <Contact content={content.contact} shootType={shootType} onShootTypeChange={setShootType} user={user} />
      </main>

      <Footer content={content.footer} studioEmail={content.contact.email} />

      {/* Floating basket button, so the basket is reachable after scrolling */}
      {basketCount > 0 && !isBasketOpen && (
        <BasketButton
          count={basketCount}
          onClick={() => setIsBasketOpen(true)}
          className="fixed bottom-5 right-5 z-40 size-14 rounded-full bg-cream text-ink shadow-xl transition hover:-translate-y-0.5"
        />
      )}

      {isBasketOpen && (
        <BasketDrawer
          basket={basket}
          services={services}
          user={user}
          onSignIn={() => setIsAuthOpen(true)}
          onChangeHours={changeHours}
          onRemove={removeLine}
          onClear={() => setBasket([])}
          onClose={() => setIsBasketOpen(false)}
        />
      )}

      {termsService && <TermsModal service={termsService} onClose={() => setTermsService(null)} />}

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </>
  )
}