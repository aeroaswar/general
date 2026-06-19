import { useEffect, useState } from 'react'

const LINKS = [
  { label: 'Shop', href: '#drop' },
  { label: 'Drops', href: '#collabs' },
  { label: 'Stores', href: '#footer' },
  { label: 'About', href: '#door' },
]

// Fixed translucent top bar. Hides on scroll-down, shows on scroll-up.
export default function Nav() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        setHidden(y > 140 && y > last)
        last = y
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav${hidden ? ' nav--hidden' : ''}`}>
      <a className="nav-logo" href="#hero" aria-label="Bodega home">BODEGA</a>
      <nav className="nav-links" aria-label="Primary">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href}>{l.label}</a>
        ))}
      </nav>
      <a className="nav-bag" href="#footer" aria-label="Shopping bag">Bag <span>0</span></a>
    </header>
  )
}
