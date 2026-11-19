import { gsap, ScrollTrigger, useGSAP } from 'helpers/gsap'

// Entrance styles, picked per element with data-reveal="…" (empty = "up").
const FROM = {
  up: { y: 36 },
  left: { x: -48 },
  right: { x: 48 },
  scale: { scale: 0.86, y: 20 },
  tilt: { rotationX: 16, y: 44, transformPerspective: 900, transformOrigin: '50% 100%' }
}
const SHOWN = { autoAlpha: 1, x: 0, y: 0, scale: 1, rotationX: 0 }
const fromFor = el => FROM[el.dataset.reveal] || FROM.up

/**
 * Animates every `[data-reveal]` element inside `scope` as it enters the viewport, and
 * reverses it when you scroll back up past it (so it replays on the way down again).
 * Works on touch devices too (no hover needed). Reduced motion: nothing is hidden or moved.
 * @param {React.RefObject<HTMLElement>} scope
 */
export default function useReveal(scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray('[data-reveal]', scope.current)
        if (!items.length) return
        items.forEach(el => gsap.set(el, { autoAlpha: 0, ...fromFor(el) }))

        const show = batch =>
          gsap.to(batch, { ...SHOWN, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true })
        const hide = batch =>
          batch.forEach(el =>
            gsap.to(el, { autoAlpha: 0, x: 0, y: 0, scale: 1, rotationX: 0, ...fromFor(el), duration: 0.5, ease: 'power2.in', overwrite: true })
          )

        ScrollTrigger.batch(items, {
          start: 'top 90%',
          onEnter: show,
          onEnterBack: show,
          onLeaveBack: hide // scrolled back up above its start → play the entrance in reverse
        })
      })
    },
    { scope }
  )
}
