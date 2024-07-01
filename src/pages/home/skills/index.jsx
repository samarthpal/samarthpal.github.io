import { SkillCard } from 'components'
import s from './styles.module.scss'
import { head } from 'helpers'
import { useEffect } from 'react'

const skills = [
  {
    heading: '',
    title: 'Programming Languages',
    list: [
      {
        skill: 'NodeJs',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-bSt16XVIR9526s9Rs6OUTds5FV8oZ_vX1w&s'
      },
      {
        skill: 'Javascript',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2sPC6b3oTgzKALC3Kt1LTbxGYB3oN1SrTjA&s'
      },
      { skill: 'Java', img: 'https://education.oracle.com/file/general/p-80-java.png' },
      {
        skill: 'C',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6uGiVrgFgwrxVhhFCAOPbwOl7rIcl3nYnsg&s'
      },
      { skill: 'C++', img: 'https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg' },
      {
        skill: 'Python',
        img: 'https://i0.wp.com/junilearning.com/wp-content/uploads/2020/06/python-programming-language.webp?fit=1920%2C1920&ssl=1'
      },
      {
        skill: 'PHP',
        img: 'https://cdn2.iconfinder.com/data/icons/designer-skills/128/code-programming-php-software-develop-command-language-512.png'
      }
    ]
  },
  {
    heading: '',
    title: 'Data Science',
    list: [
      {
        skill: 'Machine Learning',
        img: 'https://nyesteventuretech.com/images/Machine-Learning.jpg'
      }
    ]
  },
  {
    heading: '',
    title: 'Libraries/Frameworks',
    list: [
      { skill: 'ReactJs', img: 'https://pbs.twimg.com/profile_images/1785867863191932928/EpOqfO6d_400x400.png' },
      { skill: 'HTML5', img: 'https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582748_1280.png' },
      { skill: 'CSS', img: 'https://cdn.pixabay.com/photo/2017/08/05/11/16/logo-2582747_960_720.png' },
      {
        skill: 'SCSS',
        img: 'https://pluginicons.craft-cdn.com/scssqTY8srJEesn2VFiUV73mUCyRIZsfXfDj2eOY.svg?1528091210'
      },
      { skill: 'Bootstrap', img: 'https://pl.wizcase.com/wp-content/uploads/2022/02/en-bootstrap-logo.jpg' },
      {
        skill: 'Jquery',
        img: 'https://w7.pngwing.com/pngs/606/221/png-transparent-jquery-original-logo-icon.png'
      },
      {
        skill: 'ExpressJs',
        img: 'https://ajeetchaulagain.com/static/7cb4af597964b0911fe71cb2f8148d64/87351/express-js.png'
      },
      { skill: 'Mongoose', img: 'https://avatars.githubusercontent.com/u/7552965?s=280&v=4' }
    ]
  },
  {
    heading: '',
    title: 'Databases',
    list: [
      { skill: 'MongoDB', img: 'https://seeklogo.com/images/M/mongodb-logo-D13D67C930-seeklogo.com.png' },
      { skill: 'PhpMyAdmin', img: 'https://w7.pngwing.com/pngs/30/283/png-transparent-phpmyadmin-logo.png' },
      {
        skill: 'MYSQL',
        img: 'https://w7.pngwing.com/pngs/354/683/png-transparent-logo-mysql-database-phpmyadmin-oracle-sql-logo-blue-text-logo-thumbnail.png'
      }
    ]
  },
  {
    heading: 'Tools/Platforms',
    title: 'Project Management',
    list: [
      {
        skill: 'Trello',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYqtRVBVzM5qeD4mn6vyJrjnfZzYkkxikJ9taBsI6_6-3NTtTvM7duuy30tqO8rUbeH8k&usqp=CAU'
      },
      { skill: 'Figma', img: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/figma_logo_icon_147289.png' },
      { skill: 'Whimsical', img: 'https://i.pinimg.com/originals/ea/2a/b2/ea2ab287b40acfe28348c71eb780d11c.png' },
      {
        skill: 'Adobe Photoshop',
        img: 'https://e7.pngegg.com/pngimages/719/831/png-clipart-adobe-creative-cloud-computer-icons-editing-shop-icon-blue-text-thumbnail.png'
      },
      {
        skill: 'Adobe Illustrator',
        img: 'https://download.logo.wine/logo/Adobe_Illustrator/Adobe_Illustrator-Logo.wine.png'
      }
    ]
  },
  {
    heading: '',
    title: 'Version Control',
    list: [
      { skill: 'Git', img: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png' },
      { skill: 'GitHub', img: 'https://cdn.pixabay.com/photo/2022/01/30/13/33/github-6980894_1280.png' }
    ]
  },
  {
    heading: '',
    title: 'Cloud Services',
    list: [
      {
        skill: 'Amazon Web Services (AWS): EC2, S3, SES, IAM',
        img: 'https://www.pngall.com/wp-content/uploads/13/AWS-Logo-PNG-File.png'
      }
    ]
  },
  {
    heading: '',
    title: 'Web Server',
    list: [{ skill: 'Nginx', img: 'https://www.svgrepo.com/show/373924/nginx.svg' }]
  },
  {
    heading: '',
    title: 'Web Services',
    list: [
      { skill: 'Cloudflare', img: 'https://static-00.iconduck.com/assets.00/cloudflare-icon-2048x2048-wks6nchu.png' }
    ]
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
