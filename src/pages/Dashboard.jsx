import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DB } from '../db'
import { useAuth } from '../context/AuthContext'
import { THEMES, uid, slugify, formatDate } from '../lib/portfolio'
import MiniPreview from '../components/MiniPreview'
import ConfirmDialog from '../components/ConfirmDialog'
import ThemePicker from '../components/ThemePicker'

const TABS = [
  { id: 'ongoing', label: 'En cours', statuts: ['brouillon', 'enregistré'] },
  { id: 'archives', label: 'Archives', statuts: ['archivé'] },
  { id: 'trash', label: 'Corbeille', statuts: ['corbeille'] },
]

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('ongoing')
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [picking, setPicking] = useState(false)

  const load = useCallback(async () => {
    try {
      setItems(await DB.listPortfolios())
      setError('')
    } catch (e) {
      setError(e.message || 'Impossible de charger vos portfolios.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Exécute une action puis recharge la liste
  async function run(action) {
    try {
      await action()
      await load()
    } catch (e) {
      setError(e.message || 'Une erreur est survenue.')
    }
  }

  const setStatus = (p, statut) => run(() => DB.savePortfolio({ ...p, statut }))

  const duplicate = (p) =>
    run(() => {
      const titre = (p.titre || p.name || 'Portfolio') + ' — copie'
      return DB.savePortfolio({
        ...structuredClone(p),
        id: uid(),
        titre,
        slug: slugify(titre).slice(0, 40),
        statut: 'enregistré',
        visibilité: 'privé',
        publication: { ...(p.publication || {}), active: false },
        publishedSnapshot: null,
        versions: [],
      })
    })

  const askDelete = (p) =>
    setConfirm({
      title: 'Confirmer la suppression ?',
      message: 'Le portfolio sera déplacé vers la corbeille.',
      onYes: () =>
        run(async () => {
          if (p.publication?.active && p.slug) {
            try {
              await DB.unpublish(p.slug)
            } catch (e) {
              // Copie publiée déjà absente
            }
          }
          await DB.savePortfolio({
            ...p,
            statut: 'corbeille',
            publication: { ...(p.publication || {}), active: false },
          })
        }),
    })

  const askEmptyTrash = () =>
    setConfirm({
      title: 'Vider la corbeille',
      message: 'Supprimer définitivement tous les portfolios de la corbeille ?',
      onYes: () =>
        run(async () => {
          const trash = items.filter((p) => p.statut === 'corbeille')
          for (const p of trash) await DB.removePortfolio(p.id)
        }),
    })

  const current = TABS.find((t) => t.id === tab)
  const query = search.trim().toLowerCase()
  const visible = items.filter(
    (p) =>
      current.statuts.includes(p.statut) &&
      [p.titre, p.name, p.profession].filter(Boolean).join(' ').toLowerCase().includes(query)
  )

  return (
    <div className="container dashboard">
      <div className="dashboard-top">
        <div>
          <h1 className="section-title">Mes portfolios</h1>
          <p className="muted">
            Bonjour {user.displayName || user.email}. Retrouvez et gérez vos créations.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setPicking(true)}>
          ＋ Créer un portfolio
        </button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="dashboard-tools">
        <input
          placeholder="Rechercher un portfolio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {tab === 'trash' && (
          <button className="btn btn-danger" onClick={askEmptyTrash}>Vider la corbeille</button>
        )}
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}

      {loading ? (
        <p className="small muted">Chargement…</p>
      ) : visible.length ? (
        <div className="portfolio-grid">
          {visible.map((p) => {
            const theme = THEMES.find((x) => x.id === p.themeId) || THEMES[0]
            return (
              <article key={p.id} className="portfolio-card">
                <div className="portfolio-thumb"><MiniPreview theme={theme} /></div>
                <div className="portfolio-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <h3>{p.titre || p.name || 'Portfolio'}</h3>
                    <span className="pill">{theme.name}</span>
                  </div>
                  <p className="muted small">
                    {p.profession || ''} · {formatDate(p.dateModification)}
                  </p>
                  <div className="portfolio-actions">
                    {p.statut !== 'corbeille' && (
                      <>
                        <button className="btn" onClick={() => navigate(`/editor/${p.id}`)}>Modifier</button>
                        <button className="btn" onClick={() => duplicate(p)}>Dupliquer</button>
                      </>
                    )}
                    {p.statut === 'archivé' || p.statut === 'corbeille' ? (
                      <button className="btn" onClick={() => setStatus(p, 'enregistré')}>Restaurer</button>
                    ) : (
                      <button className="btn" onClick={() => setStatus(p, 'archivé')}>Archiver</button>
                    )}
                    {p.statut !== 'corbeille' && (
                      <button className="btn btn-danger" onClick={() => askDelete(p)}>Supprimer</button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : query ? (
        <div className="empty">
          <div className="empty-icon">▧</div>
          <h3>Aucun résultat</h3>
          <p>Aucun portfolio ne correspond à « {search} ».</p>
        </div>
      ) : tab === 'ongoing' ? (
        <div className="empty">
          <div className="empty-icon">▧</div>
          <h3>Aucun portfolio pour le moment</h3>
          <p>Choisissez un modèle pour commencer votre premier portfolio.</p>
          <button className="btn btn-primary" onClick={() => setPicking(true)}>
            Créer un portfolio
          </button>
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">▧</div>
          <h3>{tab === 'archives' ? 'Aucune archive' : 'La corbeille est vide'}</h3>
          <p>
            {tab === 'archives'
              ? 'Les portfolios que vous archivez apparaissent ici.'
              : 'Les portfolios supprimés apparaissent ici avant leur suppression définitive.'}
          </p>
        </div>
      )}

      <div className="account-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <strong>Mon compte</strong>
            <p className="muted small">{user.email}</p>
          </div>
          <button
            className="btn btn-sm btn-danger"
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      {picking && <ThemePicker onClose={() => setPicking(false)} />}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const fn = confirm.onYes
            setConfirm(null)
            fn()
          }}
        />
      )}
    </div>
  )
}