import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { gsap } from 'helpers/gsap'
import cssVar from 'helpers/cssVar'
import { dpr as getDpr, prefersReducedMotion } from 'helpers/device'
import s from './index.module.scss'

const SQUASH = 1.08 // slightly taller than wide
const SPARKS = 44
const STARS = 140
const CYAN = '#3ec5ff' // chromatic-aberration fringe

const easeOutBack = x => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2)

const rgba = (hex, a) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return `rgba(255,178,26,${a})`
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** Wobbly closed outline so the rift feels alive, not a perfect ellipse. */
function rift(cx, cy, R, t, wobble) {
  const path = new Path2D()
  const steps = 80
  for (let k = 0; k <= steps; k++) {
    const a = (k / steps) * Math.PI * 2
    const w = wobble * (0.045 * Math.sin(a * 5 + t * 2.2) + 0.03 * Math.sin(a * 3 - t * 3.1) + 0.015 * Math.sin(a * 11 + t * 6))
    const x = cx + Math.cos(a) * R * (1 + w)
    const y = cy + Math.sin(a) * R * (1 + w) * SQUASH
    if (k === 0) path.moveTo(x, y)
    else path.lineTo(x, y)
  }
  path.closePath()
  return path
}

const newStar = (far = false) => ({
  a: Math.random() * Math.PI * 2,
  z: far ? 1 : 0.15 + Math.random() * 0.85,
  v: 0.18 + Math.random() * 0.35,
  accent: Math.random() < 0.35
})

/**
 * A glowing rift with a hyperspace tunnel inside: stars stream toward the viewer from a
 * vanishing point that follows the pointer, receding rings add depth, and the whole thing
 * tilts in CSS 3D. Canvas 2D + CSS only, no WebGL.
 *
 * ref API: `pulse(strength = 1)` makes it surge (used when a contact message is sent).
 */
const Portal = forwardRef(function Portal({ label = '', tag, className = '' }, ref) {
  const wrapRef = useRef(null)
  const tiltRef = useRef(null)
  const canvasRef = useRef(null)
  const ctrl = useRef({ boost: 0, wake: null })

  useImperativeHandle(
    ref,
    () => ({
      pulse: (strength = 1) => {
        ctrl.current.boost = Math.max(ctrl.current.boost, strength)
        ctrl.current.wake?.()
      }
    }),
    []
  )

  useEffect(() => {
    const wrap = wrapRef.current
    const tilt = tiltRef.current
    const canvas = canvasRef.current
    if (!wrap || !tilt || !canvas) return

    const still = prefersReducedMotion()
    const C = ctrl.current
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, hover: false }
    const stars = Array.from({ length: STARS }, () => newStar())
    const sparks = Array.from({ length: SPARKS }, (_, i) => ({
      a: Math.random() * Math.PI * 2,
      r: 1.03 + Math.random() * 0.16,
      v: 0.35 + Math.random() * 0.9,
      big: Math.random() < 0.25,
      tint: i % 3,
      phase: Math.random() * 6
    }))
    const colors = {
      accent: cssVar('--accent', wrap) || '#ffb21a',
      fg: getComputedStyle(wrap).color || '#ecebe6'
    }
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    let last = performance.now()
    let open = still ? 1 : 0

    const rotX = gsap.quickTo(tilt, 'rotationX', { duration: 0.8, ease: 'power3' })
    const rotY = gsap.quickTo(tilt, 'rotationY', { duration: 0.8, ease: 'power3' })

    const draw = now => {
      if (!w) return
      const ctx = canvas.getContext('2d')
      const ratio = getDpr()
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const t = now / 1000
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      if (!still) {
        open = Math.min(1, open + 0.02)
        if (!ptr.hover) {
          ptr.tx = Math.sin(t * 0.5) * 0.35
          ptr.ty = Math.cos(t * 0.37) * 0.25
        }
        ptr.x += (ptr.tx - ptr.x) * 0.08
        ptr.y += (ptr.ty - ptr.y) * 0.08
        C.boost *= 0.955
        if (C.boost < 0.01) C.boost = 0
      }
      const boost = C.boost

      const cx = w / 2
      const cy = h / 2
      const R = Math.min(w, h / SQUASH) * 0.4 * easeOutBack(open) * (1 + 0.08 * boost)
      if (R < 1) return
      const wob = still ? 0 : 1 + boost
      const vx = cx - ptr.x * R * 0.3 // vanishing point (moves against the pointer = depth)
      const vy = cy - ptr.y * R * 0.3
      const edge = rift(cx, cy, R, t, wob)

      // ── inside the rift ──
      ctx.save()
      ctx.clip(edge)
      ctx.fillStyle = '#050407'
      ctx.fillRect(0, 0, w, h)

      // core glow at the vanishing point
      const core = ctx.createRadialGradient(vx, vy, 0, vx, vy, R * (0.9 + boost * 0.6))
      core.addColorStop(0, rgba(colors.accent, 0.35 + boost * 0.4))
      core.addColorStop(0.45, rgba(colors.accent, 0.08))
      core.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = core
      ctx.fillRect(0, 0, w, h)

      // hyperspace streaks
      ctx.lineCap = 'round'
      const reach = R * 1.4
      for (const st of stars) {
        if (!still) st.z -= st.v * dt * (1 + boost * 5)
        let d = (R * 0.07) / Math.max(0.02, st.z)
        if (st.z <= 0.02 || d > reach) {
          Object.assign(st, newStar(true))
          d = (R * 0.07) / st.z
        }
        const tail = d * (0.82 - boost * 0.25)
        const dx = Math.cos(st.a)
        const dy = Math.sin(st.a) * SQUASH
        ctx.strokeStyle = st.accent ? rgba(colors.accent, 0.9) : `rgba(236,235,230,${0.25 + (1 - st.z) * 0.6})`
        ctx.lineWidth = 0.6 + (1 - st.z) * 1.8
        ctx.beginPath()
        ctx.moveTo(vx + dx * tail, vy + dy * tail)
        ctx.lineTo(vx + dx * d, vy + dy * d)
        ctx.stroke()
      }

      // tunnel rings receding toward the vanishing point
      ctx.lineWidth = 1.5
      for (let k = 1; k <= 5; k++) {
        const f = ((k + (still ? 0 : t * 0.6 * (1 + boost * 3))) % 6) / 6
        ctx.strokeStyle = rgba(colors.accent, 0.35 * (1 - f))
        ctx.stroke(rift(cx + (vx - cx) * f, cy + (vy - cy) * f, R * (1 - f * 0.85), t + k, wob * (1 - f)))
      }

      // dark falloff toward the rim
      const shade = ctx.createRadialGradient(vx, vy, R * 0.4, cx, cy, R * 1.08)
      shade.addColorStop(0, 'rgba(0,0,0,0)')
      shade.addColorStop(1, 'rgba(5,4,7,0.75)')
      ctx.fillStyle = shade
      ctx.fillRect(0, 0, w, h)
      ctx.restore()

      // ── rim: accent glow + cyan chromatic offset ──
      ctx.save()
      ctx.lineWidth = 3 + boost * 2
      ctx.strokeStyle = colors.accent
      ctx.shadowColor = colors.accent
      ctx.shadowBlur = 26 + boost * 30
      ctx.stroke(edge)
      ctx.shadowBlur = 0
      ctx.translate(-2.5, 1.5)
      ctx.lineWidth = 1.5
      ctx.strokeStyle = rgba(CYAN, 0.7)
      ctx.stroke(edge)
      ctx.restore()

      // ── pixel sparks orbiting the rift ──
      if (!still) {
        const px = Math.max(2, Math.round(R / 55))
        for (const sp of sparks) {
          sp.a += sp.v * dt * (1 + boost * 4)
          const rr = R * sp.r * (1 + 0.05 * Math.sin(t * 3 + sp.phase))
          ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(t * 5 + sp.phase))
          ctx.fillStyle = sp.tint === 0 ? colors.accent : sp.tint === 1 ? CYAN : colors.fg
          const size = sp.big ? px * 2 : px
          ctx.fillRect(Math.round(cx + Math.cos(sp.a) * rr), Math.round(cy + Math.sin(sp.a) * rr * SQUASH), size, size)
        }
        ctx.globalAlpha = 1
      }
    }

    const frame = now => {
      raf = 0
      draw(now)
      if ((!still || C.boost > 0) && visible) raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    C.wake = start

    const resize = () => {
      w = wrap.clientWidth
      h = wrap.clientHeight
      if (!w || !h) return
      const ratio = getDpr()
      canvas.width = Math.round(w * ratio)
      canvas.height = Math.round(h * ratio)
      start()
    }

    const onMove = e => {
      if (still) return
      const r = wrap.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      ptr.hover = true
      ptr.tx = nx
      ptr.ty = ny
      rotY(nx * 16)
      rotX(-ny * 12)
    }
    const onLeave = () => {
      ptr.hover = false
      rotX(0)
      rotY(0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) start()
    })
    io.observe(wrap)
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerleave', onLeave)

    return () => {
      C.wake = null
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(tilt)
    }
  }, [])

  return (
    <div ref={wrapRef} className={`${s.portal} ${className}`} data-cursor="none">
      <div ref={tiltRef} className={s.tilt}>
        <canvas ref={canvasRef} className={s.canvas} role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : 'true'} />
        {tag && (
          <span className={s.tag} aria-hidden="true">
            {tag}
          </span>
        )}
      </div>
    </div>
  )
})

export default Portal
