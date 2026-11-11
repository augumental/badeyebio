import { useEffect, useState } from 'react'

const TTL = 10 * 60 * 1000

const pickJar = (assets) =>
  assets.find((a) => /\.jar$/i.test(a.name) && !/(sources|dev|javadoc)/i.test(a.name)) || assets[0] || null

/**
 * All published GitHub releases for owner/repo, newest first, each with its main .jar.
 * Cached in sessionStorage so tab switches and reloads stay under the 60 req/h limit.
 * status: 'loading' | 'ready' | 'error'. A repo with no releases is 'ready' with [].
 */
export default function useReleases(owner, repo) {
  const [state, setState] = useState({ status: 'loading', releases: [] })

  useEffect(() => {
    const key = `rels:${owner}/${repo}`
    try {
      const cached = JSON.parse(sessionStorage.getItem(key) || 'null')
      if (cached && Date.now() - cached.at < TTL) {
        setState(cached.state)
        return undefined
      }
    } catch { /* storage blocked */ }

    const ctrl = new AbortController()
    fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=50`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then(async (res) => {
        if (res.status === 404) return { status: 'ready', releases: [] }
        if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`)
        const list = await res.json()
        const releases = (Array.isArray(list) ? list : [])
          .filter((r) => !r.draft)
          .map((r) => {
            const jar = pickJar(Array.isArray(r.assets) ? r.assets : [])
            return {
              id: r.id,
              tag: r.tag_name,
              name: r.name && r.name !== r.tag_name ? r.name : null,
              prerelease: !!r.prerelease,
              url: r.html_url,
              publishedAt: r.published_at,
              asset: jar ? { name: jar.name, url: jar.browser_download_url, size: jar.size } : null,
            }
          })
        return { status: 'ready', releases }
      })
      .then((next) => {
        setState(next)
        try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), state: next })) } catch { /* ignore */ }
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return
        console.warn(`[releases] ${owner}/${repo}:`, e.message)
        setState({ status: 'error', releases: [] })
      })
    return () => ctrl.abort()
  }, [owner, repo])

  return state
}
