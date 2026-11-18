import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Terminal from 'components/terminal'
import useSmoothScroll from 'hooks/useSmoothScroll'
import scroller from 'helpers/scroller'
import chapters from 'helpers/chapters'
import { OPEN_EVENT } from 'helpers/terminal'
import { ScrollTrigger } from 'helpers/gsap'
import Nav from './nav'
import Footer from './footer'
import Cursor from './cursor'
import RouteTransition from './routeTransition'

export default function Main({ children }) {
  const location = useLocation()
  const [terminalOpen, setTerminalOpen] = useState(false)
  const openTerminal = useCallback(() => setTerminalOpen(true), [])
  const closeTerminal = useCallback(() => setTerminalOpen(false), [])

  useSmoothScroll()

  // Route change: jump to top, or to the section a link asked for.
  useEffect(() => {
    const section = location.state?.section
    if (location.pathname !== '/') chapters.reset()
    if (section) {
      // Coming from another page: let Home mount and build its pins, re-measure every
      // scroll scene, then jump straight to the section on the next frame.
      let raf = 0
      const id = setTimeout(() => {
        ScrollTrigger.refresh()
        raf = requestAnimationFrame(() => scroller.toSection(section, { immediate: true }))
      }, 120)
      return () => {
        clearTimeout(id)
        cancelAnimationFrame(raf)
      }
    }
    scroller.toTop(true)
  }, [location.pathname, location.key, location.state])

  // Re-measure scroll scenes whenever a webfont actually finishes loading (the display font
  // reflows headings, which shifts every trigger below them) and once more on full page load.
  // `fonts.ready` alone isn't enough: it can resolve before the font stylesheet has even arrived.
  useEffect(() => {
    let timer = 0
    const refresh = () => {
      clearTimeout(timer)
      timer = setTimeout(() => ScrollTrigger.refresh(), 120)
    }
    document.fonts?.ready?.then(refresh)
    document.fonts?.addEventListener?.('loadingdone', refresh)
    window.addEventListener('load', refresh)
    return () => {
      clearTimeout(timer)
      document.fonts?.removeEventListener?.('loadingdone', refresh)
      window.removeEventListener('load', refresh)
    }
  }, [])

  // ` or ~ toggles the terminal anywhere except while typing in another field.
  useEffect(() => {
    const onKey = e => {
      const t = e.target
      const typing = t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))
      if (e.key === '`' || e.key === '~') {
        if (typing && t.dataset.terminal !== 'overlay') return
        e.preventDefault()
        setTerminalOpen(o => !o)
      } else if (e.key === 'Escape') {
        setTerminalOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_EVENT, openTerminal)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_EVENT, openTerminal)
    }
  }, [openTerminal])

  return (
    <>
      <a className="skip-link" href="#main" onClick={e => (e.preventDefault(), document.getElementById('main')?.focus())}>
        Skip to content
      </a>
      <Nav onTerminal={openTerminal} />
      <div id="main" tabIndex={-1} style={{ outline: 'none' }}>
        {children}
      </div>
      <Footer onTerminal={openTerminal} />
      <Cursor />
      <RouteTransition />
      <Terminal open={terminalOpen} onClose={closeTerminal} />
    </>
  )
}
