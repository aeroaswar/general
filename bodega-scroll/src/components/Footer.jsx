import { Icon } from '@iconify/react'
import { Reveal, Words } from './MotionWrapper.jsx'
import MagneticButton from './MagneticButton.jsx'
import { FOOTER } from '../data/content.js'

export default function Footer() {
  return (
    <section className="panel" id="footer" style={{ alignItems: 'flex-end' }} aria-labelledby="footer-title">
      <div className="wrap foot">
        <div>
          <Words as="h2" id="footer-title" className="display" words={FOOTER.headline} />
          <Reveal className="lede" delay={0.2}>{FOOTER.sub}</Reveal>
        </div>
        <Reveal delay={0.25}>
          <div className="foot-row">
            <MagneticButton href={`mailto:${FOOTER.email}`}>{FOOTER.cta}</MagneticButton>
            <div className="socials">
              {FOOTER.socials.map((s) => (
                <a key={s.id} href={s.href} aria-label={s.label}>
                  <Icon icon={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="foot-links">
            {FOOTER.links.map((l) => (
              <a key={l} href="#">{l}</a>
            ))}
          </div>
        </Reveal>
        <div className="foot-address">No. 6 — a corner you walked past · Open Tue–Sun, 11–7 · Ring the cooler</div>
        <div className="colophon">
          © {new Date().getFullYear()} Bodega-inspired demo. A scroll-driven Three.js + GSAP study. Hidden in plain sight.
        </div>
      </div>
    </section>
  )
}
