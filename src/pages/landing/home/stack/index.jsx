import { useEffect, useRef, useState } from 'react'
import HoverPerspective from 'components/hoverPerspective'
import LogoImg from 'components/logoImg'
import { hasFinePointer, prefersReducedMotion } from 'helpers/device'
import useChapter from 'hooks/useChapter'
import useReveal from 'hooks/useReveal'
import { DEVICON_BASE, SKILL_ICONS } from 'data/skillIcons'
import profile from 'data/profile.json'
import Path from './path'
import s from './index.module.scss'

const ALL = 'All'
// How often I use it. Sorts the wall so daily drivers come first and college-era languages last.
const USAGE = {
  legendary: { rank: 0, label: 'daily' },
  epic: { rank: 1, label: 'regularly' },
  common: { rank: 2, label: 'occasionally' },
  rare: { rank: 3, label: 'used in the past' }
}
const TOOLS = profile.skills
  .flatMap(g => g.items.map(item => ({ ...item, group: g.group })))
  .sort((a, b) => USAGE[a.rarity].rank - USAGE[b.rarity].rank)
const GROUPS = [ALL, ...profile.skills.map(g => g.group)]

const shortName = name => name.replace(/\s*\(.*\)\s*/, '')
const iconUrl = name => (SKILL_ICONS[name] ? DEVICON_BASE + SKILL_ICONS[name] : '')

export default function Stack() {
  const root = useRef(null)
  const wallRef = useRef(null)
  const [tab, setTab] = useState(ALL)
  const [focus, setFocus] = useState(null)
  useChapter(root, 'stack')
  useReveal(root)

  // Spotlight (mouse/trackpad only): every tile gets the cursor position in its own
  // coordinates (--mx/--my), so a soft amber light sweeps across all borders near the cursor,
  // neighbours included. The tilt itself comes from HoverPerspective.
  useEffect(() => {
    const wall = wallRef.current
    if (!wall || !hasFinePointer() || prefersReducedMotion()) return
    let raf = 0
    let ev = null

    const paint = () => {
      raf = 0
      if (!ev) return
      const tiles = wall.querySelectorAll('[data-tile]')
      const rects = Array.from(tiles, t => t.getBoundingClientRect()) // all reads first…
      tiles.forEach((t, i) => {
        // …then all writes, so the browser doesn't recalculate in between
        t.style.setProperty('--mx', `${ev.clientX - rects[i].left}px`)
        t.style.setProperty('--my', `${ev.clientY - rects[i].top}px`)
      })
    }
    const move = e => {
      ev = e
      if (!raf) raf = requestAnimationFrame(paint)
    }
    const leave = () => {
      ev = null
    }

    wall.addEventListener('pointermove', move)
    wall.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      wall.removeEventListener('pointermove', move)
      wall.removeEventListener('pointerleave', leave)
    }
  }, [tab])

  const shown = tab === ALL ? TOOLS : TOOLS.filter(t => t.group === tab)

  return (
    <section id="stack" ref={root} className={s.stack} aria-labelledby="stack-title">
      <div className={s.inner}>
        <header className={s.head}>
          <div className={s.headTop}>
            <span className={s.label}>04 — toolbox</span>
            <span className={s.label}>
              {TOOLS.length} tools · {profile.skills.length} categories
            </span>
          </div>
          <h2 id="stack-title" className={s.title} data-reveal>
            Tools of <em>the trade.</em>
          </h2>
          <p className={s.lede} data-reveal>
            What I reach for, from college C++ to production AWS. Pick a category, or hover a tool to see how I use it.
          </p>
        </header>

        {/* ── logo wall ───────────────────────────────────── */}
        <div className={s.tabs} role="tablist" aria-label="Tool categories" data-reveal>
          {GROUPS.map(g => {
            const count = g === ALL ? TOOLS.length : TOOLS.filter(t => t.group === g).length
            return (
              <button
                key={g}
                type="button"
                role="tab"
                aria-selected={tab === g}
                className={`${s.tab} ${tab === g ? s.tabOn : ''}`}
                onClick={() => setTab(g)}
              >
                {g}
                <sup>{count}</sup>
              </button>
            )
          })}
        </div>

        <p className={s.readout} aria-live="polite">
          {focus ? (
            <>
              <b>{shortName(focus.name)}</b>
              <span className={s.readoutGroup}>
                {focus.group} · {USAGE[focus.rarity].label}
              </span>
              <span className={s.readoutNote}>{focus.note}</span>
            </>
          ) : (
            <span className={s.readoutHint}>↳ sorted by how often I use them. Hover a tool for details.</span>
          )}
        </p>

        <ul
          key={tab}
          ref={wallRef}
          className={s.wall}
          role="tabpanel"
          aria-label={`${tab} tools`}
          onMouseLeave={() => setFocus(null)}
          data-cursor="none"
        >
          {shown.map((t, i) => {
            return (
              <li key={t.name} className={s.cell} style={{ '--i': i }}>
                <HoverPerspective radius="16px">
                <button
                  type="button"
                  className={`${s.tile} ${s[t.rarity]} ${focus?.name === t.name ? s.tileOn : ''}`}
                  onMouseEnter={() => setFocus(t)}
                  onFocus={() => setFocus(t)}
                  onBlur={() => setFocus(null)}
                  aria-label={`${t.name}, used ${USAGE[t.rarity].label}. ${t.note}`}
                  data-tile
                >
                  <LogoImg
                    src={iconUrl(t.name)}
                    alt=""
                    className={s.tileLogo}
                    fallback={<span className={`${s.tileLogo} ${s.tileAbbr}`}>{t.abbr}</span>}
                  />
                  <span className={s.tileName}>{shortName(t.name)}</span>
                </button>
                </HoverPerspective>
              </li>
            )
          })}
        </ul>

        {/* ── path ────────────────────────────────────────── */}
        <div className={s.block}>
          <div className={s.blockHead} data-reveal>
            <span className={s.label}>path</span>
            <h3 className={s.blockTitle}>How I got here</h3>
          </div>
          <Path />
        </div>
      </div>
    </section>
  )
}
