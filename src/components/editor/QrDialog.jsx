import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import QRCode from 'qrcode'

export default function QrDialog({ url, onClose }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let alive = true
    QRCode.toDataURL(url, { width: 280, margin: 2 }).then((data) => alive && setSrc(data))
    return () => {
      alive = false
    }
  }, [url])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="qr-title">
        <div className="modal-head">
          <h2 id="qr-title">QR code</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <div style={{ display: 'grid', placeItems: 'center', padding: 16 }}>
          {src ? <img src={src} alt="QR code de la page publique" width="240" height="240" /> : <p className="small muted">Génération…</p>}
        </div>
        <p className="small muted" style={{ overflowWrap: 'anywhere', textAlign: 'center' }}>{url}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 14 }}>
          {src && <a className="btn" href={src} download="qr-code-folio.png">Télécharger</a>}
          <button className="btn btn-primary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>,
    document.body
  )
}