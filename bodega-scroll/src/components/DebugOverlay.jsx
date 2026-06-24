import { useEffect, useRef, useState } from 'react'
import { sectionAt } from '../data/sections.js'

/* ?debug — live readout so the scene is diagnosable without Chrome DevTools (R1). */
export default function DebugOverlay({ progress }) {
  const [fps, setFps] = useState(0)
  const frames = useRef(0)
  const last = useRef(performance.now())

  useEffect(() => {
    let raf
    const loop = () => {
      frames.current++
      const now = performance.now()
      if (now - last.current >= 500) {
        setFps(Math.round((frames.current * 1000) / (now - last.current)))
        frames.current = 0
        last.current = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="debug">
      {`progress  ${progress.toFixed(3)}\nsection   ${sectionAt(progress)}\nfps       ${fps}\nviewport  ${window.innerWidth}×${window.innerHeight}`}
    </div>
  )
}
