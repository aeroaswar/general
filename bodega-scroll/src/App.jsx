import { useCallback, useEffect, useRef, useState } from 'react'
import CanvasStage from './components/CanvasStage.jsx'
import ScrollCue from './components/ScrollCue.jsx'
import DebugOverlay from './components/DebugOverlay.jsx'
import CapGrid from './components/CapGrid.jsx'
import Loader from './components/Loader.jsx'
import Nav from './components/Nav.jsx'
import ProgressRail from './components/ProgressRail.jsx'
import Hero from './components/Hero.jsx'
import HiddenDoor from './components/HiddenDoor.jsx'
import Threshold from './components/Threshold.jsx'
import Drop from './components/Drop.jsx'
import Collabs from './components/Collabs.jsx'
import Footer from './components/Footer.jsx'
import { StaticContext } from './components/MotionWrapper.jsx'
import { useScrollScene } from './three/useScrollScene.js'
import { resolveProgress } from './data/sections.js'

// URL params read once at startup (stable for the page's life):
//   ?cap=<0..1 | section-id>  freeze the scene at one frame
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
  const railRef = useRef(null)
  const getScene = useCallback(() => sceneRef.current, [])
  const onScene = useCallback((s) => { sceneRef.current = s }, [])

  const [progress, setProgress] = useState(staticProgress ?? 0)
  // Write progress straight to the rail node (CSS var) every frame — no re-render.
  const onProgress = useCallback((p) => {
    railRef.current?.style.setProperty('--p', String(p))
    if (DEBUG) setProgress(p)
  }, [])

  // Intro loader: dismiss once fonts settle (with a short min) or a hard timeout.
  const [loaded, setLoaded] = useState(isStatic || CAP === 'grid')
  useEffect(() => {
    if (isStatic || CAP === 'grid') return undefined
    let done = false
    const finish = () => { if (!done) { done = true; setLoaded(true) } }
    const hard = setTimeout(finish, 1600)
    if (document.fonts?.ready) document.fonts.ready.then(() => setTimeout(finish, 400))
    return () => clearTimeout(hard)
  }, [])

  useScrollScene(getScene, { enabled: !isStatic && CAP !== 'grid', onProgress })

  if (CAP === 'grid') return <CapGrid />

  return (
    <StaticContext.Provider value={isStatic}>
      {!isStatic && <Loader done={loaded} />}
      {DEBUG && <DebugOverlay progress={progress} />}
      <CanvasStage onScene={onScene} staticProgress={staticProgress} reducedMotion={REDUCED} />
      <div className="stage-grain" aria-hidden="true" />
      <Nav />
      {!isStatic && <ProgressRail ref={railRef} />}
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
