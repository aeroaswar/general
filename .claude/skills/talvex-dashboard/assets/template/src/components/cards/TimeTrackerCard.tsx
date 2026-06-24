import { Play, Pause, RotateCcw } from 'lucide-react'

const RADIUS = 68
const CIRC = 2 * Math.PI * RADIUS
const PROGRESS = 0.7 // 70% of the circumference

// 60 tick marks; ticks that fall inside the progress arc are hidden.
const ticks = Array.from({ length: 60 }, (_, i) => i).filter(
  (i) => i / 60 >= PROGRESS,
)

export default function TimeTrackerCard() {
  return (
    <div className="bg-white/60 backdrop-blur-3xl rounded-3xl p-5 flex flex-col gap-3 lg:h-full shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
      <h3 className="text-lg text-[#303030]">Focus timer</h3>

      {/* Ring */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <svg
          viewBox="0 0 180 180"
          className="w-[180px] h-[180px] max-w-full"
        >
          {/* Yellow progress arc — 70% of the ring, starting from the top */}
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="#FFD85F"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${PROGRESS * CIRC} ${CIRC}`}
            transform="rotate(-90 90 90)"
          />

          {/* Tick marks in the remaining (unfilled) zone */}
          {ticks.map((i) => {
            const angle = (i * 6 - 90) * (Math.PI / 180)
            const x1 = 90 + (RADIUS - 4) * Math.cos(angle)
            const y1 = 90 + (RADIUS - 4) * Math.sin(angle)
            const x2 = 90 + (RADIUS + 4) * Math.cos(angle)
            const y2 = 90 + (RADIUS + 4) * Math.sin(angle)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#898989"
                strokeOpacity={0.9}
                strokeWidth={1.2}
                strokeLinecap="round"
              />
            )
          })}

          {/* Center labels */}
          <text
            x="90"
            y="88"
            textAnchor="middle"
            fontSize="22"
            fill="#303030"
          >
            02:35
          </text>
          <text
            x="90"
            y="104"
            textAnchor="middle"
            fontSize="10"
            fill="#898989"
          >
            Deep Focus
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Play size={14} className="text-[#303030]" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Pause size={14} className="text-[#303030]" />
          </button>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#303030] flex items-center justify-center">
          <RotateCcw size={14} className="text-white" />
        </button>
      </div>
    </div>
  )
}
