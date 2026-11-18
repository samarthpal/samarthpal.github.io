import { useRef, useState } from 'react'
import Button from 'components/button'
import Magnetic from 'components/magnetic'
import Portal from 'components/portal'
import { publicApi } from 'api'
import { gsap } from 'helpers/gsap'
import { prefersReducedMotion } from 'helpers/device'
import storage from 'helpers/storage'
import useChapter from 'hooks/useChapter'
import useReveal from 'hooks/useReveal'
import profile from 'data/profile.json'
import s from './index.module.scss'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const COOLDOWN_MS = 30_000
const EMPTY = { name: '', email: '', message: '', company: '' }

const validate = f => {
  const errors = {}
  if (f.name.trim().length < 2) errors.name = 'Please add your name (2+ characters).'
  if (!EMAIL_RE.test(f.email.trim())) errors.email = 'That email doesn’t look right.'
  if (f.message.trim().length < 10) errors.message = 'Tell me a bit more (10+ characters).'
  return errors
}

const centre = (el, host) => {
  const a = el.getBoundingClientRect()
  const b = host.getBoundingClientRect()
  return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 }
}

export default function Contact() {
  const root = useRef(null)
  const portalRef = useRef(null)
  const portalBox = useRef(null)
  const formRef = useRef(null)
  const packetRef = useRef(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [notice, setNotice] = useState(null) // { text, tone }
  useChapter(root, 'contact')
  useReveal(root)

  const onChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(({ [name]: _drop, ...rest }) => rest)
  }

  // the message "flies" into the portal, which surges as it arrives
  const sendThroughPortal = () => {
    const portal = portalRef.current
    if (prefersReducedMotion() || !packetRef.current || !formRef.current || !portalBox.current) {
      portal?.pulse(1)
      return
    }
    const from = centre(formRef.current, root.current)
    const to = centre(portalBox.current, root.current)
    gsap.fromTo(
      packetRef.current,
      { x: from.x, y: from.y, xPercent: -50, yPercent: -50, scale: 1, rotation: 0, autoAlpha: 1 },
      {
        x: to.x,
        y: to.y,
        scale: 0.15,
        rotation: -25,
        autoAlpha: 0.2,
        duration: 0.9,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(packetRef.current, { autoAlpha: 0 })
          portal?.pulse(1.4)
        }
      }
    )
  }

  const onSubmit = async e => {
    e.preventDefault()
    if (status === 'sending') return

    // honeypot: humans never see this field
    if (form.company) {
      setStatus('sent')
      return
    }

    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      setNotice({ text: 'A couple of fields need a look.', tone: 'error' })
      return
    }

    const wait = COOLDOWN_MS - (Date.now() - storage.get('contact.last', 0))
    if (wait > 0) {
      setNotice({ text: `Just sent one. Try again in ${Math.ceil(wait / 1000)}s.`, tone: 'error' })
      return
    }

    setStatus('sending')
    setNotice({ text: 'Sending…', tone: 'muted' })
    const res = await publicApi.contact.send({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim()
    })

    if (res.success) {
      storage.set('contact.last', Date.now())
      sendThroughPortal()
      setNotice({ text: 'Delivered. I usually reply within a day or two.', tone: 'ok' })
      setForm(EMPTY)
      setStatus('sent')
    } else if (res.error === 'not-configured') {
      setNotice({ text: `The form isn’t connected yet. Email ${profile.contact.email} instead.`, tone: 'error' })
      setStatus('error')
    } else {
      setNotice({ text: `Couldn’t send. Check your connection or email ${profile.contact.email}.`, tone: 'error' })
      setStatus('error')
    }
  }

  const channels = [
    { label: 'Email', value: profile.contact.email, href: `mailto:${profile.contact.email}` },
    { label: 'Phone', value: profile.contact.phone, href: `tel:${profile.contact.phoneHref}` },
    ...profile.socials.map(x => ({ label: x.label, value: `@${x.handle}`, href: x.url, external: true }))
  ]

  const field = (name, label, props = {}, Tag = 'input') => (
    <label className={`${s.field} ${errors[name] ? s.invalid : ''}`}>
      <span className={s.fieldLabel}>{label}</span>
      <Tag
        name={name}
        value={form[name]}
        onChange={onChange}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `err-${name}` : undefined}
        required
        {...props}
      />
      {errors[name] && (
        <span id={`err-${name}`} className={s.fieldError}>
          {errors[name]}
        </span>
      )}
    </label>
  )

  return (
    <section id="contact" ref={root} className={s.contact} aria-labelledby="contact-title">
      <div className={s.inner}>
        <header className={s.head}>
          <span className={s.label} data-reveal>
            06 — connect
          </span>
          <h2 id="contact-title" className={s.title} data-reveal>
            Let&rsquo;s build something <em>that scales.</em>
          </h2>
        </header>

        <div className={s.grid}>
          <aside className={s.side}>
            <div ref={portalBox} className={s.portal} data-reveal>
              <Portal ref={portalRef} tag="send portal · open" />
            </div>
            <p className={s.lede} data-reveal>
              Open to collaborations, consulting and ambitious products. Write below, or reach me directly.
            </p>
            <ul className={s.channels} data-reveal>
              {channels.map(c => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className={s.channel}
                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span className={s.channelLabel}>{c.label}</span>
                    <span className={s.channelValue}>{c.value}</span>
                    <span aria-hidden="true">{c.external ? '↗' : '→'}</span>
                  </a>
                </li>
              ))}
              <li className={s.channel}>
                <span className={s.channelLabel}>Based in</span>
                <span className={s.channelValue}>{profile.location}</span>
                <span />
              </li>
            </ul>
            <div data-reveal>
              <Magnetic>
                <Button href="/resume.pdf" download variant="ghost" icon="↓">
                  Download resume
                </Button>
              </Magnetic>
            </div>
          </aside>

          <form ref={formRef} className={s.card} onSubmit={onSubmit} noValidate data-reveal>
            <div className={s.cardHead}>
              <div>
                <h3 className={s.cardTitle}>Send a message</h3>
                <p className={s.cardSub}>Goes straight to my inbox. I usually reply within a day or two.</p>
              </div>
              <span className={s.online}>
                <i aria-hidden="true" /> available
              </span>
            </div>

            <div className={s.row}>
              {field('name', 'Your name', { autoComplete: 'name', maxLength: 120, placeholder: 'Ada Lovelace' })}
              {field('email', 'Email', {
                type: 'email',
                autoComplete: 'email',
                maxLength: 200,
                placeholder: 'ada@company.com'
              })}
            </div>
            {field(
              'message',
              'What are you building?',
              { rows: 6, maxLength: 4000, placeholder: 'A few lines about the product, timeline and where you need help…' },
              'textarea'
            )}

            {/* honeypot */}
            <label className={s.honeypot} aria-hidden="true">
              Company
              <input name="company" value={form.company} onChange={onChange} tabIndex={-1} autoComplete="off" />
            </label>

            <div className={s.cardFoot}>
              <p className={`${s.notice} ${notice ? s[notice.tone] || '' : ''}`} role="status" aria-live="polite">
                {notice?.text || 'All fields are required.'}
              </p>
              <Button type="submit" size="lg" className={s.submit} disabled={status === 'sending'} icon="→">
                {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Send another' : 'Send message'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div ref={packetRef} className={s.packet} aria-hidden="true">
        ✉ message
      </div>
    </section>
  )
}
