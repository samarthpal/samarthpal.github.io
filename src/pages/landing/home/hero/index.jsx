import { useRef, useState } from 'react'
import AsciiCanvas from 'components/asciiCanvas'
import { MODES } from 'helpers/ascii'
import LogoImg from 'components/logoImg'
import Scramble from 'components/scramble'
import { MOTION, gsap, useGSAP } from 'helpers/gsap'
import hexClip from 'helpers/hexClip'
import useChapter from 'hooks/useChapter'
import useMediaQuery from 'hooks/useMediaQuery'
import { PORTRAIT } from 'data/portrait'
import profile from 'data/profile.json'
import s from './index.module.scss'

/** Distance from an element's centre to its root's centre, ignoring transforms. */
const centerDelta = (el, root) => {
  let x = 0
  let y = 0
  let node = el
  while (node && node !== root) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent
  }
  return {
    x: root.clientWidth / 2 - (x + el.offsetWidth / 2),
    y: root.clientHeight / 2 - (y + el.offsetHeight / 2)
  }
}

export default function Hero() {
  const root = useRef(null)
  const [mode, setMode] = useState('photo')
  const isMobile = useMediaQuery('(max-width: 767.98px)')
  useChapter(root, 'hero')

  const nextMode = () => setMode(m => MODES[(MODES.indexOf(m) + 1) % MODES.length])

  // "boot" → portrait collapses into a caret → a hive hexagon grows from it and becomes the next chapter.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION.desktop, () => {
        const el = root.current
        const portrait = el.querySelector('[data-hero-portrait]')
        const typed = el.querySelector('[data-hero-typed]')
        const word = 'whoami'
        const counter = { n: 0 }
        const type = () => (typed.textContent = word.slice(0, Math.round(counter.n)))
        gsap.set('[data-hero-hex]', { clipPath: hexClip(0) })
        gsap.set('[data-hero-caret]', { xPercent: -50, yPercent: -50 })

        const caret = el.querySelector('[data-hero-caret]')
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          // once the hexagon has grown past the caret, draw it in the next chapter's ink
          onUpdate: () => caret.classList.toggle(s.onNext, tl.time() > 0.62),
          scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: '+=170%',
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true
            }
          })
          .to('[data-hero-line]', { yPercent: -45, autoAlpha: 0, stagger: 0.05, duration: 0.3 }, 0)
          .to('[data-hero-fade]', { y: -40, autoAlpha: 0, stagger: 0.02, duration: 0.24 }, 0)
          .to(
            portrait,
            {
              x: () => centerDelta(portrait, el).x,
              y: () => centerDelta(portrait, el).y,
              scale: 0.06,
              duration: 0.4,
              ease: 'power2.in'
            },
            0.02
          )
          .to(portrait, { autoAlpha: 0, duration: 0.06 }, 0.37)
          // the portrait becomes a terminal prompt that types the next chapter's name…
          .fromTo('[data-hero-caret]', { autoAlpha: 0, scale: 1.6 }, { autoAlpha: 1, scale: 1, duration: 0.08 }, 0.35)
          .to(counter, { n: word.length, duration: 0.14, onUpdate: type }, 0.4)
          // …and the next chapter opens out of it as a hive hexagon
          .to('[data-hero-hex]', { clipPath: hexClip(125), duration: 0.42, ease: 'power2.in' }, 0.56)
          .to('[data-hero-caret]', { autoAlpha: 0, duration: 0.06 }, 0.94)
      })
    },
    { scope: root }
  )

  return (
    <section id="hero" ref={root} className={s.hero} aria-label="Introduction">
      <div className={s.inner}>
        <div className={s.copy}>
          <p className={s.prompt} data-hero-fade>
            <span className={s.path}>~/samarth</span> <span className={s.dollar}>$</span>{' '}
            <span className={s.typed}>whoami</span>
          </p>

          <h1 className={s.name} aria-label={profile.shortName}>
            <span className={s.line} data-hero-line aria-hidden="true">
              <Scramble text={profile.firstName} />
            </span>
            <span className={s.line} data-hero-line aria-hidden="true">
              <Scramble text={profile.lastName} duration={1100} />
              <span className={s.dot}>.</span>
            </span>
          </h1>

          <p className={s.role} data-hero-fade>
            {profile.role} <span className={s.at}>@</span>{' '}
            <a href={profile.companyUrl} target="_blank" rel="noopener noreferrer" className={s.company}>
              <LogoImg src={profile.companyLogo} alt="" className={s.companyLogo} />
              <span className={s.companyName}>{profile.company}</span>
            </a>
          </p>
          <p className={s.lede} data-hero-fade>
            {profile.tagline}
          </p>
        </div>

        <figure className={s.portrait} data-hero-portrait>
          <AsciiCanvas
            src={PORTRAIT.src}
            aspect={PORTRAIT.aspect}
            crop={PORTRAIT.crop}
            mask={PORTRAIT.mask}
            contrast={PORTRAIT.contrast}
            gamma={PORTRAIT.gamma}
            cols={isMobile ? 54 : 76}
            pixelCols={isMobile ? 40 : 52}
            mode={mode}
            onClick={nextMode}
            label={`Portrait of ${profile.shortName}, rendered as ${mode}`}
          />
          <figcaption className={s.caption}>
            <span className={s.hint}>
              {mode === 'photo'
                ? `${isMobile ? 'tap' : 'click'} me: render as code`
                : isMobile
                  ? 'tap to switch render'
                  : 'hover to glitch · click to switch'}
            </span>
            <span className={s.modes} role="group" aria-label="Portrait render mode">
              {MODES.map(m => (
                <button
                  key={m}
                  type="button"
                  className={`${s.mode} ${m === mode ? s.on : ''}`}
                  aria-pressed={m === mode}
                  onClick={() => setMode(m)}
                >
                  {m}
                </button>
              ))}
            </span>
          </figcaption>
        </figure>
      </div>

      <div className={s.meta} data-hero-fade>
        <span>{profile.location}</span>
        <span className={s.scroll}>
          scroll <i aria-hidden="true" />
        </span>
      </div>

      <div className={s.caret} data-hero-caret aria-hidden="true">
        <span className={s.caretPrompt}>~ $&nbsp;</span>
        <span data-hero-typed />
        <i />
      </div>
      <div className={s.hex} data-hero-hex aria-hidden="true" />
    </section>
  )
}
