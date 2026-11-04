import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DB } from '../db'
import { useAuth } from '../context/AuthContext'
import { useEditorState } from '../hooks/useEditorState'
import { THEMES, createPortfolio, uid } from '../lib/portfolio'
import { completion, hasContent } from '../lib/portfolioStats'
import { stashDraft } from '../lib/pendingDraft'
import ContentPanel from '../components/editor/ContentPanel'
import StylePanel from '../components/editor/StylePanel'
import PublishPanel from '../components/editor/PublishPanel'
import Preview from '../components/editor/Preview'
import ExitDialog from '../components/ExitDialog'

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
  const { draft, dirty, load, markSaved, undo, redo, canUndo, canRedo } = editor
  const [tab, setTab] = useState('content')
  const [problem, setProblem] = useState('')
  const [exitDialog, setExitDialog] = useState(null) // { to: '/dashboard' }
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const loadedFor = useRef(null)
  const origStatus = useRef('brouillon')
  const saveRef = useRef(null)

  const themeParam = params.get('theme')
  const themeId = THEMES.some((t) => t.id === themeParam) ? themeParam : 'une'

  /* ---------- Enregistrement ---------- */
  // Enregistre dans Firestore. Un portfolio archivé reste archivé.
  async function persist() {
    if (!draft) return null
    setSaving(true)
    setSaveError('')
    try {
      const statut = origStatus.current === 'archivé' ? 'archivé' : 'enregistré'
      const saved = await DB.savePortfolio({ ...draft, id: draft.id || uid(), statut })
      markSaved()
      return saved
    } catch (e) {
      setSaveError(e.message || "L'enregistrement a échoué.")
      return null
    } finally {
      setSaving(false)
    }
  }

  // Visiteur non connecté : on garde le brouillon le temps de la connexion.
  // Le tableau de bord l'enregistre ensuite automatiquement.
  function saveAsGuest(intent) {
    const pid = draft.id || uid()
    const after = intent === 'stay' ? `/editor/${pid}` : '/dashboard'
    try {
      stashDraft({ ...draft, id: pid }, after)
    } catch {
      setSaveError(
        'Brouillon trop volumineux pour être conservé pendant la connexion : réduis la taille des images.'
      )
      return
    }
    setExitDialog(null)
    navigate('/connexion', { state: { from: { pathname: '/dashboard', search: '', hash: '' } } })
  }

  // Bouton « Enregistrer » et Ctrl+S : on reste dans l'éditeur
  async function saveNow() {
    if (!draft || saving || !hasContent(draft)) return
    if (!user) {
      saveAsGuest('stay')
      return
    }
    const result = await persist()
    if (result && id === 'new') {
      loadedFor.current = result.id // évite de recharger le portfolio qu'on vient d'enregistrer
      navigate(`/editor/${result.id}`, { replace: true })
    }
  }

  // Appelé par l'onglet Publication après un enregistrement réussi
  function afterPublishSave(result) {
    origStatus.current = result.statut
    if (id === 'new') {
      loadedFor.current = result.id
      navigate(`/editor/${result.id}`, { replace: true })
    }
  }

  /* ---------- Sortie de l'éditeur ---------- */
  // Rien d'écrit : on sort sans rien demander. Sinon : « Enregistrer ? ».
  function requestLeave(to) {
    if (saving) return
    if (dirty && hasContent(draft)) {
      setSaveError('')
      setExitDialog({ to })
    } else {
      navigate(to)
    }
  }

  async function onYes() {
    if (!user) {
      saveAsGuest('exit')
      return
    }
    const result = await persist()
    if (result) {
      const to = exitDialog.to
      setExitDialog(null)
      navigate(to)
    }
  }

  function onNo() {
    const to = exitDialog.to
    setExitDialog(null)
    navigate(to)
  }

  function onCancel() {
    setExitDialog(null)
    setSaveError('')
  }

  /* ---------- Chargement : nouveau portfolio vide ou portfolio existant ---------- */
  useEffect(() => {
    if (id === 'new') {
      const key = `new:${themeId}`
      if (loadedFor.current === key) return
      loadedFor.current = key
      origStatus.current = 'brouillon'
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
        if (!p) {
          setProblem("Ce portfolio n'existe pas ou a été supprimé.")
        } else {
          origStatus.current = p.statut
          load({ ...p, statut: 'brouillon' })
        }
      })
      .catch((e) => setProblem(e.message || 'Impossible de charger ce portfolio.'))
  }, [id, themeId, authLoading, user, load, navigate, location])

  /* ---------- Raccourcis Ctrl+S, Ctrl+Z, Ctrl+Y ---------- */
  useEffect(() => {
    saveRef.current = saveNow
  })

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const k = e.key.toLowerCase()
      if (k === 's') {
        e.preventDefault()
        saveRef.current?.()
      } else if (k === 'z' && !e.shiftKey) {
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
  const isSaved = id !== 'new' && !dirty
  const percent = completion(draft)
  const canSave = !saving && hasContent(draft) && (id === 'new' || dirty)

  return (
    <div className="editor-page">
      <div className="editor-top">
        <div className="editor-top-left">
          <button className="btn btn-sm" onClick={() => requestLeave(user ? '/dashboard' : '/')}>
            ← Retour
          </button>
          <div>
            <strong>{theme?.name || 'Folio'}</strong>
            <div className="small muted">{theme?.description}</div>
          </div>
        </div>
        <div className="editor-top-right">
          {saveError && !exitDialog && (
            <span className="small" style={{ color: 'var(--danger)' }}>{saveError}</span>
          )}
          <span className="pill">
            <span className="dot" />
            {saving ? 'Enregistrement…' : isSaved ? 'Enregistré' : 'Brouillon'}
          </span>
          <button className="btn btn-sm optional" onClick={undo} disabled={!canUndo} title="Annuler (Ctrl+Z)">↶</button>
          <button className="btn btn-sm optional" onClick={redo} disabled={!canRedo} title="Rétablir (Ctrl+Y)">↷</button>
          <button className="btn btn-sm" onClick={saveNow} disabled={!canSave} title="Enregistrer (Ctrl+S)">
            Enregistrer
          </button>
          <button className="btn btn-primary btn-sm" disabled title="Disponible à l'étape 5.2">Exporter ↗</button>
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
          {tab === 'style' && <StylePanel draft={draft} editor={editor} />}
          {tab === 'publish' && (
            <PublishPanel
              draft={draft}
              editor={editor}
              user={user}
              requireLogin={() => saveAsGuest('stay')}
              onSaved={afterPublishSave}
            />
          )}
        </aside>

        <Preview draft={draft} />
      </div>

      {exitDialog && (
        <ExitDialog
          guest={!user}
          saving={saving}
          error={saveError}
          onYes={onYes}
          onNo={onNo}
          onCancel={onCancel}
        />
      )}
    </div>
  )
}