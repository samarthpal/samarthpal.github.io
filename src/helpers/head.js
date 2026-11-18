const SITE = 'Samarth Pal'
const DEFAULT_DESCRIPTION =
  'Samarth Kumar Pal is a full-stack engineer and the co-founder & CTO of DaemonHive Technologies. He builds scalable web platforms with React, Node.js, MongoDB and AWS.'

const setMeta = (selector, attr, value) => {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/**
 * Sets the document title and description for the current page.
 * @param {{ title?: string, description?: string }} meta
 */
export default function head({ title, description = DEFAULT_DESCRIPTION } = {}) {
  const full = title ? `${title} — ${SITE}` : `${SITE} — Co-founder & CTO, DaemonHive Technologies`
  document.title = full
  setMeta('meta[name="description"]', 'content', description)
  setMeta('meta[property="og:title"]', 'content', full)
  setMeta('meta[property="og:description"]', 'content', description)
  setMeta('meta[name="twitter:title"]', 'content', full)
}
