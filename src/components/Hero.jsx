import { useRef } from 'react'
import { Play, Pause, Download } from 'lucide-react'
import ProfileCard from './ProfileCard'
import useTilt from '../hooks/useTilt'

function NowPlayingCard({ player, onOpen }) {
  const ref = useRef(null)
  useTilt(ref, { strength: 0.45 })
  const { track, playing, toggle } = player
  return (
    <aside ref={ref} className="glass tilt fan__side fan__side--left">
      <div className="tilt__glare" />
      <p className="side__label">Now playing</p>
      <div className="np">
        {track?.cover && <img className="np__cover" src={track.cover} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />}
        <div className="np__text">
          <strong>{track?.title}</strong>
          <span>{track?.artist}</span>
        </div>
      </div>
      <div className={`np__eq ${playing ? 'is-on' : ''}`} aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
      </div>
      <div className="side__row">
        <button type="button" className="btn btn--ghost btn--icon" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause /> : <Play />}
        </button>
        <button type="button" className="btn btn--outline" onClick={onOpen}>Open lyrics</button>
      </div>
    </aside>
  )
}

function LatestModCard({ mod, onOpen }) {
  const ref = useRef(null)
  useTilt(ref, { strength: 0.45 })
  return (
    <aside ref={ref} className="glass tilt fan__side fan__side--right">
      <div className="tilt__glare" />
      <p className="side__label">Latest mod</p>
      <strong className="side__title">{mod.name}</strong>
      <p className="side__desc">{mod.description}</p>
      <ul className="mod__tags">{mod.tags.map((t) => <li key={t} className="tag">{t}</li>)}</ul>
      <div className="side__row">
        <button type="button" className="btn btn--ghost" onClick={onOpen}><Download /> Get it</button>
      </div>
    </aside>
  )
}

export default function Hero({ config, player, entered, goTo }) {
  return (
    <div className="hero">
      <p className="eyebrow"><span>{config.enter.subtitle}</span></p>
      <div className="wordmark" aria-hidden="true">{config.profile.name.toLowerCase()}</div>
      <div className="fan">
        <NowPlayingCard player={player} onOpen={() => goTo('music')} />
        <ProfileCard profile={config.profile} active={entered} />
        {config.mods.items[0] && <LatestModCard mod={config.mods.items[0]} onOpen={() => goTo('mods')} />}
      </div>
    </div>
  )
}
