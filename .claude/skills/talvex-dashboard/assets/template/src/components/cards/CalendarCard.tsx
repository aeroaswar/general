const avatars = [
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60',
]

const days = [
  { day: 'Mon', date: 22 },
  { day: 'Tue', date: 23 },
  { day: 'Wed', date: 24, active: true },
  { day: 'Thu', date: 25 },
  { day: 'Fri', date: 26 },
  { day: 'Sat', date: 27 },
]

const times = ['8:00am', '9:00am', '10:00am', '11:00am']

function AvatarGroup({ count }: { count: number }) {
  return (
    <div className="flex">
      {avatars.slice(0, count).map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="w-6 h-6 rounded-full object-cover border-2 border-white"
          style={i > 0 ? { marginLeft: -6 } : undefined}
        />
      ))}
    </div>
  )
}

export default function CalendarCard() {
  return (
    <div className="bg-white/60 backdrop-blur-3xl rounded-3xl p-5 lg:h-full flex flex-col shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[#898989]">July</span>
        <span className="text-base text-[#303030]">August 2024</span>
        <span className="border border-[#898989]/25 rounded-full px-4 py-1 text-sm text-[#898989]">
          September
        </span>
      </div>

      {/* Day headers */}
      <div className="flex ml-14 sm:ml-16 mb-2">
        {days.map((d) => (
          <div
            key={d.date}
            className={`flex-1 text-xs ${
              d.active ? 'text-[#303030]' : 'text-[#898989]'
            }`}
          >
            {d.day} {d.date}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="h-40 lg:flex-1 flex min-h-0">
        {/* Times column */}
        <div className="w-14 sm:w-16 shrink-0 flex flex-col justify-between text-xs text-[#898989] pr-2">
          {times.map((t) => (
            <div key={t}>{t}</div>
          ))}
        </div>

        {/* Event area */}
        <div className="flex-1 relative">
          {/* Dashed vertical column lines */}
          <div className="absolute inset-0 flex">
            {days.map((d) => (
              <div
                key={d.date}
                className="flex-1 border-l border-dashed border-[#898989]/20"
              />
            ))}
          </div>

          {/* Event 1 — Monthly All-Hands */}
          <div
            className="absolute bg-[#303030] rounded-2xl p-2 overflow-hidden"
            style={{ left: '16.66%', right: '33%', top: 4, height: 58 }}
          >
            <div className="text-white text-xs font-medium leading-tight">
              Monthly All-Hands
            </div>
            <div className="text-white/60 text-[10px] hidden sm:block leading-tight">
              Recap milestones across squads
            </div>
            <div className="mt-1">
              <AvatarGroup count={3} />
            </div>
          </div>

          {/* Event 2 — Induction Briefing */}
          <div
            className="absolute bg-white border border-[#898989]/25 rounded-2xl p-2 overflow-hidden"
            style={{ left: '55%', right: '0%', top: 84, height: 56 }}
          >
            <div className="text-[#303030] text-xs font-medium leading-tight">
              Induction Briefing
            </div>
            <div className="text-[#898989] text-[10px] hidden sm:block leading-tight">
              Orientation for new joiners
            </div>
            <div className="mt-1">
              <AvatarGroup count={2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
