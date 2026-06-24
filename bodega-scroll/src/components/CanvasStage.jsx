import { useEffect, useRef, useState } from 'react'
import BodegaScene from '../three/Scene.js'

/* Fixed full-viewport canvas. Creates one BodegaScene. In normal mode it starts
   the rAF loop (scroll drives setProgress); in static (?cap=) mode it renders a
   single frozen frame. On WebGL failure it shows the CSS fallback hero (a11y). */
export default function CanvasStage({ onScene, staticProgress = null, reducedMotion = false }) {
  const canvasRef = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let scene
    try {
      scene = new BodegaScene(canvasRef.current, {
        reducedMotion,
        lowPower: window.innerWidth < 768,
      })
    } catch (e) {
      console.error('[bodega] WebGL init failed, showing static fallback', e)
      setFailed(true)
      return undefined
    }

    onScene?.(scene)

    const drawStatic = () => {
      scene.setProgress(staticProgress)
      scene.render()
    }

    if (staticProgress != null || reducedMotion) {
      drawStatic()
    } else {
      scene.start()
    }

    const onResize = () => {
      scene.resize()
      if (staticProgress != null || reducedMotion) drawStatic()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      onScene?.(null)
      scene.dispose()
    }
  }, [staticProgress, reducedMotion, onScene])

  if (failed) return <div className="fallback" aria-hidden="true" />
  return <canvas ref={canvasRef} className="stage" aria-hidden="true" />
}
