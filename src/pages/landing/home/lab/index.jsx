import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AsciiCanvas from 'components/asciiCanvas'
import HoverPerspective from 'components/hoverPerspective'
import PixelSprite from 'components/pixelSprite'
import { CHARSETS } from 'helpers/ascii'
import { BUG_A, SKINS } from 'helpers/sprites'
import { openTerminal } from 'helpers/terminal'
import loadPixelFont from 'helpers/pixelFont'
import useChapter from 'hooks/useChapter'
import useReveal from 'hooks/useReveal'
import { PORTRAIT } from 'data/portrait'
import s from './index.module.scss'

export default function Lab() {
  const root = useRef(null)
  useChapter(root, 'lab')
  useReveal(root)

  // the 8-bit font is only needed here (Bug Squash card), so fetch it when the lab gets close
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        loadPixelFont()
        io.disconnect()
      },
      { rootMargin: '800px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section id="lab" ref={root} className={s.lab} aria-labelledby="lab-title">
      <div className={s.inner}>
        <header className={s.head} data-reveal>
          <span className={s.label}>05 — playground</span>
          <h2 id="lab-title" className={s.title}>
            Built for <em>curiosity.</em>
          </h2>
          <p className={s.lede}>Small toys I made while building this site. Poke them, break them, tell me what you find.</p>
        </header>

        <div className={s.cards}>
          <HoverPerspective className={s.tilt} data-reveal>
          <Link to="/playground" state={{ lab: 'ascii' }} className={s.card} data-cursor="play">
            <div className={`${s.preview} ${s.asciiPreview}`}>
              <AsciiCanvas
                src={PORTRAIT.src}
                aspect={PORTRAIT.aspect}
                crop={PORTRAIT.crop}
                mask={PORTRAIT.mask}
                contrast={PORTRAIT.contrast}
                cols={44}
                charset={CHARSETS.code}
                tone="phosphor"
                hot="magenta"
                intro={false}
                label="ASCII Studio preview"
              />
            </div>
            <span className={s.num}>lab/01</span>
            <h3 className={s.cardTitle}>ASCII Studio</h3>
            <p className={s.cardText}>The hero renderer with every knob exposed. Drop in your own photo, copy the result as text.</p>
          </Link>
          </HoverPerspective>

          <HoverPerspective className={s.tilt} data-reveal>
          <Link to="/playground" state={{ lab: 'bugs' }} className={s.card} data-cursor="play">
            <div className={`${s.preview} ${s.bugPreview}`}>
              <PixelSprite rows={BUG_A} colors={SKINS.bug} size={96} className={s.bug} />
              <PixelSprite rows={BUG_A} colors={SKINS.gold} size={48} className={s.bugSmall} />
              <span className={s.pressStart}>PRESS START</span>
            </div>
            <span className={s.num}>lab/02</span>
            <h3 className={s.cardTitle}>Bug Squash</h3>
            <p className={s.cardText}>30 seconds, production is crawling with bugs. Gold ones are critical. Beat your hi-score.</p>
          </Link>
          </HoverPerspective>

          <HoverPerspective className={s.tilt} data-reveal>
          <button type="button" className={s.card} onClick={openTerminal} data-cursor="open">
            <div className={`${s.preview} ${s.termPreview}`} aria-hidden="true">
              <pre>
                <span className={s.g}>~ $</span> whoami{'\n'}
                samarth: cto @ daemonhive{'\n'}
                <span className={s.g}>~ $</span> sudo hire-me{'\n'}
                <span className={s.a}>access granted.</span>
                {'\n'}
                <span className={s.g}>~ $</span> <i className={s.caret} />
              </pre>
            </div>
            <span className={s.num}>lab/03</span>
            <h3 className={s.cardTitle}>Terminal</h3>
            <p className={s.cardText}>
              The whole portfolio as a CLI. Press <kbd>`</kbd> anywhere, or click here.
            </p>
          </button>
          </HoverPerspective>
        </div>
      </div>
    </section>
  )
}
