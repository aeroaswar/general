import { useState } from 'react'
import { Settings, Bell, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  'Dashboard',
  'People',
  'Hiring',
  'Devices',
  'Apps',
  'Salary',
  'Calendar',
  'Reviews',
]

export default function Navbar() {
  const [active, setActive] = useState('Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  const navButtonClass = (item: string) =>
    `px-4 py-2 rounded-full text-sm transition-all duration-200 ${
      active === item
        ? 'bg-[#303030] text-white'
        : 'text-[#898989] hover:text-[#303030]'
    }`

  return (
    <nav className="mb-4">
      <div className="flex items-center justify-between">
        {/* Left: brand pill */}
        <div className="border border-[#898989]/30 rounded-full px-5 py-2 text-[#303030] text-base select-none">
          Talvex
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Nav links (desktop only) */}
          <div className="hidden lg:flex bg-white/60 border border-[#898989]/20 rounded-full px-1 py-1 shadow-sm">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => setActive(item)}
                className={navButtonClass(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Configs */}
          <button className="hidden sm:flex items-center gap-2 bg-white/60 border border-[#898989]/20 rounded-full px-4 py-2.5 text-sm text-[#303030] shadow-sm hover:bg-white/80 transition-colors">
            <Settings size={14} />
            Configs
          </button>

          {/* Bell */}
          <button className="relative bg-white/60 border border-[#898989]/20 rounded-full px-3.5 py-2.5 shadow-sm hover:bg-white/80 transition-colors">
            <Bell size={15} className="text-[#303030]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FFD85F] rounded-full" />
          </button>

          {/* Profile avatar */}
          <button className="w-10 h-10 rounded-full overflow-hidden border border-[#898989]/20 shrink-0">
            <img
              src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Hamburger (mobile/tablet only) */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/60 border border-[#898989]/20 rounded-full shadow-sm hover:bg-white/80 transition-colors"
          >
            {menuOpen ? (
              <X size={16} className="text-[#303030]" />
            ) : (
              <Menu size={16} className="text-[#303030]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden mt-2 bg-white/80 backdrop-blur-xl border border-[#898989]/20 rounded-2xl p-2 shadow-md flex flex-wrap gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActive(item)
                setMenuOpen(false)
              }}
              className={navButtonClass(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
