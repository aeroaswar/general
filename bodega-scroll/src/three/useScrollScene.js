import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

/* ----------------------------------------------------------------------------
   useScrollScene — wires Lenis smooth-scroll + ONE GSAP ScrollTrigger that maps
   page scroll (0..1) to scene.setProgress(). Deliberately minimal:
   - exactly one global trigger (no GSAP pinning; the Drop uses CSS sticky), so
     scroll math can't drift (R3).
   - all init gated behind this effect + a ScrollTrigger.refresh() after fonts load.
   - exposes window.__bodega = { snap, play, pause, progress } for verification (R1).
   ---------------------------------------------------------------------------- */
export function useScrollScene(getScene, { enabled, onProgress }) {
  useEffect(() => {
    if (!enabled) return undefined

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({ smoothWheel: true, lerp: 0.1, wheelMultiplier: 1 })
    // Drive Lenis from GSAP's ticker so scroll + tweens share one clock.
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    let paused = false
    const apply = (p) => {
      getScene()?.setProgress(p)
      onProgress?.(p)
    }

    const trigger = ScrollTrigger.create({
      trigger: '#scroll-root',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (!paused) apply(self.progress)
      },
    })

    // Re-measure once fonts/images settle so start/end positions are correct (no FOUC drift).
    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts?.ready) document.fonts.ready.then(refresh)
    window.addEventListener('load', refresh)

    // Verification handle: jump the scene anywhere without scrolling.
    window.__bodega = {
      snap: (p) => {
        paused = true
        lenis.stop()
        apply(Math.min(1, Math.max(0, p)))
      },
      play: () => {
        paused = false
        lenis.start()
      },
      pause: () => {
        paused = true
        lenis.stop()
      },
      progress: () => getScene()?.progress ?? 0,
    }

    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(tick)
      trigger.kill()
      lenis.destroy()
      delete window.__bodega
    }
  }, [enabled, getScene, onProgress])
}
