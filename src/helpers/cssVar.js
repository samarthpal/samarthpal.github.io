/** Reads a CSS custom property from an element (default: <html>), trimmed. */
export default function cssVar(name, el = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim()
}
