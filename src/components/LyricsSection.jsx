import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SkipBack, SkipForward, Play, Pause } from 'lucide-react'
import useLyrics from '../hooks/useLyrics'
import SectionHead from './SectionHead'

const fmt = (t) => {
  if (!Number.isFinite(t) || t < 0) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function activeIndex(lines, t) {
  let lo = 0
  let hi = lines.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (lines[mid].time <= t + 0.15) {
      ans = mid
      lo = mid + 1
    } else hi = mid - 1
  }
  return ans
}

export default function LyricsSection({ player, active }) {
  const { audioRef, track, playing, duration, error, toggle, seek, next, prev } = player
  const { lines, status } = useLyrics(track)
  const [current, setCurrent] = useState(-1)
  const fillRef = useRef(null)
  const timeRef = useRef(null)
  const listRef = useRef(null)
  const viewRef = useRef(null)
  const lineRefs = useRef([])
  const barRef = useRef(null)
  const dragging = useRef(false)

  // 60fps clock: progress bar + time + active line, without re-rendering every frame.
  useEffect(() => {
    let raf = 0
    let last = -2
    const loop = () => {
      const audio = audioRef.current
      if (audio) {
        const t = audio.currentTime
        const d = audio.duration || duration || 0
        if (fillRef.current && !dragging.current) fillRef.current.style.transform = `scaleX(${d ? t / d : 0})`
        if (timeRef.current) timeRef.current.textContent = fmt(t)
        const idx = activeIndex(lines, t)
        if (idx !== last) {
          last = idx
          setCurrent(idx)
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [audioRef, lines, duration])

  // Keep the active line vertically centered.
  useLayoutEffect(() => {
    const list = listRef.current
    const view = viewRef.current
    if (!list || !view) return
    const el = lineRefs.current[Math.max(current, 0)]
    const target = el ? el.offsetTop + el.offsetHeight / 2 : 0
    list.style.transform = `translateY(${view.clientHeight / 2 - target}px)`
  }, [current, lines, active])

  const seekFromPointer = (clientX) => {
    const bar = barRef.current
    const audio = audioRef.current
    if (!bar || !audio) return
    const r = bar.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (clientX - r.left) / r.width))
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`
    seek(p * (audio.duration || duration || 0))
  }

  const onBarDown = (e) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    seekFromPointer(e.clientX)
  }
  const onBarMove = (e) => dragging.current && seekFromPointer(e.clientX)
  const onBarUp = (e) => {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const message =
    error ? error
      : status === 'loading' ? 'loading lyrics...'
        : status === 'missing' ? 'no synced lyrics found - add an .lrc file in /public/lyrics'
          : null

  return (
    <div className="wrap">
    <SectionHead eyebrow="Now playing" />
    <div className="glass glass--deep player">
      <div className="player__bg" style={{ backgroundImage: track?.cover ? `url(${track.cover})` : undefined }} />
      <header className="player__head">
        {track?.cover && <img className="player__cover" src={track.cover} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />}
        <div className="player__meta">
          <div className="player__title">{track?.title}</div>
          <div className="player__row">
            <span ref={timeRef} className="player__time">0:00</span>
            <div
              ref={barRef}
              className="player__bar"
              onPointerDown={onBarDown}
              onPointerMove={onBarMove}
              onPointerUp={onBarUp}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              tabIndex={0}
              onKeyDown={(e) => {
                const a = audioRef.current
                if (!a) return
                if (e.key === 'ArrowRight') seek(a.currentTime + 5)
                if (e.key === 'ArrowLeft') seek(a.currentTime - 5)
              }}
            >
              <div ref={fillRef} className="player__fill" />
            </div>
            <span className="player__time">{fmt(duration)}</span>
            <div className="player__controls">
              <button type="button" onClick={prev} aria-label="Previous"><SkipBack fill="currentColor" /></button>
              <button type="button" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="player__pp">
                {playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
              </button>
              <button type="button" onClick={next} aria-label="Next"><SkipForward fill="currentColor" /></button>
            </div>
          </div>
        </div>
      </header>

      <div ref={viewRef} className="player__lyrics">
        {message ? (
          <p className="player__msg">{message}</p>
        ) : (
          <ol ref={listRef} className="player__list">
            {lines.map((l, i) => {
              const dist = current < 0 ? i + 1 : Math.abs(i - current)
              return (
                <li
                  key={`${l.time}-${i}`}
                  ref={(el) => { lineRefs.current[i] = el }}
                  className={`lyric ${i === current ? 'is-active' : ''} ${i < current ? 'is-past' : ''}`}
                  style={{ '--dist': Math.min(dist, 4) }}
                  onClick={() => seek(l.time)}
                >
                  {l.text || '♪'}
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
    </div>
  )
}
