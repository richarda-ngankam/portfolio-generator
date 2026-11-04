import { useMemo, useRef, useState } from 'react'
import { renderPortfolio } from '../../render/themes'

const BASE_WIDTH = { computer: 900, tablet: 768, mobile: 390 }
const clamp = (v) => Math.max(25, Math.min(200, v))

export default function Preview({ draft }) {
  const [zoom, setZoom] = useState(100)
  const [device, setDevice] = useState('computer')
  const wrapRef = useRef(null)
  const rootRef = useRef(null)

  const html = useMemo(() => renderPortfolio(draft), [draft])

  const fit = () => {
    const w = wrapRef.current?.clientWidth
    if (w) setZoom(clamp(Math.floor((w / BASE_WIDTH[device]) * 100)))
  }

  const fullscreen = () => {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  return (
    <section className="editor-main" ref={rootRef}>
      <div className="preview-toolbar">
        <strong>Aperçu en direct</strong>
        <div className="zoom-toolbar">
          <button className="btn btn-sm" onClick={() => setZoom((z) => clamp(z - 25))} aria-label="Zoom moins">−</button>
          <span>{zoom} %</span>
          <button className="btn btn-sm" onClick={() => setZoom((z) => clamp(z + 25))} aria-label="Zoom plus">+</button>
          <button className="btn btn-sm" onClick={fit}>Ajuster à la largeur</button>
          <button className="btn btn-sm" onClick={() => setZoom(100)}>100 %</button>
          <button className="btn btn-sm" onClick={fullscreen} aria-label="Plein écran">⛶</button>
          <div className="device-switch">
            {[
              ['computer', '▣', 'Ordinateur'],
              ['tablet', '▤', 'Tablette'],
              ['mobile', '▯', 'Mobile'],
            ].map(([id, symbol, label]) => (
              <button key={id} className={device === id ? 'active' : ''} onClick={() => setDevice(id)} aria-label={label} title={label}>
                {symbol}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="preview-zoom-wrap" ref={wrapRef}>
        {/* margin auto : centré, et jamais coupé à gauche quand on zoome */}
        <div className="preview-stage" style={{ margin: '0 auto' }}>
          <div
            className={`preview-frame ${device}`}
            // Largeur fixe par appareil : sans elle le cadre se rétrécit
            style={{ zoom: zoom / 100, width: BASE_WIDTH[device], maxWidth: 'none' }}
            // Les liens de l'aperçu ne doivent pas faire quitter l'éditeur
            onClick={(e) => {
              if (e.target.closest('a')) e.preventDefault()
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  )
}