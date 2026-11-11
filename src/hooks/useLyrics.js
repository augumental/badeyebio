import { useEffect, useState } from 'react'

const TS = /\[(\d{1,2}):(\d{1,2}(?:[.:]\d{1,3})?)\]/g

/** Parses LRC text into [{ time, text }] sorted by time. Handles multi-stamp lines and [offset:]. */
export function parseLrc(raw) {
  if (!raw || typeof raw !== 'string') return []
  const offsetMatch = raw.match(/\[offset:\s*([+-]?\d+)\s*\]/i)
  const offset = offsetMatch ? Number(offsetMatch[1]) / 1000 : 0
  const lines = []
  for (const row of raw.split(/\r?\n/)) {
    const stamps = [...row.matchAll(TS)]
    if (!stamps.length) continue
    const text = row.replace(TS, '').trim()
    for (const [, mm, ss] of stamps) {
      const time = Number(mm) * 60 + Number(ss.replace(':', '.')) - offset
      if (Number.isFinite(time)) lines.push({ time: Math.max(0, time), text })
    }
  }
  return lines.sort((a, b) => a.time - b.time).filter((l, i, arr) => l.text || (arr[i + 1] && arr[i + 1].text))
}

async function fromFile(url, signal) {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const type = res.headers.get('content-type') || ''
  if (type.includes('text/html')) throw new Error('not an lrc file')
  return parseLrc(await res.text())
}

async function fromLrclib(track, signal) {
  const q = new URLSearchParams({ track_name: track.title, artist_name: track.artist.split(/[&,]/)[0].trim() })
  const res = await fetch(`https://lrclib.net/api/search?${q}`, { signal })
  if (!res.ok) throw new Error(`lrclib HTTP ${res.status}`)
  const results = await res.json()
  const hit = Array.isArray(results) && results.find((r) => r.syncedLyrics)
  if (!hit) throw new Error('lrclib: no synced lyrics')
  return parseLrc(hit.syncedLyrics)
}

/** Resolves synced lyrics for a track: local .lrc first, then lrclib.net. */
export default function useLyrics(track) {
  const [state, setState] = useState({ lines: [], status: 'idle', source: null })

  useEffect(() => {
    if (!track) return undefined
    const ctrl = new AbortController()
    const cacheKey = `lrc:${track.artist}:${track.title}`
    setState({ lines: [], status: 'loading', source: null })

    ;(async () => {
      const attempts = []
      if (track.lrc) attempts.push(['file', () => fromFile(track.lrc, ctrl.signal)])
      attempts.push(['cache', async () => {
        try { return JSON.parse(localStorage.getItem(cacheKey) || '[]') } catch { return [] }
      }])
      attempts.push(['lrclib', () => fromLrclib(track, ctrl.signal)])

      for (const [source, run] of attempts) {
        try {
          const lines = await run()
          if (lines.length) {
            if (source === 'lrclib') {
              try { localStorage.setItem(cacheKey, JSON.stringify(lines)) } catch { /* storage full or blocked */ }
            }
            setState({ lines, status: 'ready', source })
            return
          }
        } catch (e) {
          if (ctrl.signal.aborted) return
          console.info(`[lyrics] ${source} failed:`, e.message)
        }
      }
      if (!ctrl.signal.aborted) setState({ lines: [], status: 'missing', source: null })
    })()

    return () => ctrl.abort()
  }, [track])

  return state
}
