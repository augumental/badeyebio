import { SKILLS, lookup } from '../icons'
import SectionHead from './SectionHead'

export default function SkillsSection({ skills }) {
  let n = 0
  return (
    <div className="wrap">
      <SectionHead eyebrow="Stack" title={skills.title} lede={skills.subtitle} />
      <div className="glass stack">
        {skills.groups.map((g) => (
          <section key={g.name} className="stack__group">
            <h3>{g.name}</h3>
            <ul>
              {g.items.map((key) => {
                const { label, Icon } = lookup(SKILLS, key)
                return (
                  <li key={key} className="tag tag--lg" style={{ '--d': `${0.25 + n++ * 0.035}s` }}>
                    <Icon aria-hidden="true" />
                    {label}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
