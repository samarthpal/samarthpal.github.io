import { useEffect, useRef } from 'react'
import { hashString, valueNoise } from 'helpers/hash'
import { dpr as getDpr } from 'helpers/device'
import s from './index.module.scss'

const RAMP = ' .:-=+*#%@'
const FONT_FAMILY = '"JetBrains Mono", ui-monospace, Menlo, monospace'

/**
 * Deterministic generative ASCII artwork used as a project "cover".
 * Same seed → same picture, so every case study gets its own identity without shipping screenshots.
 * Draws once when it first nears the viewport, and again on resize.
 */
export default function PatternCover({ seed, accent = '#ffb21a', className = '', label }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const hash = hashString(seed)
    const noise = valueNoise(hash)
    const style = hash % 3
    const cx = 0.25 + ((hash >> 3) % 50) / 100
    const cy = 0.25 + ((hash >> 9) % 50) / 100
    let raf = 0
    let seen = false

    const paint = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!w || !h) return
      const ratio = getDpr()
      canvas.width = Math.round(w * ratio)
      canvas.height = Math.round(h * ratio)
      const ctx = canvas.getContext('2d')
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const cell = Math.max(9, Math.min(15, w / 40))
      const chH = cell * 1.6
      const cols = Math.ceil(w / cell)
      const rows = Math.ceil(h / chH)
      const aspect = w / h
      ctx.font = `${Math.round(chH * 0.92)}px ${FONT_FAMILY}`
      ctx.textBaseline = 'top'

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = x / cols
          const ny = y / rows
          const n = noise(nx * 5 + hash % 7, ny * 5)
          let v
          if (style === 0) {
            v = 0.55 * n + 0.45 * (0.5 + 0.5 * Math.sin((nx * 5 + ny * 2.5) * Math.PI + n * 5))
          } else if (style === 1) {
            const d = Math.hypot((nx - cx) * aspect, ny - cy)
            v = 0.5 + 0.5 * Math.sin(d * 26 - n * 7)
            v *= 1 - Math.min(1, d * 0.9)
          } else {
            const band = Math.sin((nx - ny * 0.6) * 14 + n * 6)
            v = 0.5 + 0.5 * band
            v = v * 0.7 + n * 0.3
          }
          v = Math.pow(Math.max(0, Math.min(1, v)), 1.5)
          const glyph = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))]
          if (glyph === ' ') continue
          ctx.fillStyle = v > 0.72 ? accent : v > 0.42 ? '#77766f' : '#35352f'
          ctx.fillText(glyph, x * cell, y * chH)
        }
      }
    }

    const schedule = () => {
      if (!seen) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(paint)
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !seen) {
          seen = true
          schedule()
        }
      },
      { rootMargin: '400px' }
    )
    io.observe(wrap)
    const ro = new ResizeObserver(schedule)
    ro.observe(wrap)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [seed, accent])

  return (
    <div ref={wrapRef} className={`${s.cover} ${className}`} role={label ? 'img' : undefined} aria-label={label}>
      <canvas ref={canvasRef} className={s.canvas} aria-hidden="true" />
    </div>
  )
}
