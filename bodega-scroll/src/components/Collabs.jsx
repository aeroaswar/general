import { Reveal, Words } from './MotionWrapper.jsx'
import { COLLABS } from '../data/content.js'

export default function Collabs() {
  return (
    <section className="panel" id="collabs" aria-labelledby="collabs-title">
      <div className="wrap">
        <Reveal as="p" className="kicker">{COLLABS.kicker}</Reveal>
        <Words as="h2" id="collabs-title" className="display" words={COLLABS.headline} />
        <Reveal delay={0.2} style={{ marginTop: '2rem' }}>
          <div className="collab-row" role="list">
            {COLLABS.tiles.map((t) => (
              <article className="collab-card" role="listitem" key={t.id}>
                <span className="tag">{t.tag}</span>
                <h3>{t.title}</h3>
                <p>{t.note}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
