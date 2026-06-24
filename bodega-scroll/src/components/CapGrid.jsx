import { useEffect, useRef } from 'react'
import BodegaScene from '../three/Scene.js'
import { SECTIONS } from '../data/sections.js'

/* ?cap=grid — a deterministic "contact sheet". Each row renders one frozen frame
   at a section's progress, so the whole scroll journey can be eyeballed (and
   screenshotted) in ONE shot without a live browser scroll. Mitigates R1. */
function MiniStage({ progress, w = 960, h = 380 }) {
  const ref = useRef(null)
  useEffect(() => {
    const scene = new BodegaScene(ref.current, { reducedMotion: true, lowPower: true })
    scene.renderer.setSize(w, h, false)
    scene.camera.aspect = w / h
    scene.camera.updateProjectionMatrix()
    scene.setProgress(progress)
    scene.render()
    return () => scene.dispose()
  }, [progress, w, h])
  return <canvas ref={ref} />
}

export default function CapGrid() {
  return (
    <div className="capgrid">
      {SECTIONS.map((s) => (
        <div className="row" key={s.id}>
          <div className="lab">{s.label} · p={s.progress.toFixed(2)} · #{s.id}</div>
          <MiniStage progress={s.progress} />
        </div>
      ))}
    </div>
  )
}
