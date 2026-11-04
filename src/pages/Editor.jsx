import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { THEMES, createPortfolio } from '../lib/portfolio'

export default function Editor() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const [portfolio] = useState(() => {
    if (id !== 'new') return null
    const t = params.get('theme')
    return createPortfolio(THEMES.some((x) => x.id === t) ? t : 'une')
  })

  return (
    <main style={{ padding: 40 }}>
      <h1>Éditeur</h1>
      <p className="muted">
        {portfolio
          ? `Nouveau portfolio vide, thème : ${portfolio.themeId}`
          : `Portfolio existant : ${id}`}
      </p>
    </main>
  )
}