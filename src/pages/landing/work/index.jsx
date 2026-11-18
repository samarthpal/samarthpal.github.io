import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from 'components/button'
import HoverPerspective from 'components/hoverPerspective'
import ProjectCover from 'components/projectCover'
import Scramble from 'components/scramble'
import useHead from 'hooks/useHead'
import useReveal from 'hooks/useReveal'
import workFacts from 'helpers/workFacts'
import profile from 'data/profile.json'
import NotFound from '../../common/notFound'
import s from './index.module.scss'

const pad = n => String(n).padStart(2, '0')

export default function WorkDetail() {
  const { slug } = useParams()
  const root = useRef(null)
  const index = profile.work.findIndex(w => w.slug === slug)
  const work = profile.work[index]
  const next = profile.work[(index + 1) % profile.work.length]

  useHead(work ? { title: work.name, description: work.summary } : { title: 'Not found' })
  useReveal(root)

  if (!work) return <NotFound />

  const host = work.url ? new URL(work.url).host.replace(/^www\./, '') : ''
  const facts = workFacts(work)

  return (
    <main ref={root} className={s.page} style={{ '--accent': work.accent }}>
      <div className={s.inner}>
        <Link to="/" state={{ section: 'work' }} className={s.back}>
          ← all work
        </Link>

        <header className={s.head}>
          <p className={s.kicker}>
            case {pad(index + 1)} · {work.company}
          </p>
          <h1 className={s.title} aria-label={work.name}>
            <Scramble text={work.name} aria-hidden="true" glyphs="ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&" />
          </h1>
          <p className={s.summary}>{work.summary}</p>
        </header>

        <dl className={s.meta}>
          <div>
            <dt>Client</dt>
            <dd>{work.client}</dd>
          </div>
          <div>
            <dt>Industry</dt>
            <dd>{work.industry}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{work.status}</dd>
          </div>
          <div>
            <dt>Live</dt>
            <dd>
              {work.url ? (
                <a href={work.url} target="_blank" rel="noopener noreferrer" className={s.link}>
                  {host} ↗
                </a>
              ) : (
                'private / internal'
              )}
            </dd>
          </div>
        </dl>
      </div>

      {facts.items.length > 0 && (
        <div className={s.inner}>
          <section className={s.factsBand} aria-label={facts.title} data-reveal>
            <span className={s.factsTitle}>{facts.title}</span>
            <ul className={s.facts}>
              {facts.items.map(f => (
                <li key={f.label}>
                  <HoverPerspective className={s.fact}>
                    <strong className={s.factValue}>{f.value}</strong>
                    <span className={s.factLabel}>{f.label}</span>
                  </HoverPerspective>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <div className={s.banner} data-reveal>
        <ProjectCover logo={work.logo} seed={`${work.slug}-banner`} accent={work.accent} name={work.name} className={s.bannerCover} />
      </div>

      <div className={s.inner}>
        <div className={s.body}>
          <section className={s.block} data-reveal>
            <h2 className={s.blockTitle}>
              <span>01</span> The challenge
            </h2>
            <p className={s.blockText}>{work.challenge}</p>
          </section>
          <section className={s.block} data-reveal>
            <h2 className={s.blockTitle}>
              <span>02</span> What we built
            </h2>
            <p className={s.blockText}>{work.solution}</p>
          </section>
          {work.modules?.length > 0 && (
            <section className={s.block} data-reveal>
              <h2 className={s.blockTitle}>
                <span>03</span> Modules
              </h2>
              <ul className={s.modules}>
                {work.modules.map(m => (
                  <li key={m}>
                    <HoverPerspective className={s.module} radius="10px">
                      {m}
                    </HoverPerspective>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className={s.block} data-reveal>
            <h2 className={s.blockTitle}>
              <span>{work.modules?.length ? '04' : '03'}</span> Stack
            </h2>
            <ul className={s.stack}>
              {work.stack.map(t => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        </div>

        {work.url && (
          <div className={s.cta} data-reveal>
            <Button href={work.url} external size="lg" icon="↗">
              Visit {host}
            </Button>
          </div>
        )}

        <Link to={`/work/${next.slug}`} className={s.next} data-cursor="next">
          <span className={s.nextLabel}>next case →</span>
          <span className={s.nextName}>{next.name}</span>
        </Link>
      </div>
    </main>
  )
}
