import Background from './components/Background'
import Navbar from './components/Navbar'
import WelcomeRow from './components/WelcomeRow'
import DashboardGrid from './components/DashboardGrid'

export default function App() {
  return (
    <div
      className="relative min-h-screen"
      style={{ fontFamily: '"Sofia Pro Regular", sans-serif' }}
    >
      <Background />

      {/* ---------- Desktop (lg+) ---------- */}
      <div className="hidden lg:flex relative z-10 max-w-[1400px] mx-auto h-screen px-6 py-6 flex-col overflow-hidden">
        <Navbar />
        <WelcomeRow />
        <div className="flex-1 min-h-0">
          <DashboardGrid />
        </div>
      </div>

      {/* ---------- Mobile / Tablet (<lg) ---------- */}
      <div className="lg:hidden relative z-10 max-w-[1400px] mx-auto min-h-screen px-4 sm:px-6 py-6 flex flex-col gap-0 overflow-y-auto">
        <Navbar />
        <WelcomeRow />
        <DashboardGrid />
        <div className="h-6" />
      </div>
    </div>
  )
}
