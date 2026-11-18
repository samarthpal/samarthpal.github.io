import { gsap, ScrollTrigger, useGSAP } from 'helpers/gsap'

/**
 * Fades/slides in every `[data-reveal]` element inside `scope` as it enters.
 * Elements stay fully visible for reduced motion (nothing is hidden up front).
 * @param {React.RefObject<HTMLElement>} scope
 */
export default function useReveal(scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray('[data-reveal]', scope.current)
        if (!items.length) return
        gsap.set(items, { autoAlpha: 0, y: 36 })
        ScrollTrigger.batch(items, {
          start: 'top 88%',
          once: true,
          onEnter: batch =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true })
        })
      })
    },
    { scope }
  )
}
