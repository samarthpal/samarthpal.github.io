import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AsciiCanvas from 'components/asciiCanvas'
import BugSquash from 'components/bugSquash'
import Terminal from 'components/terminal'
import { CHARSETS, MODES } from 'helpers/ascii'
import loadPixelFont from 'helpers/pixelFont'
import scroller from 'helpers/scroller'
import useHead from 'hooks/useHead'
import { PORTRAIT } from 'data/portrait'
import s from './index.module.scss'

const TONES = ['mono', 'amber', 'phosphor']

export default function Playground() {
  const { state } = useLocation()
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const [mode, setMode] = useState('ascii')
  const [charset, setCharset] = useState('binary')
  const [cols, setCols] = useState(140)
  const [invert, setInvert] = useState(false)
  const [tone, setTone] = useState('amber')
  const [sourceColor, setSourceColor] = useState(true)
  const [image, setImage] = useState(null) // { src, aspect } for an uploaded file
  const [copied, setCopied] = useState(false)

  useHead({ title: 'Lab', description: 'ASCII Studio, Bug Squash and a portfolio terminal — small toys by Samarth Pal.' })

  useEffect(() => {
    loadPixelFont()
  }, [])

  // deep link from the home page cards / terminal
  useEffect(() => {
    if (!state?.lab) return
    const id = setTimeout(() => scroller.toSection(`lab-${state.lab}`), 450)
    return () => clearTimeout(id)
  }, [state])

  // object URLs must be released
  useEffect(() => () => image && URL.revokeObjectURL(image.src), [image])

  const onFile = e => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const src = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => setImage({ src, aspect: img.naturalHeight / img.naturalWidth })
    img.src = src
  }

  const copy = async () => {
    const text = canvasRef.current?.getText()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const source = image
    ? { src: image.src, aspect: image.aspect, crop: undefined, mask: undefined, contrast: 1.15, gamma: 1 }
    : PORTRAIT

  return (
    <main className={s.page}>
      <div className={s.inner}>
        <header className={s.head}>
          <span className={s.label}>~/lab</span>
          <h1 className={s.title}>
            The <em>lab.</em>
          </h1>
          <p className={s.lede}>
            Three small toys built with nothing but Canvas 2D and a bit of JavaScript. No WebGL, no game engine, no
            tracking. Images you drop in never leave your browser.
          </p>
        </header>

        {/* ── ASCII Studio ─────────────────────────── */}
        <section id="lab-ascii" className={s.lab} aria-labelledby="ascii-title">
          <div className={s.labHead}>
            <span className={s.num}>lab/01</span>
            <h2 id="ascii-title" className={s.labTitle}>
              ASCII Studio
            </h2>
          </div>

          <div className={s.studio}>
            <div className={s.stage}>
              <AsciiCanvas
                key={source.src}
                ref={canvasRef}
                src={source.src}
                aspect={source.aspect}
                crop={source.crop}
                mask={source.mask}
                contrast={source.contrast}
                gamma={source.gamma}
                mode={mode}
                cols={cols}
                pixelCols={Math.round(cols * 0.6)}
                charset={CHARSETS[charset]}
                invert={invert}
                tone={tone}
                sourceColor={sourceColor}
                label="ASCII Studio canvas"
              />
            </div>

            <div className={s.controls}>
              <fieldset className={s.group}>
                <legend>render</legend>
                <div className={s.segment}>
                  {MODES.map(m => (
                    <button key={m} type="button" aria-pressed={m === mode} onClick={() => setMode(m)}>
                      {m}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className={s.group} disabled={mode !== 'ascii'}>
                <legend>charset</legend>
                <div className={s.segment}>
                  {Object.keys(CHARSETS).map(c => (
                    <button key={c} type="button" aria-pressed={c === charset} onClick={() => setCharset(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className={s.group}>
                <span className={s.legend}>
                  columns <b>{cols}</b>
                </span>
                <input
                  type="range"
                  min={30}
                  max={180}
                  step={2}
                  value={cols}
                  onChange={e => setCols(Number(e.target.value))}
                  className={s.range}
                />
              </label>

              <fieldset className={s.group} disabled={mode !== 'ascii'}>
                <legend>colour</legend>
                <div className={s.segment}>
                  {TONES.map(t => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={!sourceColor && t === tone}
                      onClick={() => {
                        setTone(t)
                        setSourceColor(false)
                      }}
                    >
                      {t}
                    </button>
                  ))}
                  <button type="button" aria-pressed={sourceColor} onClick={() => setSourceColor(true)}>
                    source
                  </button>
                </div>
              </fieldset>

              <label className={s.check}>
                <input type="checkbox" checked={invert} onChange={e => setInvert(e.target.checked)} disabled={mode !== 'ascii'} />
                invert brightness
              </label>

              <div className={s.actions}>
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} hidden />
                <button type="button" className={s.action} onClick={() => fileRef.current?.click()}>
                  ⇪ use your photo
                </button>
                {image && (
                  <button type="button" className={s.action} onClick={() => setImage(null)}>
                    ↺ back to me
                  </button>
                )}
                <button type="button" className={s.action} onClick={copy} disabled={mode !== 'ascii'}>
                  {copied ? '✓ copied' : '⧉ copy as text'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bug Squash ───────────────────────────── */}
        <section id="lab-bugs" className={s.lab} aria-labelledby="bugs-title">
          <div className={s.labHead}>
            <span className={s.num}>lab/02</span>
            <h2 id="bugs-title" className={s.labTitle}>
              Bug Squash
            </h2>
          </div>
          <div className={s.arcade}>
            <BugSquash />
          </div>
        </section>

        {/* ── Terminal ─────────────────────────────── */}
        <section id="lab-terminal" className={s.lab} aria-labelledby="term-title">
          <div className={s.labHead}>
            <span className={s.num}>lab/03</span>
            <h2 id="term-title" className={s.labTitle}>
              Terminal
            </h2>
          </div>
          <p className={s.lede}>
            Try <code>neofetch</code>, <code>ls work</code>, <code>open stashblog</code> or <code>sudo hire-me</code>.
          </p>
          <Terminal embedded />
        </section>
      </div>
    </main>
  )
}
