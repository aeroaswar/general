import { Reveal, Words } from './MotionWrapper.jsx'
import { DROP } from '../data/content.js'

/* Drop section is tall; the inner card is CSS-sticky so it "pins" while you scroll
   through it — gives the GSAP-pin feel without the ScrollTrigger pinning risk (R3). */
export default function Drop() {
  const { product } = DROP
  return (
    <section className="panel" id="drop" style={{ minHeight: '185vh', alignItems: 'flex-start' }} aria-labelledby="drop-title">
      <div className="wrap" style={{ position: 'sticky', top: '12vh' }}>
        <Reveal as="p" className="kicker">{DROP.kicker}</Reveal>
        <Words as="h2" id="drop-title" className="display" words={DROP.headline} />
        <div className="drop-grid" style={{ marginTop: '2.4rem' }}>
          <div>
            <Reveal>
              <h3 style={{ fontFamily: 'var(--grotesk)', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.4rem' }}>
                {product.name}
              </h3>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="price-row">
                <span className="price">{product.price}</span>
                <span className="ed">{product.edition}</span>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <a className="btn" href="#footer" style={{ marginTop: '1.6rem' }}>Notify me</a>
            </Reveal>
          </div>
          <div className="specs">
            {product.specs.map((s, i) => (
              <Reveal key={s.label} delay={0.15 + i * 0.08}>
                <div className="spec-card">
                  <div className="l">{s.label}</div>
                  <div className="v">{s.value}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
