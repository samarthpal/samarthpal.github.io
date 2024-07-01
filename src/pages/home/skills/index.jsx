import { SkillCard } from 'components'
import s from './styles.module.scss'
import { head } from 'helpers'
import { useEffect } from 'react'
import images from 'images'

const skills = [
  {
    heading: '',
    title: 'Programming Languages',
    list: [
      {
        skill: 'NodeJs',
        img: images.nodeJs
      },
      {
        skill: 'Javascript',
        img: images.js
      },
      { skill: 'Java', img: images.java },
      {
        skill: 'C',
        img: images.c
      },
      { skill: 'C++', img: images.cpp },
      {
        skill: 'Python',
        img: images.python
      },
      {
        skill: 'PHP',
        img: images.php
      }
    ]
  },
  {
    heading: '',
    title: 'Data Science',
    list: [
      {
        skill: 'Machine Learning',
        img: images.ml
      }
    ]
  },
  {
    heading: '',
    title: 'Libraries/Frameworks',
    list: [
      { skill: 'ReactJs', img: images.react },
      { skill: 'HTML5', img: images.html },
      { skill: 'CSS', img: images.css },
      {
        skill: 'SCSS',
        img: images.scss
      },
      { skill: 'Bootstrap', img: images.bootstrap },
      {
        skill: 'Jquery',
        img: images.jquery
      },
      {
        skill: 'ExpressJs',
        img: images.expressJs
      },
      { skill: 'Mongoose', img: images.mongoose }
    ]
  },
  {
    heading: '',
    title: 'Databases',
    list: [
      { skill: 'MongoDB', img: images.mongoDb },
      { skill: 'PhpMyAdmin', img: images.phpMyAdmin },
      {
        skill: 'MYSQL',
        img: images.mySql
      }
    ]
  },
  {
    heading: 'Tools/Platforms',
    title: 'Project Management',
    list: [
      {
        skill: 'Trello',
        img: images.trello
      },
      { skill: 'Figma', img: images.figma },
      { skill: 'Whimsical', img: images.whimsical },
      {
        skill: 'Adobe Photoshop',
        img: images.ps
      },
      {
        skill: 'Adobe Illustrator',
        img: images.ai
      }
    ]
  },
  {
    heading: '',
    title: 'Version Control',
    list: [
      { skill: 'Git', img: images.git },
      { skill: 'GitHub', img: images.github }
    ]
  },
  {
    heading: '',
    title: 'Cloud Services',
    list: [
      {
        skill: 'Amazon Web Services (AWS): EC2, S3, SES, IAM',
        img: images.aws
      }
    ]
  },
  {
    heading: '',
    title: 'Web Server',
    list: [{ skill: 'Nginx', img: images.nginx }]
  },
  {
    heading: '',
    title: 'Web Services',
    list: [{ skill: 'Cloudflare', img: images.cloudFlare }]
  }
]

export default function Main() {
  useEffect(() => {
    head({ title: 'SAMARTH PAL' })
  }, [])

  return (
    <div className={s.main}>
      <div className={s.skillsSection + ' indent'}>
        <div className='title'>Skills</div>
        <div className={s.skills}>
          {skills.map(({ heading, title, list }, index) => (
            <div className={s.skillsInner} key={index}>
              {heading && <div className='title'>{heading}</div>}
              <div className='title'>{title}</div>
              <div className={s.skillsList}>
                {list.map((list, i) => (
                  <SkillCard {...list} index={i} key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
