import { Reveal, Words } from './MotionWrapper.jsx'
import MagneticButton from './MagneticButton.jsx'
import { HERO } from '../data/content.js'

export default function Hero() {
  return (
    <section className="panel" id="hero" aria-labelledby="hero-title">
      <div className="wrap">
        <Reveal as="p" className="kicker">{HERO.kicker}</Reveal>
        <Words as="h1" className="display" words={HERO.headline} delay={0.05} />
        <Reveal className="lede" delay={0.5}>{HERO.sub}</Reveal>
        <Reveal delay={0.65} style={{ marginTop: '2rem' }}>
          <MagneticButton href="#footer">{HERO.cta}</MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
