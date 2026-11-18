import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from 'helpers/gsap'
import scroller from 'helpers/scroller'
import { isTouch, prefersReducedMotion } from 'helpers/device'

/**
 * Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
 * Skipped on touch devices and for reduced motion: native scrolling is better there.
 */
export default function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || isTouch()) return

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true })
    scroller.set(lenis)
    lenis.on('scroll', ScrollTrigger.update)

    const tick = time => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      scroller.set(null)
    }
  }, [])
}
