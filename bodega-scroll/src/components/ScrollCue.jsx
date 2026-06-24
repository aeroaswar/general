// Pure-CSS animated scroll cue (Animista-style keyframes) — keeps the JS thread free.
export default function ScrollCue() {
  return (
    <div className="cue" aria-hidden="true">
      <span className="dot" />
      <span>Scroll to enter</span>
    </div>
  )
}
