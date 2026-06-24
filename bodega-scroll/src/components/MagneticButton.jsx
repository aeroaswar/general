import { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

// Anchor that drifts toward the cursor on hover (disabled under reduced motion).
export default function MagneticButton({ href, children, className = 'btn', strength = 0.35, ...rest }) {
  const ref = useRef(null)
  const rm = useReducedMotion()

  const onMove = (e) => {
    if (rm || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - (r.left + r.width / 2)
    const y = e.clientY - (r.top + r.height / 2)
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }
  const reset = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <a
      ref={ref}
      href={href}
      className={`${className} btn--magnetic`}
      onMouseMove={onMove}
      onMouseLeave={reset}
      {...rest}
    >
      {children}
    </a>
  )
}
