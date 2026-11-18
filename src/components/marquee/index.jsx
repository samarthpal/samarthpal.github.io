import s from './index.module.scss'

/** CSS-only infinite marquee (no JS per frame). */
export default function Marquee({ items, duration = 40, className = '' }) {
  const group = items.map((text, i) => (
    <span key={i} className={s.item}>
      {text}
      <i className={s.sep} aria-hidden="true">
        ✦
      </i>
    </span>
  ))

  return (
    <div className={`${s.marquee} ${className}`}>
      <span className="sr-only">{items.join(', ')}</span>
      <div className={s.track} style={{ '--dur': `${duration}s` }} aria-hidden="true">
        <div className={s.group}>{group}</div>
        <div className={s.group}>{group}</div>
      </div>
    </div>
  )
}
