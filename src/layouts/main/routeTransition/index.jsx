import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, useGSAP } from 'helpers/gsap'
import hexClip from 'helpers/hexClip'
import { prefersReducedMotion } from 'helpers/device'
import Logo from 'components/logo'
import s from './index.module.scss'

const RIM = 0.45 // rim thickness in vmax

/**
 * On every route change (never on first load, to protect LCP) a dark hive hexagon with a
 * thin amber rim collapses to reveal the new page. Low contrast on purpose: it should feel
 * like a cut, not a flash.
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

      const rim = ref.current.querySelector('[data-rt-rim]')
      const fill = ref.current.querySelector('[data-rt-fill]')
      const hex = { r: 130 }
      const paint = () => {
        rim.style.clipPath = hexClip(hex.r)
        fill.style.clipPath = hexClip(Math.max(0, hex.r - RIM))
      }

      gsap
        .timeline()
        .set(ref.current, { autoAlpha: 1 })
        .call(paint)
        .fromTo('[data-rt-logo]', { scale: 1, autoAlpha: 1 }, { scale: 0.7, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.1)
        .to(hex, { r: 0, duration: 0.85, ease: 'power3.inOut', onUpdate: paint }, 0.15)
        .set(ref.current, { autoAlpha: 0 })
    },
    { dependencies: [pathname], scope: ref }
  )

  return (
    <div ref={ref} className={s.overlay} aria-hidden="true">
      <div className={s.rim} data-rt-rim />
      <div className={s.fill} data-rt-fill>
        <div data-rt-logo>
          <Logo size={64} />
        </div>
      </div>
    </div>
  )
}
