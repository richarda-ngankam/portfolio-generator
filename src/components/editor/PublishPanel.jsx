import { useState } from 'react'
import { DB } from '../../db'
import { slugify } from '../../lib/portfolio'
import { hasContent } from '../../lib/portfolioStats'
import QrDialog from './QrDialog'

const CONTACTS = [
  ['email', 'Email'],
  ['phone', 'Téléphone'],
  ['github', 'GitHub'],
  ['linkedin', 'LinkedIn'],
]

const VISIBILITIES = [
  ['public', 'Public'],
  ['non listé', 'Non listé (accessible uniquement avec le lien)'],
  ['privé', 'Privé (non publié)'],
]

// Saisie de l'adresse : minuscules, sans accents, tirets autorisés
const typing = (v) =>
  String(v)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .slice(0, 40)

const heading = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: 'var(--muted, #777)',
  margin: '22px 0 10px',
}

export default function PublishPanel({ draft, editor, user, requireLogin, onSaved }) {
  const { setField, setMapValue, apply, markSaved } = editor
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [showQr, setShowQr] = useState(false)

  const pub = draft.publication || {}
  const active = !!pub.active
  const suggestion = slugify(draft.name || draft.titre || '')
  const publicUrl = pub.slug ? `${window.location.origin}/p/${pub.slug}` : ''

  const setPub = (key, value) =>
    apply((d) => ({ ...d, publication: { ...(d.publication || {}), [key]: value } }), `pub:${key}`)

  async function commit(next, message) {
    const saved = await DB.savePortfolio(next)
    apply(() => saved)
    markSaved()
    onSaved?.(saved)
    setInfo(message)
  }

  async function publish() {
    setError('')
    setInfo('')
    if (!hasContent(draft)) {
      setError('Ajoute du contenu avant de publier.')
      return
    }
    if (!user) {
      requireLogin()
      return
    }
    setBusy(true)
    try {
      const slug = slugify(draft.slug || draft.name || draft.titre).slice(0, 40)
      const base = { ...draft, slug, statut: 'enregistré' }
      const published = await DB.publish(
        { ...base, publication: { ...pub, active: true, slug } },
        pub.slug
      )
      await commit(
        { ...base, publication: { ...pub, active: true, slug, publishedAt: published.publishedAt } },
        active ? 'Page mise à jour.' : 'Page publiée.'
      )
    } catch (e) {
      setError(e.message || 'La publication a échoué.')
    } finally {
      setBusy(false)
    }
  }

  async function unpublish() {
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (pub.slug) await DB.unpublish(pub.slug)
      await commit({ ...draft, publication: { ...pub, active: false } }, 'Page dépubliée.')
    } catch (e) {
      setError(e.message || 'Impossible de dépublier.')
    } finally {
      setBusy(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setInfo('Lien copié.')
    } catch {
      setInfo(publicUrl)
    }
  }

  return (
    <div>
      <div style={{ ...heading, marginTop: 4 }}>Publication</div>
      <p className="small muted" style={{ marginTop: 0 }}>
        La page publique est une copie figée de ton portfolio : pour y voir tes modifications, publie à nouveau.
      </p>

      <div className="field">
        <label htmlFor="pub-slug">Adresse de la page</label>
        <input
          id="pub-slug"
          value={draft.slug || ''}
          placeholder={suggestion || 'mon-portfolio'}
          maxLength={40}
          onChange={(e) => setField('slug', typing(e.target.value))}
        />
        <small>/p/{draft.slug || suggestion || 'mon-portfolio'}</small>
      </div>

      <div className="field">
        <label htmlFor="pub-visibility">Visibilité</label>
        <select
          id="pub-visibility"
          value={draft['visibilité'] || 'privé'}
          onChange={(e) => setField('visibilité', e.target.value)}
        >
          {VISIBILITIES.map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="pub-title">Titre de la page</label>
        <input
          id="pub-title"
          maxLength={100}
          value={pub.title || ''}
          onChange={(e) => setPub('title', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="pub-description">Description</label>
        <textarea
          id="pub-description"
          maxLength={250}
          value={pub.description || ''}
          onChange={(e) => setPub('description', e.target.value)}
        />
        <small>{(pub.description || '').length} / 250</small>
      </div>

      <div style={heading}>Contacts visibles sur la page publique</div>
      {CONTACTS.map(([key, label]) => (
        <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '10px 0', fontSize: 14 }}>
          <input
            type="checkbox"
            style={{ width: 'auto' }}
            checked={draft.contactsAffichés?.[key] !== false}
            onChange={(e) => setMapValue('contactsAffichés', key, e.target.checked)}
          />
          {label}
        </label>
      ))}
      <p className="small muted">Un contact décoché n'est jamais envoyé dans la page publique.</p>

      {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
      {info && <p style={{ color: 'var(--success)', fontSize: 14 }}>{info}</p>}

      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 16 }}>
        <button className="btn btn-primary" onClick={publish} disabled={busy}>
          {busy ? '…' : active ? 'Mettre à jour la page' : 'Publier'}
        </button>
        {active && (
          <button className="btn" onClick={unpublish} disabled={busy}>Dépublier</button>
        )}
      </div>

      {active && publicUrl && (
        <div style={{ marginTop: 20 }}>
          <div style={heading}>Page publiée</div>
          <p className="small" style={{ overflowWrap: 'anywhere' }}>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">{publicUrl}</a>
          </p>
          {pub.publishedAt && (
            <p className="small muted">
              Dernière publication : {new Date(pub.publishedAt).toLocaleString('fr-FR')}
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-sm" onClick={copyLink}>Copier le lien</button>
            <button className="btn btn-sm" onClick={() => setShowQr(true)}>QR code</button>
          </div>
        </div>
      )}

      {showQr && <QrDialog url={publicUrl} onClose={() => setShowQr(false)} />}
    </div>
  )
}