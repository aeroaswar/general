import { createContext, useContext } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// When true (cap/static mode or reduced motion) reveals render plainly, fully visible.
export const StaticContext = createContext(false)

const EASE = [0.16, 1, 0.3, 1] // expo-out, low bounce

// Block reveal: fades/translates in on first view, once.
export function Reveal({ children, delay = 0, y = 26, className, as = 'div', ...rest }) {
  const isStatic = useContext(StaticContext)
  const rm = useReducedMotion()
  const MO = motion[as] || motion.div
  if (isStatic || rm) return <MO className={className} {...rest}>{children}</MO>
  return (
    <MO
      className={className}
      {...rest}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </MO>
  )
}

// Per-word headline stagger.
export function Words({ words, className, as = 'h2', delay = 0 }) {
  const isStatic = useContext(StaticContext)
  const rm = useReducedMotion()
  const Tag = motion[as] || motion.h2
  if (isStatic || rm) {
    return (
      <Tag className={className}>
        {words.map((w, i) => (
          <span className="w" key={i}>{w}</span>
        ))}
      </Tag>
    )
  }
  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <motion.span
          className="w"
          key={i}
          initial={{ opacity: 0, y: '0.4em' }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-8% 0px' }}
          transition={{ duration: 0.7, ease: EASE, delay: delay + i * 0.08 }}
        >
          {w}
        </motion.span>
      ))}
    </Tag>
  )
}
