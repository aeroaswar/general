import type { CSSProperties } from 'react'
import { Users, Monitor, type LucideIcon } from 'lucide-react'

type Segment = {
  name: string
  flex: number
  className?: string
  style?: CSSProperties
}

const segments: Segment[] = [
  { name: 'Screenings', flex: 15, className: 'bg-[#303030] text-white' },
  { name: 'Placed', flex: 15, className: 'bg-[#FFD85F] text-[#303030]' },
  {
    name: 'Sprint cycle',
    flex: 60,
    style: {
      background:
        'repeating-linear-gradient(-45deg, #e5e5e5 0px, #e5e5e5 2px, #f5f5f5 2px, #f5f5f5 10px)',
      border: '1px solid #ddd',
    },
  },
  { name: 'Return', flex: 10, className: 'border border-[#898989]/40 bg-white/60' },
]

type Stat = { value: number; label: string; Icon: LucideIcon }

const stats: Stat[] = [
  { value: 78, label: 'Members', Icon: Users },
  { value: 56, label: 'Openings', Icon: Users },
  { value: 203, label: 'Launches', Icon: Monitor },
]

export default function WelcomeRow() {
  return (
    <div className="w-full mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-8">
      {/* Left: greeting + segment bar */}
      <div className="flex-[3] min-w-0">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#303030] leading-tight">
          Good morning, Kasven
        </h1>

        <div className="flex gap-2 mt-4">
          {segments.map((s) => (
            <div key={s.name} style={{ flex: s.flex }} className="min-w-0">
              <div className="text-xs sm:text-sm text-[#303030] mb-1 truncate">
                {s.name}
              </div>
              <div
                className={`rounded-full h-9 ${s.className ?? ''}`}
                style={s.style}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right: stat blocks */}
      <div className="flex-[2] flex gap-6 sm:gap-8">
        {stats.map((s) => {
          const Icon = s.Icon
          return (
            <div key={s.label} className="flex flex-col">
              <div className="bg-[#898989]/15 rounded-lg p-1.5 mb-1 w-fit">
                <Icon size={14} className="text-[#898989]" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl text-[#303030] leading-none">
                {s.value}
              </div>
              <div className="text-xs text-[#303030]">{s.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
