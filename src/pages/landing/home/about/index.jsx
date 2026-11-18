import { useRef } from 'react'
import Button from 'components/button'
import { MOTION, ScrollTrigger, gsap, useGSAP } from 'helpers/gsap'
import useChapter from 'hooks/useChapter'
import useReveal from 'hooks/useReveal'
import profile from 'data/profile.json'
import s from './index.module.scss'

export default function About() {
  const root = useRef(null)
  useChapter(root, 'about')
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Words light up as the statement rises into view, and are fully lit by the time it
      // reaches a comfortable reading position, so stopping mid-scroll never leaves it half dim.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const statement = root.current.querySelector('[data-statement]')
        gsap.fromTo(
          statement.querySelectorAll('[data-word]'),
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.05,
            // fully lit as soon as the whole statement is on screen
            scrollTrigger: {
              trigger: statement,
              start: 'top 95%',
              end: 'bottom 82%',
              scrub: 0.3,
              invalidateOnRefresh: true
            }
          }
        )
      })

      // noomo-style hand-off: this chapter stays put and sinks back while Work slides over it
      mm.add(MOTION.desktop, () => {
        const el = root.current
        const scene = { trigger: el, start: 'bottom bottom', end: '+=100%', scrub: true }
        ScrollTrigger.create({ trigger: el, start: 'bottom bottom', end: '+=100%', pin: true, pinSpacing: false })
        gsap.to('[data-about-inner]', { scale: 0.92, yPercent: -2, ease: 'none', scrollTrigger: scene })
        gsap.to('[data-about-shade]', { opacity: 0.7, ease: 'none', scrollTrigger: scene })
      })
    },
    { scope: root }
  )

  const words = profile.statement.split(' ')

  return (
    <section id="about" ref={root} className={s.about} aria-labelledby="about-title">
      <div className={s.inner} data-about-inner>
        <div className={s.head}>
          <span className={s.label}>02 — whoami</span>
          <span className={s.file}>~/about.md</span>
        </div>

        <h2 id="about-title" className="sr-only">
          About Samarth
        </h2>
        <p className={s.statement} data-statement>
          {words.map((w, i) => (
            <span key={i} data-word>
              {w}{' '}
            </span>
          ))}
        </p>

        <div className={s.grid}>
          <div className={s.bio}>
            {profile.bio.map((p, i) => (
              <p key={i} data-reveal>
                {p}
              </p>
            ))}
            <div className={s.actions} data-reveal>
              <Button href="/resume.pdf" download variant="solid" icon="↓">
                Resume (PDF)
              </Button>
              <Button href={profile.companyUrl} external variant="inkGhost" icon="↗">
                daemonhive.com
              </Button>
            </div>
          </div>

          <ul className={s.facts}>
            {profile.facts.map(f => (
              <li key={f.label} className={s.fact} data-reveal>
                <span className={s.value}>{f.value}</span>
                <span className={s.factLabel}>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={s.shade} data-about-shade aria-hidden="true" />
    </section>
  )
}
