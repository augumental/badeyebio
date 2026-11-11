import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const date = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Accessible listbox dropdown for picking a release. */
export default function VersionSelect({ releases, value, onChange, disabled, placeholder, onOpenChange }) {
  const [open, setOpen] = useState(false)
  const [focus, setFocus] = useState(0)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const btnRef = useRef(null)
  const id = useId()
  const selectedIndex = Math.max(0, releases.findIndex((r) => r.id === value))
  const selected = releases[selectedIndex]
  // GitHub's "latest" is the newest non-prerelease; fall back to newest if all are prereleases.
  const latestId = (releases.find((r) => !r.prerelease) || releases[0])?.id

  useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current?.focus()
    listRef.current?.querySelector(`[data-i="${focus}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, focus])

  const openList = () => {
    if (disabled || !releases.length) return
    setFocus(selectedIndex)
    setOpen(true)
  }
  const choose = (i) => {
    onChange(releases[i].id)
    setOpen(false)
    btnRef.current?.focus()
  }

  const onListKey = (e) => {
    const last = releases.length - 1
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocus((f) => Math.min(f + 1, last)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocus((f) => Math.max(f - 1, 0)) }
    else if (e.key === 'Home') { e.preventDefault(); setFocus(0) }
    else if (e.key === 'End') { e.preventDefault(); setFocus(last) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(focus) }
    else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); if (e.key === 'Escape') btnRef.current?.focus() }
  }

  return (
    <div ref={rootRef} className={`vsel ${open ? 'is-open' : ''}`}>
      <button
        ref={btnRef}
        type="button"
        className="vsel__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        disabled={disabled || !releases.length}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openList() } }}
      >
        <span className="vsel__value">
          {selected ? selected.tag : placeholder}
          {selected && selected.id === latestId && <span className="vsel__latest">Latest</span>}
        </span>
        <ChevronDown className="vsel__chev" aria-hidden="true" />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          className="vsel__list glass glass--deep"
          role="listbox"
          tabIndex={-1}
          aria-label="Version"
          aria-activedescendant={`${id}-opt-${focus}`}
          onKeyDown={onListKey}
        >
          {releases.map((r, i) => (
            <li
              key={r.id}
              id={`${id}-opt-${i}`}
              data-i={i}
              role="option"
              aria-selected={r.id === selected?.id}
              className={`vsel__opt ${i === focus ? 'is-focus' : ''}`}
              onPointerEnter={() => setFocus(i)}
              onClick={() => choose(i)}
            >
              <span className="vsel__tag">
                {r.tag}
                {r.id === latestId && <span className="vsel__latest">Latest</span>}
                {r.prerelease && <span className="vsel__pre">Pre-release</span>}
              </span>
              <span className="vsel__sub">
                {r.name ? `${r.name}, ` : ''}{date(r.publishedAt)}{r.asset ? '' : ', no jar'}
              </span>
              {r.id === selected?.id && <Check className="vsel__check" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
