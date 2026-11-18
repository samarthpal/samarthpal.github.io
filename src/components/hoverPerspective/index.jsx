import { useRef } from 'react'
import { hasFinePointer, prefersReducedMotion } from 'helpers/device'
import s from './index.module.scss'

/**
 * Card hover perspective (ported from the DaemonHive site's HoverPerspective):
 * the card tilts toward the cursor, scales a touch, and a soft glare follows the pointer.
 * On leave it eases back. Mouse/trackpad only; does nothing for touch or reduced motion.
 *
 * @param {object} props
 * @param {number} [props.perspective=800]  px
 * @param {number} [props.maxTilt=10]      degrees at the card edge
 * @param {number} [props.scale=1.03]
 * @param {string} [props.glareColor]      "r,g,b"
 * @param {number} [props.glareOpacity=0.12]
 * @param {number} [props.glareRadius=60]  % of the card
 * @param {number} [props.resetMs=500]
 * @param {string} [props.radius]          corner radius, to match the card inside
 */
export default function HoverPerspective({
  children,
  className = '',
  perspective = 800,
  maxTilt = 10,
  scale = 1.03,
  glareColor = '255,178,26',
  glareOpacity = 0.12,
  glareRadius = 60,
  resetMs = 500,
  radius = 'var(--radius)',
  style,
  ...rest
}) {
  const ref = useRef(null)
  const glareRef = useRef(null)
  const enabled = useRef(null)

  const isEnabled = () => {
    if (enabled.current === null) enabled.current = hasFinePointer() && !prefersReducedMotion()
    return enabled.current
  }

  const onMouseMove = e => {
    const el = ref.current
    if (!el || !isEnabled()) return
    el.style.transition = 'none'

    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotateX = ((y - cy) / cy) * -maxTilt
    const rotateY = ((x - cx) / cx) * maxTilt
    el.style.transform =
      `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) ` +
      `scale3d(${scale},${scale},${scale})`

    const glare = glareRef.current
    if (glare) {
      glare.style.transition = 'none'
      glare.style.background =
        `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, ` +
        `rgba(${glareColor},${glareOpacity}) 0%, transparent ${glareRadius}%)`
    }
  }

  const onMouseLeave = () => {
    const el = ref.current
    if (!el || !isEnabled()) return
    el.style.transition = `transform ${resetMs}ms ease-out`
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`
    const glare = glareRef.current
    if (glare) {
      glare.style.transition = `background ${resetMs}ms ease`
      glare.style.background = 'transparent'
    }
  }

  return (
    <div
      ref={ref}
      className={`${s.wrap} ${className}`}
      style={{ borderRadius: radius, ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...rest}
    >
      <div ref={glareRef} className={s.glare} aria-hidden="true" />
      {children}
    </div>
  )
}
