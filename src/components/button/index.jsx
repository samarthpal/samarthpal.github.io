import { Link } from 'react-router-dom'
import s from './index.module.scss'

/**
 * One button for links, routes and actions.
 * - `to`   → react-router Link
 * - `href` → anchor (`external` opens a new tab)
 * - else   → <button>
 */
export default function Button({
  to,
  href,
  external = false,
  variant = 'solid',
  size = 'md',
  icon = '→',
  className = '',
  children,
  ...rest
}) {
  const cls = `${s.btn} ${s[variant] || ''} ${s[size] || ''} ${className}`
  const inner = (
    <>
      <span className={s.fill} aria-hidden="true" />
      <span className={s.label}>{children}</span>
      {icon && (
        <span className={s.icon} aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  )

  if (to)
    return (
      <Link to={to} className={cls} {...rest}>
        {inner}
      </Link>
    )
  if (href)
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {inner}
      </a>
    )
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  )
}
