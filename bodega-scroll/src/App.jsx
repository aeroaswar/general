import { useCallback, useRef, useState } from 'react'
import CanvasStage from './components/CanvasStage.jsx'
import ScrollCue from './components/ScrollCue.jsx'
import DebugOverlay from './components/DebugOverlay.jsx'
import CapGrid from './components/CapGrid.jsx'
import Hero from './components/Hero.jsx'
import HiddenDoor from './components/HiddenDoor.jsx'
import Threshold from './components/Threshold.jsx'
import Drop from './components/Drop.jsx'
import Collabs from './components/Collabs.jsx'
import Footer from './components/Footer.jsx'
import { StaticContext } from './components/MotionWrapper.jsx'
import { useScrollScene } from './three/useScrollScene.js'
import { resolveProgress } from './data/sections.js'

// URL params are read once at startup (stable for the page's life):
//   ?cap=<0..1 | section-id>  freeze the scene at one frame (static capture)
//   ?cap=grid                 contact sheet of all key frames
//   ?debug                    live progress/section/fps overlay
const params = new URLSearchParams(window.location.search)
const CAP = params.get('cap')
const DEBUG = params.has('debug')
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const staticProgress = resolveProgress(CAP) // number, or null in live mode
  const isStatic = staticProgress != null || REDUCED

  const sceneRef = useRef(null)
  const getScene = useCallback(() => sceneRef.current, [])
  const onScene = useCallback((s) => { sceneRef.current = s }, [])
  const [progress, setProgress] = useState(staticProgress ?? 0)
  const onProgress = useCallback((p) => { if (DEBUG) setProgress(p) }, [])

  // Scroll wiring only in the live path; static/reduced/grid skip it.
  useScrollScene(getScene, { enabled: !isStatic && CAP !== 'grid', onProgress })

  if (CAP === 'grid') return <CapGrid />

  return (
    <StaticContext.Provider value={isStatic}>
      {DEBUG && <DebugOverlay progress={progress} />}
      <CanvasStage onScene={onScene} staticProgress={staticProgress} reducedMotion={REDUCED} />
      <div className="stage-grain" aria-hidden="true" />
      <main id="scroll-root" className="content">
        <Hero />
        <HiddenDoor />
        <Threshold />
        <Drop />
        <Collabs />
        <Footer />
      </main>
      {!isStatic && <ScrollCue />}
    </StaticContext.Provider>
  )
}
