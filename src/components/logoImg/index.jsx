import { useState } from 'react'
import s from './index.module.scss'

/**
 * A remote brand logo on a light chip (so dark logos stay visible on the dark site).
 * Renders `fallback` (default: nothing) if the image is missing or fails to load.
 */
export default function LogoImg({ src, alt, className = '', fallback = null, chip = true }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return fallback

  return (
    <span className={`${s.logo} ${chip ? s.chip : ''} ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </span>
  )
}
