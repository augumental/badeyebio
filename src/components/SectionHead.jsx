export default function SectionHead({ eyebrow, title, lede }) {
  return (
    <header className="head">
      {eyebrow && <p className="eyebrow"><span>{eyebrow}</span></p>}
      {title && <h2 className="head__title">{title}</h2>}
      {lede && <p className="head__lede">{lede}</p>}
    </header>
  )
}
