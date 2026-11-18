import { useEffect, useRef, useState } from 'react'
import pixelIcon from 'helpers/pixelIcon'
import { dpr as getDpr } from 'helpers/device'
import s from './index.module.scss'

/**
 * Shows a remote SVG logo as a chunky 8-bit sprite. Falls back to `fallback`
 * (e.g. a pixel-text abbreviation) while loading or when there's no icon.
 */
export default function PixelIcon({ src, size = 64, res = 16, fallback = null, label = '', className = '' }) {
  const canvasRef = useRef(null)
  const [state, setState] = useState(src ? 'loading' : 'none') // loading | ready | none

  useEffect(() => {
    let alive = true
    if (!src) {
      setState('none')
      return
    }
    setState('loading')
    pixelIcon(src, res).then(sprite => {
      if (!alive) return
      if (!sprite || !canvasRef.current) {
        setState('none')
        return
      }
      const canvas = canvasRef.current
      const ratio = getDpr()
      canvas.width = Math.round(size * ratio)
      canvas.height = Math.round(size * ratio)
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height)
      setState('ready')
    })
    return () => {
      alive = false
    }
  }, [src, size, res])

  return (
    <span className={`${s.icon} ${className}`} style={{ width: size, height: size }} role={label ? 'img' : undefined} aria-label={label || undefined}>
      <canvas ref={canvasRef} className={`${s.canvas} ${state === 'ready' ? s.show : ''}`} style={{ width: size, height: size }} aria-hidden="true" />
      {state !== 'ready' && <span className={s.fallback}>{fallback}</span>}
    </span>
  )
}
