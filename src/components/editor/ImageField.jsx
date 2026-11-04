import { useRef, useState } from 'react'
import { IMAGE_ACCEPT, compressLogo, dataSizeKb, readFile } from '../../lib/images'
import CropDialog from './CropDialog'

const RADIUS = { round: '50%', square: '0', rounded: '22px' }

export default function ImageField({ id, label, kind = 'photo', value, onChange, shape }) {
  const inputRef = useRef(null)
  const [pending, setPending] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const thumb =
    kind === 'photo'
      ? { width: 64, height: 64, borderRadius: RADIUS[shape] || RADIUS.round, objectFit: 'cover' }
      : kind === 'logo'
      ? { width: 56, height: 56, objectFit: 'contain', background: 'var(--surface2, #f0f0ed)', borderRadius: 8, padding: 4 }
      : { width: 96, height: 54, objectFit: 'cover', borderRadius: 8 }

  async function onPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setBusy(true)
    try {
      if (kind === 'logo') onChange(await compressLogo(file))
      else setPending(await readFile(file))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const addLabel =
    kind === 'photo' ? 'Ajouter une photo' : kind === 'logo' ? 'Ajouter un logo' : 'Ajouter une image'

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>

      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <img src={value} alt="" style={thumb} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-sm" onClick={() => inputRef.current?.click()}>Remplacer</button>
            {kind !== 'logo' && (
              <button type="button" className="btn btn-sm" onClick={() => setPending(value)}>Recadrer</button>
            )}
            <button type="button" className="btn btn-sm btn-danger" onClick={() => onChange('')}>Retirer</button>
          </div>
          <small className="muted">{dataSizeKb(value)} Ko</small>
        </div>
      ) : (
        <button type="button" className="add-btn" disabled={busy} onClick={() => inputRef.current?.click()}>
          ＋ {busy ? 'Traitement…' : addLabel}
        </button>
      )}

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={onPick}
        style={{ display: 'none' }}
      />

      {error && <small style={{ color: 'var(--danger)' }}>{error}</small>}

      {pending && (
        <CropDialog
          src={pending}
          kind={kind}
          shape={shape}
          onCancel={() => setPending(null)}
          onApply={(dataUrl) => {
            onChange(dataUrl)
            setPending(null)
          }}
        />
      )}
    </div>
  )
}