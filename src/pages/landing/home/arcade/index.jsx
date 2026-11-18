import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PixelIcon from 'components/pixelIcon'
import Portal from 'components/portal'
import { DEVICON_BASE, SKILL_ICONS } from 'data/skillIcons'
import { MOTION, gsap, useGSAP } from 'helpers/gsap'
import loadPixelFont from 'helpers/pixelFont'
import storage from 'helpers/storage'
import useChapter from 'hooks/useChapter'
import useInView from 'hooks/useInView'
import useMediaQuery from 'hooks/useMediaQuery'
import { PORTRAIT } from 'data/portrait'
import profile from 'data/profile.json'
import PixelWipe from './pixelWipe'
import s from './index.module.scss'

const ITEMS = profile.skills.flatMap(g => g.items.map(item => ({ ...item, group: g.group })))
const RARITY_LABEL = { legendary: '★ LEGENDARY', epic: '◆ EPIC', rare: '● RARE', common: '○ COMMON' }

export default function Arcade() {
  const root = useRef(null)
  const screenRef = useRef(null)
  const gridRef = useRef(null)
  const [selected, setSelected] = useState(0)
  const [hiScore, setHiScore] = useState(0)
  const [statsRef, statsSeen] = useInView({ once: true, rootMargin: '-10% 0px' })
  const wide = useMediaQuery('(min-width: 768px)')
  const cols = wide ? 8 : 5
  useChapter(root, 'arcade')

  // load the 8-bit font + read the Bug Squash hi-score only when we get close
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        loadPixelFont()
        setHiScore(storage.get('bugsquash.best', 0))
        io.disconnect()
      },
      { rootMargin: '1200px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // CRT power-off on the way out (desktop only)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION.desktop, () => {
        const screen = screenRef.current
        // collapse toward the middle of what is visible, not the middle of a tall element
        const setOrigin = () =>
          gsap.set(screen, { transformOrigin: `50% ${Math.max(0, screen.offsetHeight - window.innerHeight / 2)}px` })
        setOrigin()
        const tl = gsap.timeline({
          defaults: { ease: 'power3.in' },
          scrollTrigger: {
            trigger: root.current,
            start: 'bottom bottom',
            end: '+=75%',
            pin: true,
            scrub: 0.6,
            onRefresh: setOrigin
          }
        })
        tl.to('[data-crt-flash]', { opacity: 0.9, duration: 0.15 }, 0)
          .to(screen, { scaleY: 0.004, duration: 0.45 }, 0)
          .to(screen, { scaleX: 0, duration: 0.3 }, 0.45)
          .fromTo('[data-crt-dot]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.7)
          .to('[data-crt-dot]', { scale: 0, autoAlpha: 0, duration: 0.25 }, 0.75)
      })
    },
    { scope: root }
  )

  const onGridKey = e => {
    const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Home: -Infinity, End: Infinity }
    if (!(e.key in moves)) return
    e.preventDefault()
    const step = moves[e.key]
    const next =
      step === -Infinity ? 0 : step === Infinity ? ITEMS.length - 1 : Math.min(ITEMS.length - 1, Math.max(0, selected + step))
    setSelected(next)
    gridRef.current?.querySelectorAll('button')[next]?.focus()
  }

  const item = ITEMS[selected]

  return (
    <>
      <PixelWipe />
      <section id="arcade" ref={root} className={s.arcade} aria-labelledby="arcade-title">
        <div className={s.frame}>
          <div ref={screenRef} className={s.screen}>
            <div className={s.topbar} aria-hidden="true">
              <span>1UP SAMARTH</span>
              <span>
                HI-SCORE <b>{String(hiScore).padStart(6, '0')}</b>
              </span>
              <span>CREDIT 01</span>
            </div>

            <h2 id="arcade-title" className={s.title}>
              <span className={s.titleSmall}>04 — arcade</span>
              PLAYER SELECT
            </h2>

            <div className={s.layout}>
              {/* ── player card ───────────────────── */}
              <article className={s.player} aria-label="Player card">
                <div className={s.avatar}>
                  <Portal
                    src={PORTRAIT.src}
                    tag="P1 · REAL WORLD"
                    label="Photo of Samarth seen through a glowing portal"
                  />
                </div>
                <dl className={s.sheet}>
                  <div>
                    <dt>NAME</dt>
                    <dd>SAMARTH</dd>
                  </div>
                  <div>
                    <dt>CLASS</dt>
                    <dd>CTO</dd>
                  </div>
                  <div>
                    <dt>GUILD</dt>
                    <dd>DAEMONHIVE</dd>
                  </div>
                  <div>
                    <dt>LVL</dt>
                    <dd>{profile.version}</dd>
                  </div>
                </dl>

                <ul ref={statsRef} className={`${s.stats} ${statsSeen ? s.filled : ''}`} aria-label="Stats">
                  {profile.stats.map((stat, si) => (
                    <li key={stat.label}>
                      <span className={s.statLabel}>{stat.label}</span>
                      <span className={s.bar} role="meter" aria-valuemin={0} aria-valuemax={10} aria-valuenow={stat.value} aria-label={stat.label}>
                        {Array.from({ length: 10 }, (_, k) => (
                          <i
                            key={k}
                            className={k < stat.value ? s.on : ''}
                            style={{ transitionDelay: `${si * 90 + k * 45}ms` }}
                          />
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              {/* ── inventory ─────────────────────── */}
              <div className={s.inventory}>
                <div className={s.panelHead}>
                  <span>INVENTORY</span>
                  <span className={s.dim}>{ITEMS.length} ITEMS · ←↑→↓</span>
                </div>
                <div
                  ref={gridRef}
                  className={s.grid}
                  style={{ '--cols': cols }}
                  role="listbox"
                  aria-label="Tech inventory"
                  onKeyDown={onGridKey}
                >
                  {ITEMS.map((it, i) => (
                    <button
                      key={it.name}
                      id={`item-${i}`}
                      type="button"
                      role="option"
                      aria-selected={i === selected}
                      tabIndex={i === selected ? 0 : -1}
                      className={`${s.slot} ${s[it.rarity]} ${i === selected ? s.selected : ''}`}
                      onMouseEnter={() => setSelected(i)}
                      onFocus={() => setSelected(i)}
                      onClick={() => setSelected(i)}
                      title={it.name}
                    >
                      {it.abbr}
                    </button>
                  ))}
                </div>
                <div className={s.detail} aria-live="polite">
                  <div className={`${s.detailIcon} ${s[item.rarity]}`}>
                    <PixelIcon
                      src={SKILL_ICONS[item.name] ? DEVICON_BASE + SKILL_ICONS[item.name] : ''}
                      size={64}
                      fallback={item.abbr}
                      label={`${item.name} icon`}
                    />
                  </div>
                  <div>
                    <p className={`${s.rarity} ${s[item.rarity]}`}>{RARITY_LABEL[item.rarity]}</p>
                    <p className={s.itemName}>{item.name}</p>
                    <p className={s.itemGroup}>{item.group.toUpperCase()}</p>
                    <p className={s.itemNote}>{item.note}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── quest log ───────────────────────── */}
            <div className={s.quests}>
              <div className={s.panelHead}>
                <span>QUEST LOG</span>
                <span className={s.dim}>MAIN STORY</span>
              </div>
              <ol>
                {profile.experience.map((q, i) => (
                  <li key={q.id} className={s.quest}>
                    <span className={s.questNo}>Q{profile.experience.length - i}</span>
                    <div>
                      <p className={s.questName}>
                        {q.quest} <span className={q.status === 'ACTIVE' ? s.active : s.cleared}>[{q.status}]</span>
                      </p>
                      <p className={s.questTitle}>{q.title}</p>
                      <p className={s.questText}>{q.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className={s.footer}>
              <Link to="/playground" state={{ lab: 'bugs' }} className={s.start}>
                ▶ PRESS START: BUG SQUASH
              </Link>
              <span className={s.dim}>INSERT COIN: 1 COFFEE</span>
            </div>

            <div className={s.flash} data-crt-flash aria-hidden="true" />
          </div>
          <div className={s.dot} data-crt-dot aria-hidden="true" />
        </div>
      </section>
    </>
  )
}
