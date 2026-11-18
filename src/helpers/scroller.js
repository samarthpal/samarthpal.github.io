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

  /**
   * @param {string} id  section element id
   * @param {{ immediate?: boolean }} [options]  immediate = jump without animating
   *   (used after a page change, so you land on the section instead of watching the page fly by)
   */
  toSection(id, { immediate = false } = {}) {
    if (id === 'hero' || id === 'top') return scroller.toTop(immediate)
    const el = document.getElementById(id)
    if (!el) return
    // Lenis caches the page height; after a route change it may still hold the previous
    // (shorter) page's limit and would clamp the target. Re-measure first.
    lenis?.resize()
    // A pinned section sits inside GSAP's pin-spacer (and reports top: 0 while pinned),
    // so measure the spacer — it always holds the section's real place in the page.
    const parent = el.parentElement
    const target = parent?.classList.contains('pin-spacer') ? parent : el
    const top = target.getBoundingClientRect().top + window.scrollY
    if (lenis) lenis.scrollTo(top, { immediate, duration: 1.4, force: true })
    else window.scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' })
  },

  stop() {
    lenis?.stop()
  },

  start() {
    lenis?.start()
  }
}

export default scroller
