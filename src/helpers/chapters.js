// Tiny pub/sub so home sections can tell the nav which chapter is on screen.
export const CHAPTERS = [
  { id: 'hero', index: 1, label: 'boot', theme: 'dark' },
  { id: 'about', index: 2, label: 'whoami', theme: 'light' },
  { id: 'work', index: 3, label: 'work', theme: 'dark' },
  { id: 'arcade', index: 4, label: 'arcade', theme: 'arcade' },
  { id: 'lab', index: 5, label: 'lab', theme: 'dark' },
  { id: 'contact', index: 6, label: 'connect', theme: 'dark' }
]

let current = CHAPTERS[0]
const listeners = new Set()

const chapters = {
  get: () => current,
  byId: id => CHAPTERS.find(c => c.id === id) || CHAPTERS[0],
  set(id) {
    const next = chapters.byId(id)
    if (next === current) return
    current = next
    listeners.forEach(fn => fn(current))
  },
  reset() {
    chapters.set('hero')
  },
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }
}

export default chapters
