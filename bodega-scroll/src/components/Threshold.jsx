import { Reveal, Words } from './MotionWrapper.jsx'
import { THRESHOLD } from '../data/content.js'

export default function Threshold() {
  return (
    <section className="panel" id="threshold" aria-labelledby="threshold-title">
      <div className="wrap" style={{ textAlign: 'center' }}>
        <Reveal as="p" className="kicker">{THRESHOLD.kicker}</Reveal>
        <Words as="h2" id="threshold-title" className="display" words={THRESHOLD.headline} />
        <Reveal className="lede" delay={0.3} style={{ marginInline: 'auto' }}>
          {THRESHOLD.body}
        </Reveal>
      </div>
    </section>
  )
}
