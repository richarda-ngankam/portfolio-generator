import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { loadImage, cropToDataURL } from '../../lib/images'

const PRESETS = {
  photo: { w: 300, h: 300, ow: 480, oh: 480, q: 0.85, title: 'Recadrer la photo' },
  project: { w: 400, h: 225, ow: 960, oh: 540, q: 0.8, title: "Recadrer l'image du projet" },
}
const RADIUS = { round: '50%', square: '0', rounded: '22px' }
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export default function CropDialog({ src, kind, shape, onCancel, onApply }) {
  const preset = PRESETS[kind] || PRESETS.photo
  const { w, h } = preset
  const [img, setImg] = useState(null)
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef(null)

  useEffect(() => {
    let alive = true
    loadImage(src)
      .then((i) => alive && setImg(i))
      .catch((e) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [src])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  // Échelle de base : l'image couvre toute la zone (cadrage centré automatique)
  const base = img ? Math.max(w / img.width, h / img.height) : 1
  const scale = base * zoom

  const place = (o, z) => {
    if (!img) return o
    const s = base * z
    const mx = Math.max(0, (img.width * s - w) / 2)
    const my = Math.max(0, (img.height * s - h) / 2)
    return { x: clamp(o.x, -mx, mx), y: clamp(o.y, -my, my) }
  }

  const changeZoom = (z) => {
    setZoom(z)
    setOffset((o) => place(o, z))
  }

  const reset = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const apply = () => {
    if (!img) return
    onApply(
      cropToDataURL(img, {
        boxW: w,
        boxH: h,
        outW: preset.ow,
        outH: preset.oh,
        scale,
        offset,
        quality: preset.q,
      })
    )
  }

  const radius = kind === 'photo' ? RADIUS[shape] || RADIUS.round : '12px'

  // Affichée dans <body> : sinon la colonne de gauche la place derrière l'aperçu
  return createPortal(
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="crop-title">
        <div className="modal-head">
          <h2 id="crop-title">{preset.title}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Fermer">×</button>
        </div>

        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

        <div
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, start: offset }
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (!drag.current) return
            setOffset(
              place(
                {
                  x: drag.current.start.x + e.clientX - drag.current.x,
                  y: drag.current.start.y + e.clientY - drag.current.y,
                },
                zoom
              )
            )
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          style={{
            position: 'relative',
            width: w,
            height: h,
            maxWidth: '100%',
            margin: '0 auto',
            overflow: 'hidden',
            background: '#222',
            borderRadius: radius,
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          {img && (
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                maxWidth: 'none',
                pointerEvents: 'none',
                width: img.width * scale,
                height: img.height * scale,
                left: w / 2 + offset.x - (img.width * scale) / 2,
                top: h / 2 + offset.y - (img.height * scale) / 2,
              }}
            />
          )}
        </div>

        <p className="small muted" style={{ textAlign: 'center' }}>
          Le cadrage est centré automatiquement. Ajustement facultatif : glisse l'image et utilise le zoom.
        </p>

        <div className="field">
          <label htmlFor="crop-zoom">Zoom</label>
          <input
            id="crop-zoom"
            type="range"
            min="1"
            max="4"
            step="0.01"
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 18, flexWrap: 'wrap' }}>
          <button className="btn" onClick={reset}>Réinitialiser</button>
          <button className="btn" onClick={onCancel}>Annuler</button>
          <button className="btn btn-primary" onClick={apply} disabled={!img}>Appliquer</button>
        </div>
      </div>
    </div>,
    document.body
  )
}