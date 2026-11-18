import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether an element is in (or near) the viewport.
 * @param {{ rootMargin?: string, once?: boolean }} options
 * @returns {[React.RefObject<any>, boolean]}
 */
export default function useInView({ rootMargin = '0px', once = false } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) io.disconnect()
      },
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, once])

  return [ref, inView]
}
