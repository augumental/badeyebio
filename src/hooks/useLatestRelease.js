import { useEffect, useState } from 'react'

const TTL = 10 * 60 * 1000

/**
 * Latest GitHub release for owner/repo, with the first .jar asset if any.
 * Cached in sessionStorage to stay well under the 60 req/h unauthenticated limit.
 * status: 'loading' | 'ready' | 'none' (no release published) | 'error'
 */
export default function useLatestRelease(owner, repo) {
  const [state, setState] = useState({ status: 'loading', release: null })

  useEffect(() => {
    const key = `rel:${owner}/${repo}`
    try {
      const cached = JSON.parse(sessionStorage.getItem(key) || 'null')
      if (cached && Date.now() - cached.at < TTL) {
        setState(cached.state)
        return undefined
      }
    } catch { /* storage blocked */ }

    const ctrl = new AbortController()
    fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then(async (res) => {
        if (res.status === 404) return { status: 'none', release: null }
        if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`)
        const r = await res.json()
        const assets = Array.isArray(r.assets) ? r.assets : []
        const jar = assets.find((a) => /\.jar$/i.test(a.name) && !/sources|dev/i.test(a.name)) || assets[0] || null
        return {
          status: 'ready',
          release: {
            tag: r.tag_name,
            name: r.name || r.tag_name,
            url: r.html_url,
            publishedAt: r.published_at,
            asset: jar ? { name: jar.name, url: jar.browser_download_url, size: jar.size, downloads: jar.download_count } : null,
          },
        }
      })
      .then((next) => {
        setState(next)
        try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), state: next })) } catch { /* ignore */ }
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return
        console.warn(`[release] ${owner}/${repo}:`, e.message)
        setState({ status: 'error', release: null })
      })
    return () => ctrl.abort()
  }, [owner, repo])

  return state
}
