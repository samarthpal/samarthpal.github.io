import s from './styles.module.scss'

export default function Main(props) {
  return (
    <div className={s.main} onClick={() => props.OnHover(props.skill)} onMouseEnter={() => props.OnHover(props.skill)}>
      <div
        className={
          s.skill +
          ' ' +
          (props.index % 4 === 3
            ? s.skill3
            : props.index % 4 === 2
              ? s.skill2
              : props.index % 4 === 1
                ? s.skill1
                : s.skill0)
        }
      >
        <div className={s.skillInner}>
          <img src={props.img} alt='' />
        </div>
      </div>
      <div className={s.skillName}>{props.skill}</div>
    </div>
  )
}
