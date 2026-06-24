import { Reveal, Words } from './MotionWrapper.jsx'
import { DOOR } from '../data/content.js'

export default function HiddenDoor() {
  return (
    <section className="panel" id="door" aria-labelledby="door-title">
      <div className="wrap">
        <Reveal as="p" className="kicker">{DOOR.kicker}</Reveal>
        <Words as="h2" id="door-title" className="display" words={DOOR.headline} />
        <Reveal className="lede" delay={0.3}>{DOOR.body}</Reveal>
      </div>
    </section>
  )
}
