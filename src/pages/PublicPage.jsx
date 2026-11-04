import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DB } from '../db'
import { renderPortfolio } from '../render/themes'

export default function PublicPage() {
  const { slug } = useParams()
  const [state, setState] = useState({ status: 'loading', data: null })

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', data: null })
    DB.getPublished(slug)
      .then((data) => alive && setState(data?.portfolio ? { status: 'ready', data } : { status: 'missing', data: null }))
      .catch(() => alive && setState({ status: 'error', data: null }))
    return () => {
      alive = false
    }
  }, [slug])

  // Titre de l'onglet, description, et « noindex » pour les pages non listées
  useEffect(() => {
    if (state.status !== 'ready') return
    const p = state.data.portfolio
    const previousTitle = document.title
    document.title = p.publication?.title || `${p.name || 'Portfolio'} — Portfolio`
    const created = []
    const addMeta = (name, content) => {
      const el = document.createElement('meta')
      el.name = name
      el.content = content
      document.head.appendChild(el)
      created.push(el)
    }
    if (p.publication?.description) addMeta('description', p.publication.description)
    if (state.data.visibility === 'unlisted') addMeta('robots', 'noindex')
    return () => {
      document.title = previousTitle
      created.forEach((el) => el.remove())
    }
  }, [state])

  const html = useMemo(
    () => (state.status === 'ready' ? renderPortfolio(state.data.portfolio) : ''),
    [state]
  )

  if (state.status === 'loading') {
    return <main className="small muted" style={{ padding: 40 }}>Chargement…</main>
  }

  if (state.status !== 'ready') {
    return (
      <div className="container empty">
        <h2>{state.status === 'error' ? 'Impossible de charger cette page' : "Cette page n'existe pas ou n'est plus publiée"}</h2>
        <Link className="btn btn-primary" to="/">Retour à l'accueil</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '35px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link to="/" style={{ fontWeight: 800, fontSize: 20, textDecoration: 'none', color: 'var(--text)' }}>
          Folio
        </Link>
        <span className="pill">Publié avec Folio</span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}