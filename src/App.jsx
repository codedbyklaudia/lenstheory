import { useState } from 'react'
import { MAX_HOURS } from './data/studioData'
import About from './components/About'
import BasketButton from './components/BasketButton'
import BasketDrawer from './components/BasketDrawer'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Gallery from './components/Gallery'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import TermsModal from './components/TermsModal'

export default function App() {
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

  return (
    <>
      <Header basketCount={basketCount} onOpenBasket={() => setIsBasketOpen(true)} />

      <main>
        <Hero />
        <Gallery />
        <About />
        <Services onAddToBasket={addToBasket} onShowTerms={setTermsService} onEnquire={setShootType} />
        <Contact shootType={shootType} onShootTypeChange={setShootType} />
      </main>

      <Footer />

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
          onChangeHours={changeHours}
          onRemove={removeLine}
          onClear={() => setBasket([])}
          onClose={() => setIsBasketOpen(false)}
        />
      )}

      {termsService && <TermsModal service={termsService} onClose={() => setTermsService(null)} />}
    </>
  )
}