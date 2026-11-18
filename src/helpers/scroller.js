// Single place that knows whether Lenis is running. Everything else scrolls through here.
let lenis = null

const scroller = {
  set(instance) {
    lenis = instance
  },

  get() {
    return lenis
  },

  toTop(immediate = false) {
    if (lenis) lenis.scrollTo(0, { immediate, force: true, duration: 1.4 })
    else window.scrollTo({ top: 0, behavior: immediate ? 'instant' : 'smooth' })
  },

  toSection(id) {
    if (id === 'hero' || id === 'top') return scroller.toTop()
    const el = document.getElementById(id)
    if (!el) return
    // A pinned section sits inside GSAP's pin-spacer (and reports top: 0 while pinned),
    // so measure the spacer — it always holds the section's real place in the page.
    const parent = el.parentElement
    const target = parent?.classList.contains('pin-spacer') ? parent : el
    const top = target.getBoundingClientRect().top + window.scrollY
    if (lenis) lenis.scrollTo(top, { duration: 1.4, force: true })
    else window.scrollTo({ top, behavior: 'smooth' })
  },

  stop() {
    lenis?.stop()
  },

  start() {
    lenis?.start()
  }
}

export default scroller
