import { useRef, useState } from 'react'
import Button from 'components/button'
import Magnetic from 'components/magnetic'
import { publicApi } from 'api'
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
  if (f.name.trim().length < 2) errors.name = 'name: at least 2 characters'
  if (!EMAIL_RE.test(f.email.trim())) errors.email = 'email: that does not look valid'
  if (f.message.trim().length < 10) errors.message = 'message: at least 10 characters'
  return errors
}

export default function Contact() {
  const root = useRef(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [log, setLog] = useState([{ text: 'ready. all fields required.', tone: 'muted' }])
  useChapter(root, 'contact')
  useReveal(root)

  const write = (text, tone) => setLog(prev => [...prev, { text, tone }].slice(-6))

  const onChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(({ [name]: _drop, ...rest }) => rest)
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
      Object.values(found).forEach(msg => write(`✗ ${msg}`, 'error'))
      return
    }

    const wait = COOLDOWN_MS - (Date.now() - storage.get('contact.last', 0))
    if (wait > 0) {
      write(`rate limited: try again in ${Math.ceil(wait / 1000)}s`, 'error')
      return
    }

    setStatus('sending')
    write('> opening connection…')
    const res = await publicApi.contact.send({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim()
    })

    if (res.success) {
      storage.set('contact.last', Date.now())
      write('✓ packet delivered. I usually reply within a day or two.', 'ok')
      setForm(EMPTY)
      setStatus('sent')
    } else if (res.error === 'not-configured') {
      write(`✗ the form isn't wired up yet. Email ${profile.contact.email} instead.`, 'error')
      setStatus('error')
    } else {
      write(`✗ network error. Try again, or email ${profile.contact.email}.`, 'error')
      setStatus('error')
    }
  }

  const channels = [
    { label: 'Email', value: profile.contact.email, href: `mailto:${profile.contact.email}` },
    { label: 'Phone', value: profile.contact.phone, href: `tel:${profile.contact.phoneHref}` },
    ...profile.socials.map(x => ({ label: x.label, value: `@${x.handle}`, href: x.url, external: true }))
  ]

  return (
    <section id="contact" ref={root} className={s.contact} aria-labelledby="contact-title">
      <div className={s.inner}>
        <div className={s.left}>
          <span className={s.label} data-reveal>
            06 — connect
          </span>
          <h2 id="contact-title" className={s.title} data-reveal>
            Let&rsquo;s build something <em>that scales.</em>
          </h2>
          <p className={s.lede} data-reveal>
            Open to collaborations, consulting and ambitious products. Use the form, it lands in my inbox, or reach me
            directly.
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
              <Button href="/resume.pdf" download size="lg" icon="↓">
                Download resume
              </Button>
            </Magnetic>
          </div>
        </div>

        <form className={s.form} onSubmit={onSubmit} noValidate data-reveal>
          <div className={s.bar}>
            <span className={s.dots} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>new_message.sh</span>
          </div>

          <div className={s.fields}>
            <label className={s.field}>
              <span className={s.prompt}>&gt; name</span>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                maxLength={120}
                placeholder="Ada Lovelace"
                required
              />
            </label>
            <label className={s.field}>
              <span className={s.prompt}>&gt; email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                maxLength={200}
                placeholder="ada@engine.dev"
                required
              />
            </label>
            <label className={`${s.field} ${s.area}`}>
              <span className={s.prompt}>&gt; message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={5}
                aria-invalid={Boolean(errors.message)}
                maxLength={4000}
                placeholder="Tell me about the system you want to build…"
                required
              />
            </label>

            {/* honeypot */}
            <label className={s.honeypot} aria-hidden="true">
              Company
              <input name="company" value={form.company} onChange={onChange} tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className={s.log} role="status" aria-live="polite">
            {log.map((l, i) => (
              <p key={i} className={s[l.tone] || ''}>
                {l.text}
              </p>
            ))}
          </div>

          <div className={s.submitRow}>
            <Button type="submit" disabled={status === 'sending'} icon="⏎">
              {status === 'sending' ? 'sending…' : status === 'sent' ? 'send another' : 'send --message'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
