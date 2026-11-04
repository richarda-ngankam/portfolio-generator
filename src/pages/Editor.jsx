import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DB } from '../db'
import { useAuth } from '../context/AuthContext'
import { useEditorState } from '../hooks/useEditorState'
import { THEMES, createPortfolio } from '../lib/portfolio'
import { completion, hasContent } from '../lib/portfolioStats'
import ContentPanel from '../components/editor/ContentPanel'
import Preview from '../components/editor/Preview'

const TABS = [
  { id: 'content', label: 'Contenu' },
  { id: 'style', label: 'Style' },
  { id: 'publish', label: 'Publication' },
]

export default function Editor() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()

  const editor = useEditorState()
  const { draft, dirty, load, undo, redo, canUndo, canRedo } = editor
  const [tab, setTab] = useState('content')
  const [problem, setProblem] = useState('')
  const loadedFor = useRef(null)

  const themeParam = params.get('theme')
  const themeId = THEMES.some((t) => t.id === themeParam) ? themeParam : 'une'

  /* ---------- Chargement : nouveau portfolio vide ou portfolio existant ---------- */
  useEffect(() => {
    if (id === 'new') {
      const key = `new:${themeId}`
      if (loadedFor.current === key) return
      loadedFor.current = key
      setProblem('')
      load(createPortfolio(themeId))
      return
    }

    if (authLoading) return
    if (!user) {
      navigate('/connexion', { state: { from: location }, replace: true })
      return
    }
    if (loadedFor.current === id) return
    loadedFor.current = id
    setProblem('')

    DB.getPortfolio(id)
      .then((p) => {
        if (!p) setProblem("Ce portfolio n'existe pas ou a été supprimé.")
        else load({ ...p, statut: 'brouillon' })
      })
      .catch((e) => setProblem(e.message || 'Impossible de charger ce portfolio.'))
  }, [id, themeId, authLoading, user, load, navigate, location])

  /* ---------- Raccourcis Ctrl+Z / Ctrl+Y ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const k = e.key.toLowerCase()
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (k === 'y' || (k === 'z' && e.shiftKey)) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  /* ---------- Avertissement si on ferme l'onglet avec du contenu non enregistré ---------- */
  useEffect(() => {
    if (!dirty || !hasContent(draft)) return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, draft])

  /* ---------- États d'attente et d'erreur ---------- */
  if (problem) {
    return (
      <main style={{ padding: 40 }}>
        <p style={{ color: 'var(--danger)' }}>{problem}</p>
        <button className="btn" onClick={() => navigate(user ? '/dashboard' : '/')}>← Retour</button>
      </main>
    )
  }
  if (!draft) {
    return <main className="small muted" style={{ padding: 40 }}>Chargement…</main>
  }

  const theme = THEMES.find((t) => t.id === draft.themeId)
  const saved = id !== 'new' && !dirty
  const percent = completion(draft)

  // Provisoire : la sortie « Enregistrer ? » arrive à l'étape 3.5
  const goBack = () => navigate(user ? '/dashboard' : '/')

  return (
    <div className="editor-page">
      <div className="editor-top">
        <div className="editor-top-left">
          <button className="btn btn-sm" onClick={goBack}>← Retour</button>
          <div>
            <strong>{theme?.name || 'Folio'}</strong>
            <div className="small muted">{theme?.description}</div>
          </div>
        </div>
        <div className="editor-top-right">
          <span className="pill"><span className="dot" />{saved ? 'Enregistré' : 'Brouillon'}</span>
          <button className="btn btn-sm optional" onClick={undo} disabled={!canUndo} title="Annuler (Ctrl+Z)">↶</button>
          <button className="btn btn-sm optional" onClick={redo} disabled={!canRedo} title="Rétablir (Ctrl+Y)">↷</button>
          <button className="btn btn-primary btn-sm" disabled title="Disponible au Bloc 5">Exporter ↗</button>
        </div>
      </div>

      <div className="editor-layout">
        <aside className="editor-sidebar">
          <div className="progress-wrap">
            <div className="progress-label">
              <span>Complétion</span>
              <strong>{percent}%</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'content' && <ContentPanel draft={draft} editor={editor} />}
          {tab === 'style' && <p className="section-description">Thème, couleurs et forme de la photo : étape 3.6.</p>}
          {tab === 'publish' && <p className="section-description">Publication : Bloc 5.</p>}
        </aside>

        <Preview draft={draft} />
      </div>
    </div>
  )
}