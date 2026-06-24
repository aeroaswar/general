import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts'

/**
 * Measures an element's box. The dashboard mounts every card across several
 * responsive layouts (only one visible at a time), so instead of Recharts'
 * ResponsiveContainer — which logs width(0)/height(0) warnings for every hidden
 * (display:none) copy — we measure the wrapper ourselves and render the chart at
 * an explicit size only when it's actually visible.
 */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, size }
}

const data = [
  { day: 'S', value: 3.5 },
  { day: 'M', value: 5.0 },
  { day: 'T', value: 4.2 },
  { day: 'W', value: 6.0 },
  { day: 'T', value: 4.8 },
  { day: 'F', value: 7.2 },
  { day: 'S', value: 2.0 },
]

// Tooltip only renders for the Friday bar (value 7.2).
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length && payload[0].value === 7.2) {
    return (
      <div className="bg-[#FFD85F] text-[#303030] text-xs rounded-full px-3 py-1 shadow-md">
        5h 23m
      </div>
    )
  }
  return null
}

export default function ProgressCard() {
  const { ref, size } = useSize<HTMLDivElement>()

  return (
    <div className="bg-white/60 backdrop-blur-3xl rounded-3xl p-5 flex flex-col gap-3 lg:h-full shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-[#303030]">Activity</h3>
        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowUpRight size={16} className="text-[#303030]" />
        </button>
      </div>

      {/* Stat */}
      <div>
        <div className="text-4xl text-[#303030] leading-none">6.1 h</div>
        <div className="text-xs text-[#898989] mt-1">
          Logged hrs <br /> this week
        </div>
      </div>

      {/* Bar chart — rendered at an explicit measured size when visible */}
      <div ref={ref} className="h-48 lg:flex-1 lg:h-auto min-h-0">
        {size.w > 0 && size.h > 0 && (
          <BarChart
            width={size.w}
            height={size.h}
            data={data}
            barCategoryGap="30%"
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              height={20}
              tick={{
                fill: '#898989',
                fontSize: 11,
                fontFamily: 'Sofia Pro Regular',
              }}
            />
            {/* Hidden axis anchors the bar scale so bars stay readable;
                without it Recharts auto-inflates the Y domain. */}
            <YAxis hide domain={[0, 8]} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
              position={{ y: -30 }}
            />
            <Bar dataKey="value" radius={[6, 6, 6, 6]} isAnimationActive={false}>
              {data.map((_, index) => (
                <Cell key={index} fill={index === 5 ? '#FFD85F' : '#303030'} />
              ))}
            </Bar>
          </BarChart>
        )}
      </div>
    </div>
  )
}
