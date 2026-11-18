import { useEffect, useRef } from 'react'
import { gsap } from 'helpers/gsap'
import { hasFinePointer, prefersReducedMotion } from 'helpers/device'
import s from './index.module.scss'

const INTERACTIVE = 'a, button, [data-cursor], input, textarea, select, label, canvas'

/**
 * Trailing block caret that follows the native cursor (which stays visible —
 * this is decoration, not a replacement). Mouse/trackpad only.
 */
export default function Cursor() {
  const ref = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer()) return
    el.style.display = 'block'
    gsap.set(el, { xPercent: -50, yPercent: -50 })
    const fast = prefersReducedMotion() ? 0.01 : 0.35
    const xTo = gsap.quickTo(el, 'x', { duration: fast, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: fast, ease: 'power3' })

    const move = e => {
      el.classList.add(s.visible)
      xTo(e.clientX)
      yTo(e.clientY)
    }
    const over = e => {
      // elements with data-cursor="none" hide the follower entirely (e.g. the portal)
      const hidden = e.target instanceof Element && e.target.closest('[data-cursor="none"]')
      el.classList.toggle(s.hidden, Boolean(hidden))
      if (hidden) return
      const target = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null
      const text = target?.dataset?.cursor && target.dataset.cursor !== 'true' ? target.dataset.cursor : ''
      const isField = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      el.classList.toggle(s.active, Boolean(target) && !isField)
      el.classList.toggle(s.field, Boolean(isField))
      el.classList.toggle(s.withLabel, Boolean(text))
      labelRef.current.textContent = text
    }
    const leave = () => el.classList.remove(s.visible)
    const down = () => el.classList.add(s.down)
    const up = () => el.classList.remove(s.down)

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return (
    <div ref={ref} className={s.cursor} aria-hidden="true">
      <span ref={labelRef} className={s.label} />
    </div>
  )
}
