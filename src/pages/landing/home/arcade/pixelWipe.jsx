import { useMemo, useRef } from 'react'
import { gsap, useGSAP } from 'helpers/gsap'
import { seeded } from 'helpers/hash'
import s from './pixelWipe.module.scss'

const COLS = 16
const ROWS = 9

/**
 * Transition strip between Work and the Arcade: blocks of arcade-blue stack up
 * from the bottom like a level loading, scrubbed by scroll.
 */
export default function PixelWipe() {
  const ref = useRef(null)

  // deterministic "random" order so refreshes don't reshuffle the pattern
  const delays = useMemo(() => {
    const rand = seeded(1337)
    return Array.from({ length: COLS * ROWS }, (_, i) => {
      const row = Math.floor(i / COLS)
      return (ROWS - 1 - row) * 0.11 + rand() * 0.16
    })
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cells = gsap.utils.toArray('[data-cell]', ref.current)
        gsap.set(cells, { opacity: 0 })
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'bottom bottom', scrub: true }
        })
        cells.forEach((cell, i) => tl.to(cell, { opacity: 1, duration: 0.04, ease: 'steps(1)' }, delays[i]))
        tl.fromTo('[data-wipe-text]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, ease: 'steps(1)' }, 0.55)
      })
    },
    { scope: ref }
  )

  return (
    <div ref={ref} className={s.wipe} aria-hidden="true">
      <div className={s.grid} style={{ '--cols': COLS, '--rows': ROWS }}>
        {delays.map((_, i) => (
          <i key={i} data-cell />
        ))}
      </div>
      <p className={s.text} data-wipe-text>
        LOADING LEVEL 04<span>…</span>
      </p>
    </div>
  )
}
