import {
  Monitor,
  Users,
  MessageSquare,
  Pencil,
  Link as LinkIcon,
  Check,
  type LucideIcon,
} from 'lucide-react'

type Task = {
  title: string
  time: string
  done: boolean
  Icon: LucideIcon
}

const tasks: Task[] = [
  { title: 'Screening', time: 'Sep 13 08:30', done: true, Icon: Monitor },
  { title: 'Sync Session', time: 'Sep 13 10:30', done: true, Icon: Users },
  { title: 'Sprint Recap', time: 'Sep 13 13:00', done: false, Icon: MessageSquare },
  { title: 'Set Q3 Targets', time: 'Sep 13 14:45', done: false, Icon: Pencil },
  { title: 'Policy Walkthru', time: 'Sep 13 16:30', done: false, Icon: LinkIcon },
]

const barSegments = [
  { pct: '30%', flex: 30, className: 'bg-[#FFD85F]', label: 'Task', labelClass: 'text-[#303030]' },
  { pct: '25%', flex: 25, className: 'bg-[#303030]' },
  { pct: '20%', flex: 20, className: 'bg-[#898989]' },
]

export default function OnboardingColumn() {
  return (
    <div className="bg-white/60 backdrop-blur-3xl rounded-3xl p-5 flex flex-col gap-4 lg:h-full shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-[#303030]">Induction</h3>
        <div className="text-4xl text-[#303030] leading-none">18%</div>
      </div>

      {/* Stacked bar */}
      <div className="flex gap-2">
        {barSegments.map((seg, i) => (
          <div key={i} style={{ flex: seg.flex }} className="min-w-0">
            <div className="text-xs text-[#898989] mb-1">{seg.pct}</div>
            <div
              className={`rounded-xl h-10 flex items-center px-3 ${seg.className}`}
            >
              {seg.label && (
                <span className={`text-xs ${seg.labelClass ?? ''}`}>
                  {seg.label}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="bg-[#303030] rounded-3xl p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-lg text-white">Pending Actions</h4>
          <div className="text-base text-[#898989]">2/8</div>
        </div>

        {tasks.map((t) => {
          const Icon = t.Icon
          return (
            <div
              key={t.title}
              className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Icon size={13} className="text-white/60" />
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm truncate ${
                    t.done ? 'line-through text-white/30' : 'text-white'
                  }`}
                >
                  {t.title}
                </div>
                <div className="text-xs text-white/30">{t.time}</div>
              </div>

              {t.done ? (
                <div className="w-5 h-5 rounded-full bg-[#FFD85F] flex items-center justify-center shrink-0">
                  <Check size={10} className="text-[#303030]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-white/20 shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
