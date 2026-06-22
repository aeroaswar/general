import { useState } from 'react'
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react'

const ITEMS = [
  'Retirement savings',
  'Hardware',
  'Earnings breakdown',
  'Perks & Benefits',
]

export default function AccordionCard() {
  // "Hardware" is expanded by default.
  const [open, setOpen] = useState<string | null>('Hardware')

  return (
    <div className="bg-white/60 backdrop-blur-3xl rounded-3xl overflow-hidden lg:h-full shadow-[0_2px_20px_rgba(0,0,0,0.06)] flex flex-col">
      {ITEMS.map((item, i) => {
        const isOpen = open === item
        return (
          <div key={item} className={i > 0 ? 'border-t border-[#898989]/15' : ''}>
            <button
              onClick={() => setOpen(isOpen ? null : item)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#898989]/8 transition-colors"
            >
              <span className="text-sm text-[#303030]">{item}</span>
              {isOpen ? (
                <ChevronUp size={15} className="text-[#898989]" />
              ) : (
                <ChevronDown size={15} className="text-[#898989]" />
              )}
            </button>

            {/* Only the Hardware row has expandable content */}
            {isOpen && item === 'Hardware' && (
              <div className="px-5 pb-4 pt-3 flex items-center gap-3 border-t border-[#898989]/15">
                <img
                  src="https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=120"
                  alt="ThinkPad Pro"
                  className="w-12 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#303030]">ThinkPad Pro</div>
                  <div className="text-xs text-[#898989]">Edition X1</div>
                </div>
                <button>
                  <MoreVertical size={16} className="text-[#898989]" />
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
