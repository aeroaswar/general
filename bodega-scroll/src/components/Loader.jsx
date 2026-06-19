// Branded intro overlay — prevents FOUC and sets the tone before the scene reveals.
// Stays mounted but goes pointer-events:none once `done`, then fades out (CSS).
export default function Loader({ done }) {
  return (
    <div className={`loader${done ? ' is-done' : ''}`} aria-hidden={done} role="status">
      <div className="loader-mark">BODEGA</div>
      <div className="loader-bar"><span /></div>
      <div className="loader-cap">finding the door…</div>
    </div>
  )
}
