import { useEffect } from 'react'
import { ScrollTrigger } from 'helpers/gsap'
import chapters from 'helpers/chapters'

/**
 * Marks a section as the active chapter while it crosses the middle of the viewport.
 * Runs in useEffect (after the layout-effect pins exist) so positions include pin spacing.
 * @param {React.RefObject<HTMLElement>} ref
 * @param {string} id  chapter id from helpers/chapters
 */
export default function useChapter(ref, id) {
  useEffect(() => {
    if (!ref.current) return
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: self => self.isActive && chapters.set(id)
    })
    return () => st.kill()
  }, [ref, id])
}
