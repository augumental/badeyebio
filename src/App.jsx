import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Eye, MapPin } from 'lucide-react'
import { config } from './config'
import useAudioPlayer from './hooks/useAudioPlayer'
import DitherBackground from './components/DitherBackground'
import EnterScreen from './components/EnterScreen'
import Hero from './components/Hero'
import SkillsSection from './components/SkillsSection'
import LyricsSection from './components/LyricsSection'
import ModsSection from './components/ModsSection'

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'stack', label: 'Stack' },
  { id: 'music', label: 'Music' },
  { id: 'mods', label: 'Mods' },
]
const AMBIENT = 0.55

export default function App() {
  const player = useAudioPlayer(config.tracks, config.volume)
  const [entered, setEntered] = useState(false)
  const [active, setActive] = useState(0)
  const scrollRef = useRef(0)
  const boostRef = useRef(0.25)
  const mainRef = useRef(null)
  const sectionRefs = useRef([])

  useEffect(() => {
    document.title = config.siteTitle
  }, [])

  const onEnter = useCallback(() => {
    player.play()
    boostRef.current = 1.3
    setTimeout(() => { boostRef.current = AMBIENT }, 800)
    setTimeout(() => setEntered(true), 450)
  }, [player])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number(e.target.dataset.index))
      },
      { root: mainRef.current, rootMargin: '-45% 0px -45% 0px' },
    )
    sectionRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const main = mainRef.current
    const onScroll = () => { scrollRef.current = main.scrollTop / Math.max(main.clientHeight, 1) }
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [])

  const goTo = useCallback((idOrIndex) => {
    const i = typeof idOrIndex === 'number' ? idOrIndex : TABS.findIndex((t) => t.id === idOrIndex)
    sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // Arrow keys move between tabs when the tab bar has focus (WAI-ARIA tabs pattern).
  const onTabKey = (e) => {
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!dir) return
    e.preventDefault()
    const next = (active + dir + TABS.length) % TABS.length
    goTo(next)
    e.currentTarget.querySelectorAll('[role="tab"]')[next]?.focus()
  }

  const sectionProps = (i) => ({
    ref: (el) => { sectionRefs.current[i] = el },
    'data-index': i,
    id: TABS[i].id,
    role: 'tabpanel',
    'aria-labelledby': `tab-${TABS[i].id}`,
    className: `section section--${TABS[i].id} ${entered && active === i ? 'is-active' : ''} ${entered ? 'is-entered' : ''}`,
  })

  return (
    <>
      <audio ref={player.audioRef} preload="auto" />
      <DitherBackground scrollRef={scrollRef} boostRef={boostRef} />
      <div className="atmos" aria-hidden="true"><div className="atmos__grid" /><div className="atmos__spot" /></div>

      {!entered && <EnterScreen {...config.enter} onEnter={onEnter} />}

      <header className={`topbar ${entered ? 'is-on' : ''}`}>
        <button type="button" className="btn btn--ghost btn--icon" onClick={player.toggleMute} aria-label={player.muted ? 'Unmute music' : 'Mute music'}>
          {player.muted ? <VolumeX /> : <Volume2 />}
        </button>
        <nav className="tabs" role="tablist" aria-label="Sections" onKeyDown={onTabKey} style={{ '--active': active }}>
          <span className="tabs__thumb" aria-hidden="true" />
          {TABS.map((t, i) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-controls={t.id}
              tabIndex={active === i ? 0 : -1}
              className="tabs__tab"
              onClick={() => goTo(i)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <span className="topbar__spacer" />
      </header>

      <main ref={mainRef} className={`snap ${entered ? 'is-entered' : ''}`}>
        <section {...sectionProps(0)}>
          <Hero config={config} player={player} entered={entered} goTo={goTo} />
        </section>
        <section {...sectionProps(1)}>
          <SkillsSection skills={config.skills} />
        </section>
        <section {...sectionProps(2)}>
          <LyricsSection player={player} active={entered && active === 2} />
        </section>
        <section {...sectionProps(3)}>
          <ModsSection mods={config.mods} />
        </section>
      </main>

      <footer className={`statusbar ${entered ? 'is-on' : ''}`}>
        <Eye aria-hidden="true" /> {config.footer.views.toLocaleString()}
        <span className="statusbar__sep" aria-hidden="true" />
        <MapPin aria-hidden="true" /> {config.footer.location}
      </footer>
    </>
  )
}
