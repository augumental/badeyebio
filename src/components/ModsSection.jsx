import { useEffect, useState } from 'react'
import { Download, Github, Boxes } from 'lucide-react'
import useReleases from '../hooks/useReleases'
import SectionHead from './SectionHead'
import VersionSelect from './VersionSelect'

const kb = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

function ModCard({ owner, mod }) {
  const { status, releases } = useReleases(owner, mod.repo)
  const [selectedId, setSelectedId] = useState(null)
  const [raised, setRaised] = useState(false)
  const repoUrl = `https://github.com/${owner}/${mod.repo}`

  useEffect(() => {
    if (releases.length && !releases.some((r) => r.id === selectedId)) setSelectedId((releases.find((r) => !r.prerelease) || releases[0]).id)
  }, [releases, selectedId])

  const release = releases.find((r) => r.id === selectedId) || null
  const asset = release?.asset

  let meta = 'Checking for versions'
  if (status === 'error') meta = 'Couldn’t reach GitHub. Use the source link.'
  else if (status === 'ready' && !releases.length) meta = 'No versions published yet'
  else if (release && asset) meta = `${asset.name}, ${kb(asset.size)}`
  else if (release) meta = `${release.tag} has no jar attached`

  const count = releases.length

  return (
    <article className={`glass mod ${raised ? 'is-raised' : ''}`}>
      <div className="mod__icon">
        {mod.icon ? <img src={mod.icon} alt="" /> : <Boxes strokeWidth={1.5} />}
      </div>
      <div className="mod__body">
        <h3 className="mod__name">{mod.name}</h3>
        <p className="mod__desc">{mod.description}</p>
        <ul className="mod__tags">
          {mod.tags.map((t) => <li key={t} className="tag">{t}</li>)}
          {count > 1 && <li className="tag">{count} versions</li>}
        </ul>
      </div>
      <div className="mod__actions">
        <VersionSelect
          releases={releases}
          value={release?.id}
          onChange={setSelectedId}
          disabled={status !== 'ready'}
          placeholder={status === 'loading' ? 'Loading' : 'No versions'}
          onOpenChange={setRaised}
        />
        <div className="mod__buttons">
          {asset ? (
            <a className="btn btn--cta" href={asset.url} download>
              <Download /> Download
            </a>
          ) : (
            <a className="btn btn--ghost" href={release ? release.url : `${repoUrl}/releases`} target="_blank" rel="noreferrer noopener">
              <Download /> Releases
            </a>
          )}
          <a className="btn btn--outline btn--icon" href={repoUrl} target="_blank" rel="noreferrer noopener" aria-label={`${mod.name} source on GitHub`} title="Source">
            <Github />
          </a>
        </div>
        <span className={`mod__meta ${status === 'loading' ? 'is-loading' : ''}`}>{meta}</span>
      </div>
    </article>
  )
}

export default function ModsSection({ mods }) {
  return (
    <div className="wrap">
      <SectionHead eyebrow="Mods" title="Fabric mods" lede={mods.note} />
      <div className="mods">
        {mods.items.map((m) => <ModCard key={m.repo} owner={mods.githubUser} mod={m} />)}
      </div>
    </div>
  )
}
