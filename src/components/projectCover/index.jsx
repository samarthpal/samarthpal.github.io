import LogoImg from 'components/logoImg'
import PatternCover from 'components/patternCover'
import s from './index.module.scss'

/**
 * Project cover: the real logo on a light panel when one exists,
 * otherwise (or if it fails to load) the generative ASCII pattern.
 */
export default function ProjectCover({ logo, seed, accent, name, className = '' }) {
  const ascii = <PatternCover seed={seed} accent={accent} className={className} label={`Generative cover for ${name}`} />
  if (!logo) return ascii

  return (
    <div className={`${s.cover} ${className}`} style={{ '--accent': accent }}>
      <LogoImg src={logo} alt={`${name} logo`} chip={false} className={s.logo} fallback={ascii} />
    </div>
  )
}
