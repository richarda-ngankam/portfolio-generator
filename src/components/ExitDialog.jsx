import { useEffect } from 'react'

export default function ExitDialog({ guest, saving, error, onYes, onNo, onCancel }) {
  // Échap = Annuler (on reste dans l'éditeur)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [saving, onCancel])

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onCancel()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="exit-title">
        <div className="modal-head">
          <h2 id="exit-title">Enregistrer ?</h2>
          <button className="modal-close" onClick={onCancel} disabled={saving} aria-label="Fermer">
            ×
          </button>
        </div>

        <p>
          {guest
            ? 'Pour enregistrer ce portfolio, connectez-vous ou créez un compte. Votre travail sera conservé pendant ce temps.'
            : 'Votre portfolio contient des modifications qui ne sont pas enregistrées.'}
        </p>

        {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}

        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 25, flexWrap: 'wrap' }}
        >
          <button className="btn" onClick={onCancel} disabled={saving}>Annuler</button>
          <button className="btn" onClick={onNo} disabled={saving}>Non</button>
          <button className="btn btn-primary" onClick={onYes} disabled={saving} autoFocus>
            {saving ? 'Enregistrement…' : 'Oui'}
          </button>
        </div>
      </div>
    </div>
  )
}