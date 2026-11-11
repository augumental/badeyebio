import { useEffect, useState } from 'react'

export default function EnterScreen({ title, subtitle, onEnter }) {
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  const enter = () => {
    if (leaving) return
    setLeaving(true)
    onEnter()
    setTimeout(() => setGone(true), 1200)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        enter()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (gone) return null

  return (
    <div className={`enter ${leaving ? 'enter--leaving' : ''}`} onClick={enter} role="button" tabIndex={0} aria-label={title}>
      <div className="atmos" aria-hidden="true"><div className="atmos__grid" /><div className="atmos__spot" /></div>
      <div className="enter__inner">
        <p className="enter__title">{title}</p>
        <p className="enter__sub">{subtitle}</p>
      </div>
    </div>
  )
}
