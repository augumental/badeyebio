import { Download, Github, Boxes } from 'lucide-react'
import useLatestRelease from '../hooks/useLatestRelease'
import SectionHead from './SectionHead'

const kb = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

function ModCard({ owner, mod }) {
  const { status, release } = useLatestRelease(owner, mod.repo)
  const repoUrl = `https://github.com/${owner}/${mod.repo}`
  const asset = release?.asset

  let meta = 'Checking for releases'
  if (status === 'ready' && asset) meta = `${release.tag}, ${kb(asset.size)}`
  else if (status === 'ready') meta = `${release.tag} has no jar attached`
  else if (status === 'none') meta = 'No release published yet'
  else if (status === 'error') meta = 'Couldn’t reach GitHub. Use the source link.'

  return (
    <article className="glass mod">
      <div className="mod__icon">
        {mod.icon ? <img src={mod.icon} alt="" /> : <Boxes strokeWidth={1.5} />}
      </div>
      <div className="mod__body">
        <h3 className="mod__name">{mod.name}</h3>
        <p className="mod__desc">{mod.description}</p>
        <ul className="mod__tags">
          {mod.tags.map((t) => <li key={t} className="tag">{t}</li>)}
        </ul>
      </div>
      <div className="mod__actions">
        {asset ? (
          <a className="btn btn--cta" href={asset.url} download>
            <Download /> Download
          </a>
        ) : (
          <a className="btn btn--ghost" href={status === 'ready' ? release.url : `${repoUrl}/releases`} target="_blank" rel="noreferrer noopener">
            <Download /> Releases
          </a>
        )}
        <a className="btn btn--outline" href={repoUrl} target="_blank" rel="noreferrer noopener">
          <Github /> Source
        </a>
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
