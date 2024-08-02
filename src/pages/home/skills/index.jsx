import { SkillCard } from 'components'
import s from './styles.module.scss'
import { useEffect, useState } from 'react'
import images from 'images'

const Skills = [
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
        skill: 'AWS: EC2, S3, SES, IAM',
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

// const skillsAlt = [
//   {
//     skill: 'NodeJs',
//     img: images.nodeJs
//   },
//   {
//     skill: 'Javascript',
//     img: images.js
//   },
//   { skill: 'Java', img: images.java },
//   {
//     skill: 'C',
//     img: images.c
//   },
//   { skill: 'C++', img: images.cpp },
//   {
//     skill: 'Python',
//     img: images.python
//   },
//   {
//     skill: 'PHP',
//     img: images.php
//   },
//   {
//     skill: 'Machine Learning',
//     img: images.ml
//   },
//   { skill: 'ReactJs', img: images.react },
//   { skill: 'HTML5', img: images.html },
//   { skill: 'CSS', img: images.css },
//   {
//     skill: 'SCSS',
//     img: images.scss
//   },
//   { skill: 'Bootstrap', img: images.bootstrap },
//   {
//     skill: 'Jquery',
//     img: images.jquery
//   },
//   {
//     skill: 'ExpressJs',
//     img: images.expressJs
//   },
//   { skill: 'Mongoose', img: images.mongoose },
//   { skill: 'MongoDB', img: images.mongoDb },
//   { skill: 'PhpMyAdmin', img: images.phpMyAdmin },
//   {
//     skill: 'MYSQL',
//     img: images.mySql
//   },
//   {
//     skill: 'Trello',
//     img: images.trello
//   },
//   { skill: 'Figma', img: images.figma },
//   { skill: 'Whimsical', img: images.whimsical },
//   {
//     skill: 'Adobe Photoshop',
//     img: images.ps
//   },
//   {
//     skill: 'Adobe Illustrator',
//     img: images.ai
//   },
//   { skill: 'Git', img: images.git },
//   { skill: 'GitHub', img: images.github },
//   {
//     skill: 'AWS: EC2, S3, SES, IAM',
//     img: images.aws
//   },
//   { skill: 'Nginx', img: images.nginx },
//   { skill: 'Cloudflare', img: images.cloudFlare }
// ]

// function chunkArray(array, m, matches) {
//   const result = []
//   let i = 0
//   let odd = true

//   while (i < array.length) {
//     let chunkSize = odd ? m : matches ? m + 1 : m - 1
//     let chunk = array.slice(i, i + chunkSize)
//     result.push(chunk)
//     i += chunkSize
//     odd = !odd // toggle between odd and even chunk sizes
//   }

//   return result
// }

export default function Main() {
  const mediaMatch = window.matchMedia('(max-width: 1279px)')
  const [matches, setMatches] = useState(mediaMatch.matches)
  // const [skills, setSkills] = useState(chunkArray(skillsAlt, matches ? 2 : 6, matches))
  // const [skillInView, setSkillInView] = useState(skillsAlt[0].skill)

  useEffect(() => {
    const handler = e => setMatches(e.matches)
    mediaMatch.addEventListener('change', handler)
    return () => mediaMatch.removeEventListener('change', handler)
  })

  // const handleMouseEnter = skill => {
  //   setSkillInView(skill)
  // }

  return (
    <div className={s.main} id='skills'>
      <div className={s.skillsSection + ' indent'}>
        <div className='title'>Skills</div>
        <div className={s.skills}>
          {/* <div className={s.skillInView}>{skillInView}</div> */}
          {Skills.map(({ heading, title, list }, index) => (
            <div className={s.skillsInner} key={index}>
              {heading && <div className='title'>{heading}</div>}
              <div className={'title ' + s.title}>{title}</div>
              <div
                className={s.skillsList}
                style={
                  matches
                    ? {
                        gridTemplateColumns: `repeat(${list.length > 1 ? 2 : 1}, 1fr)`
                      }
                    : {
                        gridTemplateColumns: `repeat(${list.length > 7 ? 4 : list.length === 7 ? 7 : list.length}, 1fr)`
                      }
                }
              >
                {list.map((list, i) => (
                  <SkillCard {...list} index={i} key={i} />
                ))}
              </div>
            </div>
          ))}

          {/* {skills.map((row, i) => (
            <div className={s.skillsInner} key={i}>
              {row.map((list, j) => (
                <SkillCard {...list} 
                OnHover={handleMouseEnter} index={j} key={j} />
              ))}
            </div>
          ))} */}
        </div>
      </div>
    </div>
  )
}
