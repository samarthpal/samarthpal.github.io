import s from './styles.module.scss'
import { head } from 'helpers'
import { useEffect } from 'react'

export default function Main() {
  useEffect(() => {
    head({ title: 'SAMARTH PAL' })
  }, [])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = `/resume.pdf`
    link.download = 'resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={s.main}>
      <div className={s.resume + ' indent'}>
        <div className='title'>Resume</div>
        <div className={s.downloadButton} onClick={handleDownload}>
          <div className={s.download}>
            <div className={s.downloadInner}>View Full CV</div>
          </div>
        </div>
      </div>
    </div>
  )
}
