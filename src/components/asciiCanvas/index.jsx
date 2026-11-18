import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { CHARSETS, SCRAMBLE_GLYPHS, glyphFor, loadImage, sampleImage, sampleToText, waitForFont } from 'helpers/ascii'
import { PALETTE, quantize } from 'helpers/pixel'
import { dpr as getDpr, prefersReducedMotion } from 'helpers/device'
import s from './index.module.scss'

const CHAR_RATIO = 1.7 // cell height ÷ cell width for a monospace glyph
const FONT_FAMILY = '"JetBrains Mono", ui-monospace, Menlo, monospace'
const INTRO_MS = 1300
const TONES = {
  mono: ['#4a4945', '#9d9c96', '#ecebe6'],
  amber: ['#5a3d06', '#b37a0f', '#ffb21a'],
  phosphor: ['#1d4a19', '#43a83a', '#7cff6b'],
  ink: ['#b9b7ae', '#6b6a64', '#0b0b0c']
}
const HOT = { amber: '#ffb21a', phosphor: '#7cff6b', magenta: '#ff4fd8', ink: '#0b0b0c' }

const drawPhoto = (ctx, img, crop, w, h) => {
  const cr = crop || { x: 0, y: 0, w: 1, h: 1 }
  ctx.drawImage(img, cr.x * img.naturalWidth, cr.y * img.naturalHeight, cr.w * img.naturalWidth, cr.h * img.naturalHeight, 0, 0, w, h)
}

/**
 * Renders an image as ASCII / pixel art / photo on a 2D canvas.
 * Idle by default: the RAF loop only runs during the intro or while the pointer is "heating" glyphs.
 */
const AsciiCanvas = forwardRef(function AsciiCanvas(
  {
    src,
    aspect = 1,
    crop,
    mask,
    contrast = 1.3,
    gamma = 1,
    cols = 72,
    pixelCols = 44,
    mode = 'ascii',
    charset = CHARSETS.classic,
    invert = false,
    tone = 'mono',
    hot = 'amber',
    sourceColor = false,
    interactive = true,
    intro = true,
    onClick,
    label = 'ASCII portrait',
    className = ''
  },
  ref
) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const st = useRef({
    img: null,
    w: 0,
    h: 0,
    rows: 0,
    sample: null,
    colors: null,
    pixels: null,
    heat: null,
    reveal: null,
    introStart: 0,
    introDone: !intro,
    raf: 0,
    visible: true
  })

  // Latest props for the draw loop without re-binding listeners.
  const cfg = useRef({})
  cfg.current = { mode, charset, invert, tone, hot, sourceColor, cols, pixelCols, crop, mask, contrast, gamma, aspect }

  const draw = useCallback(now => {
    const c = cfg.current
    const S = st.current
    const canvas = canvasRef.current
    if (!canvas || !S.img || !S.w) return false
    const ctx = canvas.getContext('2d')
    const ratio = getDpr()
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.clearRect(0, 0, S.w, S.h)

    if (c.mode === 'photo') {
      drawPhoto(ctx, S.img, c.crop, S.w, S.h)
      if (c.mask) {
        // elliptical vignette so the photo melts into the page like the other modes
        ctx.save()
        ctx.globalCompositeOperation = 'destination-in'
        ctx.translate(c.mask.cx * S.w, c.mask.cy * S.h)
        ctx.scale(c.mask.rx * S.w, c.mask.ry * S.h)
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
        g.addColorStop(0, 'rgba(0,0,0,1)')
        g.addColorStop(Math.max(0, 1 - c.mask.soft), 'rgba(0,0,0,1)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(-1, -1, 2, 2)
        ctx.restore()
      }
      return false
    }

    const sample = S.sample
    if (!sample) return false
    const n = sample.cols * sample.rows
    const cw = S.w / sample.cols
    const ch = S.h / sample.rows
    const heat = S.heat
    const introActive = !S.introDone
    const t = introActive ? (now - S.introStart) / INTRO_MS : 1
    let busy = introActive

    if (c.mode === 'pixel') {
      const px = S.pixels
      for (let i = 0; i < n; i++) {
        const idx = px[i]
        if (idx < 0) continue
        if (introActive && t < S.reveal[i]) continue
        const x = i % sample.cols
        const y = (i / sample.cols) | 0
        ctx.fillStyle = heat[i] > 0.15 ? HOT[c.hot] || HOT.amber : PALETTE[idx]
        ctx.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw), Math.ceil(ch))
      }
    } else {
      const tones = TONES[c.tone] || TONES.mono
      ctx.font = `${Math.round(ch)}px ${FONT_FAMILY}`
      ctx.textBaseline = 'top'
      const cs = c.charset

      // pass 0..2 = tone buckets, pass 3 = hot glyphs, pass 4 = intro noise.
      // Source colour draws everything in pass 0 and only changes fillStyle when the colour changes.
      let lastColor = ''
      for (let pass = 0; pass < 5; pass++) {
        if (c.sourceColor && (pass === 1 || pass === 2)) continue
        if (pass < 3 && !c.sourceColor) ctx.fillStyle = tones[pass]
        if (pass === 3) ctx.fillStyle = HOT[c.hot] || HOT.amber
        if (pass === 4) ctx.fillStyle = tones[0]
        for (let i = 0; i < n; i++) {
          const l = sample.lum[i]
          const h = heat[i]
          const hidden = introActive && t < S.reveal[i]
          let glyph
          if (pass === 4) {
            if (!hidden || l < 0.06 || Math.random() > 0.35) continue
            glyph = SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0]
          } else if (pass === 3) {
            if (hidden || h <= 0.12) continue
            glyph = SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0]
          } else {
            if (hidden || h > 0.12) continue
            if (!c.sourceColor) {
              const v = c.invert ? 1 - l : l
              const bucket = v < 0.33 ? 0 : v < 0.62 ? 1 : 2
              if (bucket !== pass) continue
            }
            glyph = glyphFor(l, cs, c.invert)
            if (glyph === ' ') continue
            if (c.sourceColor) {
              const color = S.colors[i]
              if (color !== lastColor) {
                ctx.fillStyle = color
                lastColor = color
              }
            }
          }
          ctx.fillText(glyph, (i % sample.cols) * cw, ((i / sample.cols) | 0) * ch)
        }
      }
    }

    // cool down
    if (heat) {
      for (let i = 0; i < n; i++) {
        if (heat[i] > 0.02) {
          heat[i] *= 0.9
          busy = true
        } else heat[i] = 0
      }
    }
    if (introActive && t >= 1.45) S.introDone = true
    return busy
  }, [])

  const loop = useCallback(() => {
    const S = st.current
    if (S.raf) return
    const frame = now => {
      S.raf = 0
      const busy = draw(now)
      if (busy && S.visible) S.raf = requestAnimationFrame(frame)
    }
    S.raf = requestAnimationFrame(frame)
  }, [draw])

  const rebuild = useCallback(() => {
    const S = st.current
    const c = cfg.current
    if (!S.img || !S.w) return
    const common = { crop: c.crop, mask: c.mask, contrast: c.contrast, gamma: c.gamma }

    if (c.mode === 'pixel') {
      const pc = c.pixelCols
      const rows = Math.max(1, Math.round(pc * (S.h / S.w)))
      S.sample = sampleImage(S.img, { cols: pc, rows, ...common })
      S.pixels = quantize(S.sample)
    } else if (c.mode === 'ascii') {
      const cw = S.w / c.cols
      const rows = Math.max(1, Math.round(S.h / (cw * CHAR_RATIO)))
      S.sample = sampleImage(S.img, { cols: c.cols, rows, ...common })
      // pre-built colour strings (4-bit per channel) for source-colour mode
      const { rgb } = S.sample
      S.colors = Array.from(
        { length: c.cols * rows },
        (_, i) => `rgb(${rgb[i * 3] | 15},${rgb[i * 3 + 1] | 15},${rgb[i * 3 + 2] | 15})`
      )
    } else {
      S.sample = null
    }

    const n = S.sample ? S.sample.cols * S.sample.rows : 0
    S.heat = new Float32Array(n)
    S.reveal = new Float32Array(n)
    if (S.sample) {
      for (let i = 0; i < n; i++) S.reveal[i] = (((i / S.sample.cols) | 0) / S.sample.rows) * 0.55 + Math.random() * 0.45
    }
    loop()
  }, [loop])

  // 1. load image + canvas font
  useEffect(() => {
    let alive = true
    Promise.all([loadImage(src), waitForFont(`16px ${FONT_FAMILY}`)])
      .then(([img]) => {
        if (!alive) return
        st.current.img = img
        setReady(true)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [src])

  // 2. size the canvas to its box
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const resize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!w || !h) return
      const ratio = getDpr()
      st.current.w = w
      st.current.h = h
      canvas.width = Math.round(w * ratio)
      canvas.height = Math.round(h * ratio)
      rebuild()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [ready, rebuild])

  // 3. start intro once ready
  useEffect(() => {
    if (!ready) return
    const S = st.current
    S.introDone = !intro || prefersReducedMotion()
    S.introStart = performance.now()
    rebuild()
  }, [ready, intro, rebuild])

  // 4. rebuild when render settings change
  useEffect(() => {
    if (ready) rebuild()
  }, [ready, mode, charset, invert, cols, pixelCols, contrast, gamma, tone, sourceColor, rebuild])

  // 5. pause when off screen
  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      st.current.visible = e.isIntersecting
      if (e.isIntersecting) loop()
    })
    io.observe(el)
    return () => io.disconnect()
  }, [loop])

  useEffect(() => () => cancelAnimationFrame(st.current.raf), [])

  const onPointerMove = useCallback(
    e => {
      if (!interactive || prefersReducedMotion()) return
      const S = st.current
      const sample = S.sample
      if (!sample || !S.heat) return
      const rect = canvasRef.current.getBoundingClientRect()
      const gx = ((e.clientX - rect.left) / rect.width) * sample.cols
      const gy = ((e.clientY - rect.top) / rect.height) * sample.rows
      const cellAspect = S.h / sample.rows / (S.w / sample.cols)
      const R = Math.max(3, sample.cols / 11)
      const ry = R / cellAspect
      const x0 = Math.max(0, Math.floor(gx - R))
      const x1 = Math.min(sample.cols - 1, Math.ceil(gx + R))
      const y0 = Math.max(0, Math.floor(gy - ry))
      const y1 = Math.min(sample.rows - 1, Math.ceil(gy + ry))
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const dx = x - gx
          const dy = (y - gy) * cellAspect
          const d = Math.sqrt(dx * dx + dy * dy) / R
          if (d >= 1) continue
          const i = y * sample.cols + x
          S.heat[i] = Math.max(S.heat[i], 1 - d)
        }
      }
      loop()
    },
    [interactive, loop]
  )

  useImperativeHandle(
    ref,
    () => ({
      getText: () => (st.current.sample && cfg.current.mode === 'ascii' ? sampleToText(st.current.sample, cfg.current.charset, cfg.current.invert) : ''),
      getCanvas: () => canvasRef.current
    }),
    []
  )

  return (
    <div
      ref={wrapRef}
      className={`${s.wrap} ${ready ? s.ready : ''} ${onClick ? s.clickable : ''} ${className}`}
      style={{ aspectRatio: `1 / ${aspect}` }}
    >
      <canvas
        ref={canvasRef}
        className={s.canvas}
        role="img"
        aria-label={label}
        onPointerMove={onPointerMove}
        onClick={onClick}
      />
    </div>
  )
})

export default AsciiCanvas
