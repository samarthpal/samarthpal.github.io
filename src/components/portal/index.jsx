import { useEffect, useRef } from 'react'
import { gsap } from 'helpers/gsap'
import { loadImage } from 'helpers/ascii'
import { dpr as getDpr, prefersReducedMotion } from 'helpers/device'
import s from './index.module.scss'

const SQUASH = 1.08 // portal is slightly taller than wide
const SPARKS = 48
const SPARK_COLORS = ['#ff4fd8', '#3ec5ff', '#f4f1ea']
const DEFAULT_FOCUS = { x: 0.56, y: 0.47, size: 0.62 } // face + shoulders of me.jpeg

const easeOutBack = x => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2)

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

/**
 * A portal in the arcade "reality" that looks through to the real photo.
 * Perspective comes from three things: the whole portal tilts in CSS 3D toward the pointer,
 * the photo sits "deeper" and shifts the opposite way (parallax), and receding rings
 * form a tunnel toward a vanishing point. Canvas 2D + CSS only, no WebGL.
 *
 * @param {{ src: string, focus?: {x:number,y:number,size:number}, label?: string, tag?: string }} props
 *   focus: normalised square crop (centre + side) of the source photo.
 */
export default function Portal({ src, focus = DEFAULT_FOCUS, label = '', tag }) {
  const { x: fx, y: fy, size: fsize } = focus
  const wrapRef = useRef(null)
  const tiltRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const tilt = tiltRef.current
    const canvas = canvasRef.current
    if (!wrap || !tilt || !canvas) return

    const still = prefersReducedMotion()
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, hover: false }
    const sparks = Array.from({ length: SPARKS }, (_, i) => ({
      a: Math.random() * Math.PI * 2,
      r: 1.03 + Math.random() * 0.16,
      v: 0.35 + Math.random() * 0.9,
      big: Math.random() < 0.25,
      color: SPARK_COLORS[i % SPARK_COLORS.length],
      phase: Math.random() * 6
    }))
    let img = null
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    let open = still ? 1 : 0

    const rotX = gsap.quickTo(tilt, 'rotationX', { duration: 0.8, ease: 'power3' })
    const rotY = gsap.quickTo(tilt, 'rotationY', { duration: 0.8, ease: 'power3' })

    const draw = now => {
      if (!img || !w) return
      const ctx = canvas.getContext('2d')
      const ratio = getDpr()
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const t = now / 1000

      if (!still) {
        open = Math.min(1, open + 0.02)
        // idle: the vanishing point slowly orbits so the depth reads even without a mouse
        if (!ptr.hover) {
          ptr.tx = Math.sin(t * 0.5) * 0.35
          ptr.ty = Math.cos(t * 0.37) * 0.25
        }
        ptr.x += (ptr.tx - ptr.x) * 0.08
        ptr.y += (ptr.ty - ptr.y) * 0.08
      }

      const cx = w / 2
      const cy = h / 2
      const R = (Math.min(w, h / SQUASH) * 0.4) * easeOutBack(open)
      if (R < 1) return
      const wob = still ? 0 : 1
      const vx = -ptr.x * R * 0.3 // vanishing-point offset (deep things move against the pointer)
      const vy = -ptr.y * R * 0.3
      const edge = rift(cx, cy, R, t, wob)

      // ── through the portal ──
      ctx.save()
      ctx.clip(edge)
      ctx.fillStyle = '#05040c'
      ctx.fillRect(0, 0, w, h)

      const side = fsize * Math.min(img.naturalWidth, img.naturalHeight)
      const sx = fx * img.naturalWidth - side / 2
      const sy = fy * img.naturalHeight - side / 2
      const D = R * 2 * SQUASH * 1.3 // oversized so parallax never shows an edge
      ctx.drawImage(img, sx, sy, side, side, cx - D / 2 + vx, cy - D / 2 + vy, D, D)

      // tunnel rings receding toward the vanishing point
      ctx.lineWidth = 2
      for (let k = 1; k <= 4; k++) {
        const f = k / 5
        ctx.strokeStyle = `rgba(255,79,216,${0.3 * (1 - f)})`
        ctx.stroke(rift(cx + vx * f, cy + vy * f, R * (1 - f * 0.24), t + k * 0.7, wob * (1 - f)))
      }

      // depth shading: darker and pinker toward the rim
      const shade = ctx.createRadialGradient(cx + vx, cy + vy, R * 0.3, cx, cy, R * 1.08)
      shade.addColorStop(0, 'rgba(5,4,12,0)')
      shade.addColorStop(0.7, 'rgba(5,4,12,0.12)')
      shade.addColorStop(1, 'rgba(60,0,70,0.8)')
      ctx.fillStyle = shade
      ctx.fillRect(0, 0, w, h)
      ctx.restore()

      // ── rim: magenta glow + cyan chromatic offset ──
      ctx.save()
      ctx.lineWidth = 3
      ctx.strokeStyle = '#ff4fd8'
      ctx.shadowColor = '#ff4fd8'
      ctx.shadowBlur = 26
      ctx.stroke(edge)
      ctx.shadowBlur = 0
      ctx.translate(-2.5, 1.5)
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(62,197,255,0.9)'
      ctx.stroke(edge)
      ctx.restore()

      // ── pixel sparks orbiting the rift ──
      if (!still) {
        const px = Math.max(2, Math.round(R / 55))
        for (const sp of sparks) {
          sp.a += sp.v * 0.016
          const rr = R * sp.r * (1 + 0.05 * Math.sin(t * 3 + sp.phase))
          const x = cx + Math.cos(sp.a) * rr
          const y = cy + Math.sin(sp.a) * rr * SQUASH
          ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(t * 5 + sp.phase))
          ctx.fillStyle = sp.color
          const size = sp.big ? px * 2 : px
          ctx.fillRect(Math.round(x), Math.round(y), size, size)
        }
        ctx.globalAlpha = 1
      }
    }

    const frame = now => {
      raf = 0
      draw(now)
      if (!still && visible) raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

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

    let alive = true
    loadImage(src)
      .then(loaded => {
        if (!alive) return
        img = loaded
        resize()
      })
      .catch(() => {})

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
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(tilt)
    }
  }, [src, fx, fy, fsize])

  return (
    <div ref={wrapRef} className={s.portal} data-cursor="none">
      <div ref={tiltRef} className={s.tilt}>
        <canvas ref={canvasRef} className={s.canvas} role="img" aria-label={label} />
        {tag && (
          <span className={s.tag} aria-hidden="true">
            {tag}
          </span>
        )}
      </div>
    </div>
  )
}
