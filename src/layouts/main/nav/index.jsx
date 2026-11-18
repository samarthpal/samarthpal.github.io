import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from 'components/logo'
import chapters, { CHAPTERS } from 'helpers/chapters'
import scroller from 'helpers/scroller'
import s from './index.module.scss'

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'stack', label: 'Toolbox' },
  { id: 'contact', label: 'Contact' }
]

const pad = n => String(n).padStart(2, '0')

export default function Nav({ onTerminal }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [chapter, setChapter] = useState(chapters.get())
  const [open, setOpen] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => chapters.subscribe(setChapter), [])
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = id => {
    setOpen(false)
    if (isHome) scroller.toSection(id)
    else navigate('/', { state: { section: id } })
  }

  const theme = isHome ? chapter.theme : 'base'

  return (
    <header className={`${s.nav} ${s[theme] || ''} ${open ? s.isOpen : ''}`}>
      <Link
        to="/"
        className={s.brand}
        aria-label="Samarth Pal — home"
        onClick={e => {
          if (isHome) {
            e.preventDefault()
            go('hero')
          }
        }}
      >
        <Logo size={34} />
        <span className={s.word}>
          samarth<span className={s.dot}>.</span>pal
        </span>
      </Link>

      {isHome && (
        <div className={s.chapter} aria-hidden="true">
          <span className={s.num}>{pad(chapter.index)}</span>
          <span className={s.bar}>
            <i style={{ transform: `scaleX(${chapter.index / CHAPTERS.length})` }} />
          </span>
          <span className={s.num}>{pad(CHAPTERS.length)}</span>
          <span className={s.label}>{chapter.label}</span>
        </div>
      )}

      <button
        type="button"
        className={s.burger}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen(o => !o)}
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <i />
        <i />
      </button>

      <nav id="site-menu" className={s.links} aria-label="Primary">
        {LINKS.map(l => (
          <button key={l.id} type="button" className={s.link} onClick={() => go(l.id)}>
            {l.label}
          </button>
        ))}
        <Link to="/playground" className={`${s.link} ${pathname === '/playground' ? s.active : ''}`}>
          Lab
        </Link>
        <button
          type="button"
          className={s.term}
          onClick={() => {
            setOpen(false)
            onTerminal()
          }}
          data-cursor="open"
        >
          <span aria-hidden="true">~/</span>terminal
          <kbd className={s.kbd} aria-hidden="true">
            `
          </kbd>
        </button>
      </nav>
    </header>
  )
}
