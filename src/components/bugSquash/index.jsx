import { useCallback, useEffect, useRef, useState } from 'react'
import storage from 'helpers/storage'
import { drawBitmap } from 'helpers/pixel'
import { BUG_A, BUG_B, SKINS } from 'helpers/sprites'
import sfx from 'helpers/sfx'
import { dpr as getDpr } from 'helpers/device'
import s from './index.module.scss'

// World is 160×90 "pixels"; the canvas scales it to fit.
const GW = 160
const GH = 90
const ROUND = 30
const BEST_KEY = 'bugsquash.best'

const ERRORS = [
  'undefined is not a function',
  'Cannot read properties of null',
  'CORS blocked',
  'ECONNREFUSED',
  '502 Bad Gateway',
  'Maximum call stack exceeded',
  'NullPointerException',
  'segfault',
  'off-by-one',
  'race condition',
  'memory leak',
  'merge conflict',
  'works on my machine',
  'z-index: 99999',
  'NaN !== NaN',
  'white screen (purge cache!)'
]


const makeSprite = (rows, colors) => {
  const c = document.createElement('canvas')
  c.width = 8
  c.height = 8
  drawBitmap(c.getContext('2d'), rows, colors, 0, 0, 1)
  return c
}

let SPRITES = null
const getSprites = () => {
  if (!SPRITES) {
    SPRITES = {
      bug: [makeSprite(BUG_A, SKINS.bug), makeSprite(BUG_B, SKINS.bug)],
      gold: [makeSprite(BUG_A, SKINS.gold), makeSprite(BUG_B, SKINS.gold)]
    }
  }
  return SPRITES
}

const rand = (a, b) => a + Math.random() * (b - a)
const PIXEL_FONT = '"Press Start 2P", ui-monospace, monospace'

function spawn(g) {
  const side = Math.floor(Math.random() * 4)
  let x
  let y
  if (side === 0) [x, y] = [rand(10, GW - 10), -6]
  else if (side === 1) [x, y] = [GW + 6, rand(10, GH - 10)]
  else if (side === 2) [x, y] = [rand(10, GW - 10), GH + 6]
  else [x, y] = [-6, rand(10, GH - 10)]
  const tx = rand(GW * 0.25, GW * 0.75)
  const ty = rand(GH * 0.25, GH * 0.75)
  const gold = Math.random() < 0.09
  g.bugs.push({
    x,
    y,
    base: Math.atan2(ty - y, tx - x),
    heading: 0,
    speed: (gold ? 34 : rand(14, 26)) * (1 + g.elapsed / 45),
    wobble: rand(0, Math.PI * 2),
    t: 0,
    entered: false,
    dead: 0,
    gold,
    splat: null
  })
}

function update(g, dt) {
  g.time = Math.max(0, g.time - dt)
  g.elapsed += dt
  g.spawnIn -= dt
  if (g.spawnIn <= 0 && g.bugs.length < 14) {
    spawn(g)
    const k = Math.min(1, g.elapsed / ROUND)
    g.spawnIn = (0.95 - 0.6 * k) * rand(0.7, 1.3)
  }

  g.bugs = g.bugs.filter(bug => {
    bug.t += dt
    if (bug.dead > 0) {
      bug.dead -= dt
      return bug.dead > 0
    }
    bug.heading = bug.base + Math.sin(bug.t * 3 + bug.wobble) * 0.55
    bug.x += Math.cos(bug.heading) * bug.speed * dt
    bug.y += Math.sin(bug.heading) * bug.speed * dt
    const inside = bug.x > 2 && bug.x < GW - 2 && bug.y > 2 && bug.y < GH - 2
    if (inside) bug.entered = true
    const gone = bug.x < -12 || bug.x > GW + 12 || bug.y < -12 || bug.y > GH + 12
    if (bug.entered && gone) {
      g.combo = 1 // an escaped bug breaks the chain
      g.escaped += 1
      return false
    }
    return bug.t < 14
  })

  g.particles = g.particles.filter(pt => {
    pt.life -= dt
    pt.x += pt.vx * dt
    pt.y += pt.vy * dt
    pt.vy += 40 * dt
    return pt.life > 0
  })
  g.texts = g.texts.filter(t => {
    t.life -= dt * 0.8
    t.y -= 10 * dt
    return t.life > 0
  })
}

export default function BugSquash() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const size = useRef({ w: 0, h: 0, p: 1 })
  const game = useRef(null)
  const [phase, setPhase] = useState('idle') // idle | playing | over
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const [hud, setHud] = useState({ score: 0, time: ROUND, combo: 1 })
  const [best, setBest] = useState(() => storage.get(BEST_KEY, 0))
  const [muted, setMuted] = useState(() => sfx.isMuted())

  const toggleSound = () => {
    const next = !muted
    sfx.setMuted(next)
    setMuted(next)
    if (!next) {
      sfx.unlock()
      sfx.tick()
    }
  }

  const render = useCallback(g => {
    const canvas = canvasRef.current
    const { w, h, p } = size.current
    if (!canvas || !w) return
    const ctx = canvas.getContext('2d')
    const ratio = getDpr()
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.imageSmoothingEnabled = false

    ctx.fillStyle = '#120f2d'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#211d4d'
    for (let y = 4; y < GH; y += 8) for (let x = 4; x < GW; x += 8) ctx.fillRect(x * p, y * p, p, p)

    const sp = getSprites()
    for (const bug of g.bugs) {
      ctx.save()
      ctx.translate(bug.x * p, bug.y * p)
      if (bug.dead > 0) {
        ctx.globalAlpha = Math.min(1, bug.dead * 2)
        ctx.fillStyle = bug.gold ? '#ffe14d' : '#7cff6b'
        for (const s2 of bug.splat) ctx.fillRect(s2[0] * p, s2[1] * p, p, p)
      } else {
        ctx.rotate(bug.heading + Math.PI / 2)
        const frame = Math.floor(bug.t * 8) % 2
        ctx.drawImage(sp[bug.gold ? 'gold' : 'bug'][frame], -4 * p, -4 * p, 8 * p, 8 * p)
      }
      ctx.restore()
    }

    for (const pt of g.particles) {
      ctx.globalAlpha = Math.max(0, pt.life / pt.max)
      ctx.fillStyle = pt.color
      ctx.fillRect(pt.x * p, pt.y * p, p, p)
    }
    ctx.globalAlpha = 1

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const t of g.texts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, t.life))
      ctx.font = `${Math.max(8, Math.round(p * 3))}px ${PIXEL_FONT}`
      ctx.fillStyle = t.color
      const x = Math.min(GW - 30, Math.max(30, t.x)) * p
      ctx.fillText(t.text, x, t.y * p)
    }
    ctx.globalAlpha = 1
  }, [])

  const idleScene = useCallback(() => {
    render({
      bugs: [
        { x: 40, y: 30, heading: 0.4, t: 0, dead: 0, gold: false },
        { x: 118, y: 62, heading: 2.6, t: 0.1, dead: 0, gold: true },
        { x: 82, y: 70, heading: -1.2, t: 0, dead: 0, gold: false }
      ],
      particles: [],
      texts: []
    })
  }, [render])

  // sizing
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const resize = () => {
      const w = wrap.clientWidth
      const h = (w * GH) / GW
      const ratio = getDpr()
      canvas.width = Math.round(w * ratio)
      canvas.height = Math.round(h * ratio)
      size.current = { w, h, p: w / GW }
      if (game.current && phaseRef.current !== 'idle') render(game.current)
      else idleScene()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [render, idleScene])

  const finish = useCallback(score => {
    setPhase('over')
    const prev = storage.get(BEST_KEY, 0)
    const isBest = score > prev
    if (isBest) storage.set(BEST_KEY, score)
    setBest(Math.max(prev, score))
    sfx.over(isBest)
  }, [])

  // game loop
  useEffect(() => {
    if (phase !== 'playing') return
    let raf = 0
    let lastHud = 0
    let lastSecond = ROUND
    const frame = now => {
      const g = game.current
      const dt = Math.min(0.05, (now - g.last) / 1000)
      g.last = now
      update(g, dt)
      render(g)
      if (g.escaped) {
        sfx.escape()
        g.escaped = 0
      }
      const second = Math.ceil(g.time)
      if (second !== lastSecond) {
        lastSecond = second
        if (second > 0 && second <= 5) sfx.tick() // countdown beeps
      }
      if (now - lastHud > 100) {
        lastHud = now
        setHud({ score: g.score, time: Math.ceil(g.time), combo: g.combo })
      }
      if (g.time <= 0) {
        setHud({ score: g.score, time: 0, combo: g.combo })
        finish(g.score)
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [phase, render, finish])

  const start = () => {
    game.current = {
      bugs: [],
      particles: [],
      texts: [],
      score: 0,
      combo: 1,
      time: ROUND,
      elapsed: 0,
      spawnIn: 0.3,
      escaped: 0,
      last: performance.now()
    }
    sfx.unlock()
    sfx.start()
    setHud({ score: 0, time: ROUND, combo: 1 })
    setPhase('playing')
  }

  const onPointerDown = e => {
    const g = game.current
    if (phase !== 'playing' || !g) return
    const rect = canvasRef.current.getBoundingClientRect()
    const gx = ((e.clientX - rect.left) / rect.width) * GW
    const gy = ((e.clientY - rect.top) / rect.height) * GH
    let hit = null
    let bestD = 7.5
    for (const bug of g.bugs) {
      if (bug.dead > 0) continue
      const d = Math.hypot(bug.x - gx, bug.y - gy)
      if (d < bestD) {
        bestD = d
        hit = bug
      }
    }

    if (!hit) {
      g.combo = 1
      g.particles.push({ x: gx, y: gy, vx: 0, vy: -6, life: 0.3, max: 0.3, color: '#6d6a8f' })
      sfx.miss()
      return
    }

    if (hit.gold) sfx.gold()
    else sfx.squash(g.combo)
    const points = (hit.gold ? 50 : 10) * g.combo
    g.score += points
    g.combo = Math.min(5, g.combo + 1)
    hit.dead = 0.6
    hit.splat = Array.from({ length: 14 }, () => [Math.round(rand(-4, 4)), Math.round(rand(-4, 4))])
    for (let i = 0; i < 12; i++) {
      g.particles.push({
        x: hit.x,
        y: hit.y,
        vx: rand(-30, 30),
        vy: rand(-36, 6),
        life: rand(0.3, 0.7),
        max: 0.7,
        color: hit.gold ? '#ffe14d' : i % 2 ? '#7cff6b' : '#f4f1ea'
      })
    }
    g.texts.push({
      text: ERRORS[Math.floor(Math.random() * ERRORS.length)],
      x: hit.x,
      y: hit.y - 6,
      life: 1.3,
      color: hit.gold ? '#ffe14d' : '#ffb21a'
    })
    g.texts.push({ text: `+${points}`, x: hit.x, y: hit.y + 6, life: 0.9, color: '#f4f1ea' })
  }

  return (
    <div className={s.game}>
      <div className={s.hud} aria-live="off">
        <span>
          SCORE <b>{String(hud.score).padStart(5, '0')}</b>
        </span>
        <span>
          TIME <b>{String(hud.time).padStart(2, '0')}</b>
        </span>
        <span>
          COMBO <b>x{hud.combo}</b>
        </span>
        <span>
          BEST <b>{String(best).padStart(5, '0')}</b>
        </span>
        <button type="button" className={s.sound} onClick={toggleSound} aria-pressed={!muted}>
          SFX <b>{muted ? 'OFF' : 'ON'}</b>
        </button>
      </div>

      <div ref={wrapRef} className={s.screen}>
        <canvas
          ref={canvasRef}
          className={s.canvas}
          onPointerDown={onPointerDown}
          role="img"
          aria-label="Bug Squash game area. Click or tap bugs to squash them."
        />

        {phase !== 'playing' && (
          <div className={s.overlay}>
            {phase === 'idle' ? (
              <>
                <p className={s.title}>BUG SQUASH</p>
                <p className={s.sub}>Production is crawling with bugs. You have {ROUND} seconds.</p>
                <p className={s.sub}>Gold bugs are critical: 50 pts. Chain hits for up to x5.</p>
              </>
            ) : (
              <>
                <p className={s.title}>{hud.score >= best && hud.score > 0 ? 'NEW HI-SCORE!' : 'SHIFT OVER'}</p>
                <p className={s.sub}>
                  You squashed {hud.score} points of bugs. {hud.score > 300 ? 'Ship it.' : 'Production thanks you.'}
                </p>
              </>
            )}
            <button type="button" className={s.start} onClick={start} autoFocus={phase === 'over'}>
              {phase === 'idle' ? '▶ PRESS START' : '↻ PLAY AGAIN'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
