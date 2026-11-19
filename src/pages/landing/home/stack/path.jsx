import { useRef } from 'react'
import { Link } from 'react-router-dom'
import HoverPerspective from 'components/hoverPerspective'
import LogoImg from 'components/logoImg'
import { ScrollTrigger, gsap, useGSAP } from 'helpers/gsap'
import profile from 'data/profile.json'
import s from './path.module.scss'

const pad = n => String(n).padStart(2, '0')
const BADGE = { daemonhive: 'now', joahquin: 'before', dit: 'education' }
const LOGOS = {
  daemonhive: profile.companyLogo,
  joahquin: profile.experience.find(x => x.id === 'joahquin')?.logo
}
const shipped = org => profile.work.filter(w => w.company === org)

/**
 * Career path (newest first). A rail fills as you scroll and each step's marker
 * lights up when it's reached.
 */
export default function Path() {
  const root = useRef(null)
  const steps = profile.experience

  useGSAP(
    () => {
      const el = root.current
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          el.querySelector('[data-rail-fill]'),
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 70%', scrub: 0.4 } }
        )
        // a step stays "reached" from the moment it passes 70% of the viewport until the page end
        el.querySelectorAll('[data-step]').forEach(step => {
          ScrollTrigger.create({
            trigger: step,
            start: 'top 70%',
            end: 'max',
            toggleClass: { targets: step, className: s.reached }
          })
        })
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        el.querySelectorAll('[data-step]').forEach(step => step.classList.add(s.reached))
      })
    },
    { scope: root }
  )

  return (
    <div ref={root} className={s.path}>
      <div className={s.rail} aria-hidden="true">
        <i data-rail-fill />
      </div>

      <ol className={s.steps}>
        {steps.map((x, i) => {
          const projects = shipped(x.org)
          const current = x.status === 'ACTIVE'
          return (
            <li key={x.id} className={`${s.step} ${current ? s.current : ''}`} data-step data-reveal="tilt">
              <span className={s.marker} aria-hidden="true" />
              <HoverPerspective perspective={1000} maxTilt={5} scale={1}>
              <article className={s.card}>
                <span className={s.index} aria-hidden="true">
                  {pad(steps.length - i)}
                </span>

                <header className={s.cardHead}>
                  {LOGOS[x.id] && <LogoImg src={LOGOS[x.id]} alt="" className={s.logo} />}
                  <div className={s.who}>
                    <h4 className={s.title}>{x.title}</h4>
                    <p className={s.org}>
                      {x.url ? (
                        <a href={x.url} target="_blank" rel="noopener noreferrer">
                          {x.org} ↗
                        </a>
                      ) : (
                        x.org
                      )}
                    </p>
                  </div>
                  <span className={`${s.badge} ${current ? s.badgeNow : ''}`}>
                    {current && <i aria-hidden="true" />}
                    {BADGE[x.id] || 'before'}
                  </span>
                </header>

                <p className={s.detail}>{x.detail}</p>

                {x.highlights?.length > 0 && (
                  <ul className={s.highlights}>
                    {x.highlights.map(h => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}

                {projects.length > 0 && (
                  <div className={s.shipped}>
                    <span className={s.shippedLabel}>Shipped</span>
                    <ul>
                      {projects.map(p => (
                        <li key={p.slug}>
                          <Link to={`/work/${p.slug}`} className={s.chip} style={{ '--chip': p.accent }}>
                            {p.name.replace(/\s+—.*$/, '')}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {x.id === 'dit' && (
                  <div className={s.shipped}>
                    <span className={s.shippedLabel}>Certified</span>
                    <ul>
                      {profile.certifications.map(c => (
                        <li key={c.name}>
                          <span className={s.chip}>
                            {c.issuer} · {c.name.replace(/\s*\(.*\)/, '')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
              </HoverPerspective>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
