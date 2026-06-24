import ProfilePhotoCard from './cards/ProfilePhotoCard'
import ProgressCard from './cards/ProgressCard'
import TimeTrackerCard from './cards/TimeTrackerCard'
import OnboardingColumn from './cards/OnboardingColumn'
import AccordionCard from './cards/AccordionCard'
import CalendarCard from './cards/CalendarCard'

export default function DashboardGrid() {
  return (
    <>
      {/* ---------- Mobile (<md): single column stack ---------- */}
      <div className="flex md:hidden flex-col gap-3">
        <ProfilePhotoCard />
        <ProgressCard />
        <TimeTrackerCard />
        <OnboardingColumn />
        <AccordionCard />
        <CalendarCard />
      </div>

      {/* ---------- Tablet (md–lg): 2 columns ---------- */}
      <div
        className="hidden md:grid lg:hidden gap-3"
        style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}
      >
        <ProfilePhotoCard />
        <ProgressCard />
        <TimeTrackerCard />
        <AccordionCard />
        <div className="col-span-2">
          <CalendarCard />
        </div>
        <div className="col-span-2">
          <OnboardingColumn />
        </div>
      </div>

      {/* ---------- Desktop (lg+): 4 columns × 2 rows ---------- */}
      <div
        className="hidden lg:grid gap-1 h-full"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: '1fr 1fr',
        }}
      >
        <div className="h-full min-h-0" style={{ gridColumn: '1', gridRow: '1' }}>
          <ProfilePhotoCard />
        </div>
        <div className="h-full min-h-0" style={{ gridColumn: '2', gridRow: '1' }}>
          <ProgressCard />
        </div>
        <div className="h-full min-h-0" style={{ gridColumn: '3', gridRow: '1' }}>
          <TimeTrackerCard />
        </div>
        <div className="h-full min-h-0" style={{ gridColumn: '4', gridRow: '1 / 3' }}>
          <OnboardingColumn />
        </div>
        <div className="h-full min-h-0" style={{ gridColumn: '1', gridRow: '2' }}>
          <AccordionCard />
        </div>
        <div className="h-full min-h-0" style={{ gridColumn: '2 / 4', gridRow: '2' }}>
          <CalendarCard />
        </div>
      </div>
    </>
  )
}
