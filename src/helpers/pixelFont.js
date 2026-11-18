import { ScrollTrigger } from 'helpers/gsap'

const HREF = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
let promise = null

/**
 * Lazy-loads the 8-bit font only when an 8-bit section is close, so it never
 * competes with the hero. Refreshes ScrollTrigger once glyph metrics change.
 */
export default function loadPixelFont() {
  if (promise) return promise
  promise = new Promise(resolve => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = HREF
    link.onload = () => {
      const ready = document.fonts?.load ? document.fonts.load('16px "Press Start 2P"') : Promise.resolve()
      ready.catch(() => {}).finally(() => {
        ScrollTrigger.refresh()
        resolve()
      })
    }
    link.onerror = () => resolve()
    document.head.appendChild(link)
  })
  return promise
}
