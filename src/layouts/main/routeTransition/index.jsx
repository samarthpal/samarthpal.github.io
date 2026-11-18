import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, useGSAP } from 'helpers/gsap'
import hexClip from 'helpers/hexClip'
import { prefersReducedMotion } from 'helpers/device'
import Logo from 'components/logo'
import s from './index.module.scss'

/**
 * On every route change (never on first load, to protect LCP) a full-screen hive
 * hexagon collapses to reveal the new page.
 */
export default function RouteTransition() {
  const { pathname } = useLocation()
  const ref = useRef(null)
  const prev = useRef(pathname)

  useGSAP(
    () => {
      // same path = first mount (or StrictMode re-run) → don't cover the LCP paint
      if (prev.current === pathname) return
      prev.current = pathname
      if (prefersReducedMotion()) return
      gsap
        .timeline()
        .set(ref.current, { autoAlpha: 1, clipPath: hexClip(130) })
        .fromTo('[data-rt-logo]', { scale: 1, autoAlpha: 1 }, { scale: 0.6, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.1)
        .to(ref.current, { clipPath: hexClip(0), duration: 0.85, ease: 'power3.inOut' }, 0.15)
        .set(ref.current, { autoAlpha: 0 })
    },
    { dependencies: [pathname], scope: ref }
  )

  return (
    <div ref={ref} className={s.overlay} aria-hidden="true">
      <div data-rt-logo>
        <Logo size={72} />
      </div>
    </div>
  )
}
