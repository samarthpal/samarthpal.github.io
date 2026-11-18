import s from './index.module.scss'

// "SP" on a 3-unit pixel grid inside a hive hexagon, followed by a terminal caret.
// Same geometry as public/favicon.svg and scripts/build_brand.py — keep them in sync.
const HEX = 'M32 2 58 17v30L32 62 6 47V17z'
const LETTERS =
  'M14 22h12v3H14zM11 25h3v6h-3zM14 31h9v3h-9zM23 34h3v6h-3zM11 40h12v3H11zM29 22h12v3H29zM29 25h3v18h-3zM41 25h3v6h-3zM32 31h9v3h-9z'
const CARET = 'M47 22h6v21h-6z'

export default function Logo({ size = 36, className = '', blink = true }) {
  return (
    <svg
      className={`${s.logo} ${blink ? s.blink : ''} ${className}`}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path data-logo-hex className={s.hex} d={HEX} />
      <path className={s.letters} d={LETTERS} />
      <path className={s.caret} d={CARET} />
    </svg>
  )
}
