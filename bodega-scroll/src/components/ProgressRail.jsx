import { forwardRef } from 'react'
import { SECTIONS } from '../data/sections.js'

// Right-side scroll rail. The fill height is driven by a CSS var (--p) that App
// writes every scroll frame straight to this node — no React re-render per frame.
// Dots are anchor jumps to each section beat.
const ProgressRail = forwardRef(function ProgressRail(_props, ref) {
  return (
    <nav className="rail" ref={ref} aria-label="Jump to section">
      <span className="rail-track" aria-hidden="true"><span className="rail-fill" /></span>
      <ul>
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-label={s.label}>
              <span className="rail-dot" />
              <span className="rail-label">{s.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
})

export default ProgressRail
