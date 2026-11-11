import { useEffect, useRef, useState } from 'react'
import useTilt from '../hooks/useTilt'
import { BADGES, SOCIALS, lookup } from '../icons'

function useTypewriter(lines, active) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (!active || !lines.length) return undefined
    let line = 0
    let char = 0
    let deleting = false
    let timer
    const step = () => {
      const full = lines[line]
      if (!deleting) {
        char++
        setText(full.slice(0, char))
        if (char === full.length) {
          if (lines.length === 1) return
          deleting = true
          timer = setTimeout(step, 2400)
          return
        }
        timer = setTimeout(step, 65 + Math.random() * 55)
      } else {
        char--
        setText(full.slice(0, char))
        if (char === 0) {
          deleting = false
          line = (line + 1) % lines.length
          timer = setTimeout(step, 380)
          return
        }
        timer = setTimeout(step, 32)
      }
    }
    timer = setTimeout(step, 900)
    return () => clearTimeout(timer)
  }, [lines, active])
  return text
}

/** Center card of the hero fan. Tilts toward the pointer with a moving glare. */
export default function ProfileCard({ profile, active }) {
  const cardRef = useRef(null)
  const bio = useTypewriter(profile.bio, active)
  useTilt(cardRef, { strength: 1 })

  return (
    <article ref={cardRef} className="glass glass--deep tilt profile">
      <div className="tilt__glare" />
      <div className="profile__avatar">
        <img src={profile.avatar} alt={profile.name} draggable="false" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
      </div>
      <h1 className="profile__name">{profile.name}</h1>
      <div className="profile__badges" aria-label="Badges">
        {profile.badges.map((b) => {
          const Icon = BADGES[b]
          return Icon ? <Icon key={b} strokeWidth={1.75} /> : null
        })}
      </div>
      <p className="profile__bio" aria-live="polite">
        {bio}
        <span className="caret" />
      </p>
      <nav className="profile__socials" aria-label="Socials">
        {profile.socials.map(({ type, url }, i) => {
          const { label, Icon } = lookup(SOCIALS, type)
          return (
            <a key={type + i} href={url} target="_blank" rel="noreferrer noopener" aria-label={label} title={label}>
              <Icon />
            </a>
          )
        })}
      </nav>
    </article>
  )
}
