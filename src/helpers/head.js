const SITE = 'Samarth Pal'
const ORIGIN = 'https://samarthpal.github.io'
const DEFAULT_DESCRIPTION =
  'Samarth Kumar Pal is a full-stack engineer and the co-founder & CTO of DaemonHive Technologies. He builds scalable web platforms with React, Node.js, MongoDB and AWS.'

const setMeta = (selector, attr, value) => {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/** Canonical URL for the current path, always with a trailing slash (how GitHub Pages serves folders). */
const canonical = () => {
  const p = window.location.pathname
  return ORIGIN + (p.endsWith('/') ? p : `${p}/`)
}

/**
 * Sets the document title, description and canonical URL for the current page.
 * The build ships the same values in each page's static HTML (scripts/static-pages.js),
 * so keep the wording in sync there.
 * @param {{ title?: string, description?: string }} meta
 */
export default function head({ title, description = DEFAULT_DESCRIPTION } = {}) {
  const full = title ? `${title} — ${SITE}` : `${SITE} — Co-founder & CTO, DaemonHive Technologies`
  const url = canonical()
  document.title = full
  setMeta('meta[name="description"]', 'content', description)
  setMeta('meta[property="og:title"]', 'content', full)
  setMeta('meta[property="og:description"]', 'content', description)
  setMeta('meta[name="twitter:title"]', 'content', full)
  setMeta('meta[name="twitter:description"]', 'content', description)
  setMeta('link[rel="canonical"]', 'href', url)
  setMeta('meta[property="og:url"]', 'content', url)
}
