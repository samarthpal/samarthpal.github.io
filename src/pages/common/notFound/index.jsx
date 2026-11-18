import { useRef } from 'react'
import Button from 'components/button'
import Portal from 'components/portal'
import useHead from 'hooks/useHead'
import s from './index.module.scss'

export default function NotFound() {
  const portalRef = useRef(null)
  useHead({ title: '404' })

  return (
    <main className={s.page}>
      <div className={s.inner}>
        <div className={s.portal} onClick={() => portalRef.current?.pulse(1.2)}>
          <Portal ref={portalRef} tag="error 404 · page lost" label="A glowing portal" />
        </div>
        <div className={s.copy}>
          <p className={s.code} aria-hidden="true">
            404
          </p>
          <h1 className={s.title}>
            <span className="sr-only">404: </span>
            This page fell through <em>a portal.</em>
          </h1>
          <p className={s.text}>
            Whatever was here slipped into another dimension, or never existed. Click the portal if you want to try pulling it
            back. Or take the safe route:
          </p>
          <div className={s.actions}>
            <Button to="/" icon="→">
              Back to home
            </Button>
            <Button to="/" state={{ section: 'work' }} variant="ghost" icon="→">
              See the work
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
