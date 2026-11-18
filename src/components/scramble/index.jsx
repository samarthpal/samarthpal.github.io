import { useCallback, useEffect, useRef } from 'react'
import { prefersReducedMotion } from 'helpers/device'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Text that "decodes" from random glyphs. The real text is rendered first and is
 * what screen readers get, so the element is painted immediately (LCP-safe).
 * Only the text node changes — no layout-affecting styles.
 */
export default function Scramble({
  text,
  as: Tag = 'span',
  className = '',
  glyphs = LETTERS,
  duration = 900,
  onMount = true,
  onHover = false,
  ...rest
}) {
  const ref = useRef(null)
  const raf = useRef(0)

  const play = useCallback(() => {
    if (prefersReducedMotion() || !ref.current) return
    cancelAnimationFrame(raf.current)
    const el = ref.current
    const start = performance.now()
    const keepCase = text === text.toLowerCase()

    const step = now => {
      const p = Math.min(1, (now - start) / duration)
      let out = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        const revealAt = 0.25 + (i / Math.max(1, text.length)) * 0.65
        if (ch === ' ' || p >= revealAt) out += ch
        else {
          const g = glyphs[(Math.random() * glyphs.length) | 0]
          out += keepCase ? g.toLowerCase() : g
        }
      }
      el.textContent = out
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [text, glyphs, duration])

  useEffect(() => {
    if (onMount) play()
    return () => cancelAnimationFrame(raf.current)
  }, [onMount, play])

  return (
    <Tag ref={ref} className={className} onMouseEnter={onHover ? play : undefined} {...rest}>
      {text}
    </Tag>
  )
}
