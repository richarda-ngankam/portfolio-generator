export default function ConfirmDialog({ title, message, confirmLabel = 'Oui', onConfirm, onCancel }) {
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Fermer">×</button>
        </div>
        <p>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 25 }}>
          <button className="btn" onClick={onCancel}>Annuler</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}