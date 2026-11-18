import Marquee from 'components/marquee'
import profile from 'data/profile.json'
import s from './index.module.scss'

const TICKER = [
  'Available for interesting problems',
  'React',
  'Node.js',
  'MongoDB',
  'AWS',
  'Nginx',
  'Cloudflare',
  'C++ · Java · C#',
  'Small bundles',
  'Ship on time'
]

export default function Footer({ onTerminal }) {
  const year = new Date().getFullYear()

  return (
    <footer className={s.footer}>
      <Marquee items={TICKER} className={s.marquee} duration={50} />
      <div className={s.row}>
        <p>
          © {year} {profile.name}
        </p>
        <p className={s.built}>
          Built with React, GSAP and Canvas 2D. No WebGL was harmed.
        </p>
        <button type="button" className={s.hint} onClick={onTerminal}>
          press <kbd>`</kbd> for a terminal
        </button>
      </div>
    </footer>
  )
}
