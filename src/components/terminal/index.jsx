import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { WELCOME, complete, run } from 'helpers/terminal'
import scroller from 'helpers/scroller'
import s from './index.module.scss'

/**
 * Interactive terminal. `embedded` renders inline (playground); otherwise it is a modal overlay.
 * Overlay input carries data-terminal="overlay" so the global ` hotkey can close it from inside.
 */
export default function Terminal({ open = true, onClose, embedded = false }) {
  const [lines, setLines] = useState(WELCOME)
  const [value, setValue] = useState('')
  const history = useRef([])
  const cursor = useRef(-1)
  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const lastFocus = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // focus + scroll lock for the overlay
  useEffect(() => {
    if (!open || embedded) return
    lastFocus.current = document.activeElement
    inputRef.current?.focus({ preventScroll: true })
    scroller.stop()
    const html = document.documentElement
    const prev = html.style.overflow
    if (!scroller.get()) html.style.overflow = 'hidden'
    return () => {
      scroller.start()
      html.style.overflow = prev
      lastFocus.current?.focus?.({ preventScroll: true })
    }
  }, [open, embedded])

  useEffect(() => {
    const body = bodyRef.current
    if (body) body.scrollTop = body.scrollHeight
  }, [lines])

  const exec = useCallback(
    line => {
      const result = run(line)
      const action = result.action
      if (action?.type === 'clear') {
        setLines([])
        return
      }
      setLines(prev => [...prev, { text: `~ $ ${line}`, tone: 'prompt' }, ...result.lines].slice(-300))
      if (!action) return

      if (action.type === 'close') onClose?.()
      if (action.type === 'external') window.open(action.url, '_blank', 'noopener,noreferrer')
      if (action.type === 'navigate')
        setTimeout(() => {
          if (!embedded) onClose?.()
          navigate(action.to, { state: action.state })
        }, 350)
      if (action.type === 'section')
        setTimeout(() => {
          if (!embedded) onClose?.()
          if (pathname === '/') setTimeout(() => scroller.toSection(action.id), 60)
          else navigate('/', { state: { section: action.id } })
        }, 600)
    },
    [embedded, navigate, onClose, pathname]
  )

  const onKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const line = value.trim()
      if (line) {
        history.current.unshift(line)
        history.current = history.current.slice(0, 50)
      }
      cursor.current = -1
      setValue('')
      exec(line)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(history.current.length - 1, cursor.current + 1)
      if (next >= 0) {
        cursor.current = next
        setValue(history.current[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = cursor.current - 1
      cursor.current = Math.max(-1, next)
      setValue(next >= 0 ? history.current[next] : '')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      setValue(v => complete(v))
    }
  }

  if (!open && !embedded) return null

  return (
    <div
      className={embedded ? s.embedded : s.overlay}
      onClick={embedded ? undefined : onClose}
      role={embedded ? undefined : 'dialog'}
      aria-modal={embedded ? undefined : 'true'}
      aria-label="Terminal"
    >
      <div className={s.window} onClick={e => e.stopPropagation()}>
        <div className={s.bar}>
          <span className={s.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={s.title}>samarth@portfolio: ~</span>
          {!embedded && (
            <button type="button" className={s.close} onClick={onClose} aria-label="Close terminal">
              esc
            </button>
          )}
        </div>
        <div ref={bodyRef} className={s.body} data-lenis-prevent onClick={() => inputRef.current?.focus()}>
          <div aria-live="polite">
            {lines.map((line, i) => {
              const text = typeof line === 'string' ? line : line.text
              const tone = typeof line === 'string' ? '' : s[line.tone] || ''
              return (
                <pre key={i} className={`${s.line} ${tone}`}>
                  {text || ' '}
                </pre>
              )
            })}
          </div>
          <label className={s.inputRow}>
            <span className={s.prompt} aria-hidden="true">
              ~ $
            </span>
            <input
              ref={inputRef}
              className={s.input}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              data-terminal={embedded ? 'embedded' : 'overlay'}
              aria-label="Terminal command"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
