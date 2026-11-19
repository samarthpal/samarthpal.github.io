import { useRef } from 'react'
import { Link } from 'react-router-dom'
import HoverPerspective from 'components/hoverPerspective'
import LogoImg from 'components/logoImg'
import ProjectCover from 'components/projectCover'
import { MOTION, gsap, useGSAP } from 'helpers/gsap'
import useChapter from 'hooks/useChapter'
import useReveal from 'hooks/useReveal'
import workFacts from 'helpers/workFacts'
import profile from 'data/profile.json'
import s from './index.module.scss'

const pad = n => String(n).padStart(2, '0')
const DAEMONHIVE = profile.work.filter(w => w.company === 'DaemonHive Technologies')
const JOAHQUIN = profile.work.filter(w => w.company === 'Joahquin Technologies')
const JOAHQUIN_LOGO = profile.experience.find(x => x.id === 'joahquin')?.logo

export default function Work() {
  const root = useRef(null)
  const pinRef = useRef(null)
  const trackRef = useRef(null)
  useChapter(root, 'work')
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION.desktop, () => {
        const track = trackRef.current
        const distance = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth)
        const setProgress = gsap.quickSetter(root.current.querySelector('[data-work-progress]'), 'scaleX')

        const scroll = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pinRef.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: self => setProgress(self.progress)
          }
        })

        // each cover zooms out as its card crosses the screen
        gsap.utils.toArray('[data-card]', track).forEach(card => {
          gsap.fromTo(
            card.querySelector('[data-card-cover]'),
            { scale: 1.3 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: { trigger: card, containerAnimation: scroll, start: 'left right', end: 'right 60%', scrub: true }
            }
          )
        })

        // rounded "sheet" flattens as it covers the previous chapter
        gsap.fromTo(
          root.current,
          { borderTopLeftRadius: 40, borderTopRightRadius: 40 },
          {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: true }
          }
        )
      })

      // phones: the cards are a vertical stack, so each one tilts up out of a 3D lean
      // and grows to full size as it scrolls in, while its cover zooms out to fit
      mm.add(MOTION.mobile, () => {
        gsap.utils.toArray('[data-card]', trackRef.current).forEach(card => {
          const scene = { trigger: card, start: 'top 98%', end: 'top 55%', scrub: 0.5 }
          gsap.fromTo(
            card,
            { rotationX: 18, scale: 0.9, y: 40, autoAlpha: 0.35, transformPerspective: 900, transformOrigin: '50% 100%' },
            { rotationX: 0, scale: 1, y: 0, autoAlpha: 1, ease: 'none', scrollTrigger: scene }
          )
          gsap.fromTo(card.querySelector('[data-card-cover]'), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: scene })
        })
      })
    },
    { scope: root }
  )

  return (
    <section id="work" ref={root} className={s.work} aria-labelledby="work-title">
      <div ref={pinRef} className={s.pin}>
        <header className={s.head}>
          <div className={s.headTop}>
            <span className={s.label}>03 — selected work</span>
            <a href={profile.companyUrl} target="_blank" rel="noopener noreferrer" className={`${s.label} ${s.company}`}>
              {pad(DAEMONHIVE.length)} case studies ·
              <LogoImg src={profile.companyLogo} alt="" className={s.companyLogo} />
              DaemonHive Technologies
            </a>
          </div>
          <h2 id="work-title" className={s.title}>
            Systems <em>shipped.</em>
          </h2>
          <div className={s.progress} aria-hidden="true">
            <i data-work-progress />
          </div>
        </header>

        <ol ref={trackRef} className={s.track}>
          {DAEMONHIVE.map((w, i) => (
            <li key={w.slug} className={s.cardWrap} data-card>
              <HoverPerspective className={s.tilt}>
              <Link to={`/work/${w.slug}`} className={s.card} style={{ '--accent': w.accent }} data-cursor="read">
                <div className={s.cardTop}>
                  <span>
                    {pad(i + 1)}/{pad(DAEMONHIVE.length)}
                  </span>
                  <span>{w.industry}</span>
                </div>
                <div className={s.cover}>
                  <div className={s.coverInner} data-card-cover>
                    <ProjectCover logo={w.logo} seed={w.slug} accent={w.accent} name={w.name} />
                  </div>
                  <span className={s.status}>{w.status}</span>
                </div>
                <h3 className={s.cardTitle}>{w.name}</h3>
                <p className={s.cardText}>{w.summary}</p>
                <dl className={s.facts} aria-label={workFacts(w).title}>
                  {workFacts(w)
                    .items.slice(0, 2)
                    .map(f => (
                      <div key={f.label}>
                        <dt>{f.value}</dt>
                        <dd>{f.label}</dd>
                      </div>
                    ))}
                </dl>
                <ul className={s.chips} aria-label="Stack">
                  {w.stack.slice(0, 5).map(t => (
                    <li key={t}>{t}</li>
                  ))}
                  {w.stack.length > 5 && <li>+{w.stack.length - 5}</li>}
                </ul>
              </Link>
              </HoverPerspective>
            </li>
          ))}
          <li className={s.outro} aria-hidden="true">
            <p>
              Earlier chapters
              <br />
              <span>↓</span>
            </p>
          </li>
        </ol>
      </div>

      <div className={s.more}>
        <div className={s.block}>
          <div className={s.blockHead} data-reveal>
            <span className={s.label}>before DaemonHive</span>
            <h3 className={s.blockTitle}>
              <LogoImg src={JOAHQUIN_LOGO} alt="" className={s.blockLogo} />
              Joahquin Technologies
            </h3>
          </div>
          <ul className={s.rows}>
            {JOAHQUIN.map(w => (
              <li key={w.slug} data-reveal="left">
                <Link to={`/work/${w.slug}`} className={s.row} style={{ '--accent': w.accent }} data-cursor="read">
                  <span className={s.rowName}>
                    <LogoImg src={w.logo} alt="" className={s.blockLogo} />
                    {w.name}
                  </span>
                  <span className={s.rowKind}>{w.industry}</span>
                  <span className={s.rowText}>{w.summary}</span>
                  <span className={s.rowArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={s.block}>
          <div className={s.blockHead} data-reveal>
            <span className={s.label}>archive</span>
            <h3 className={s.blockTitle}>Earlier builds</h3>
          </div>
          <ul className={s.archive}>
            {profile.archive.map(a => (
              <li key={a.name} data-reveal="scale">
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className={s.archiveItem}>
                    <span>{a.name}</span>
                    <span className={s.rowKind}>{a.kind} ↗</span>
                  </a>
                ) : (
                  <span className={s.archiveItem}>
                    <span>{a.name}</span>
                    <span className={s.rowKind}>{a.kind}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
