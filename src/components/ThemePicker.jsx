import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEMES } from '../lib/portfolio'

export default function ThemePicker({ onClose }) {
  const navigate = useNavigate()

  // Échap ferme la fenêtre ; on bloque le défilement de la page derrière
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  const choose = (id) => {
    onClose()
    navigate(`/editor/new?theme=${id}`)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choisir un modèle"
      onClick={onClose}
      style={overlay}
    >
      <style>{`
        .theme-pick-card { transition: border-color .15s, background .15s, transform .15s; }
        .theme-pick-card:hover, .theme-pick-card:focus-visible {
          border-color: var(--accent, #6478df);
          background: var(--accent-light, #eef0ff);
          transform: translateY(-2px);
        }
      `}</style>

      <div onClick={(e) => e.stopPropagation()} style={box}>
        <div style={header}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Choisir un modèle</h2>
            <p style={{ margin: '6px 0 0', color: 'var(--muted, #777)' }}>
              Tu pourras changer de modèle à tout moment, sans rien perdre.
            </p>
          </div>
          <button className="btn btn-sm" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div style={grid}>
          {THEMES.map((t, i) => (
            <button
              key={t.id}
              className="theme-pick-card"
              style={card}
              onClick={() => choose(t.id)}
              autoFocus={i === 0}
            >
              <span style={number}>{String(i + 1).padStart(2, '0')}</span>
              <strong style={{ fontSize: 17 }}>{t.name}</strong>
              <span style={{ color: 'var(--muted, #777)', fontSize: 14, lineHeight: 1.4 }}>
                {t.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(20, 22, 20, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1000,
}

const box = {
  background: 'var(--surface, #fff)',
  color: 'var(--text, #20221f)',
  border: '1px solid var(--line, #e6e7e1)',
  borderRadius: 16,
  width: '100%',
  maxWidth: 860,
  maxHeight: '88vh',
  overflowY: 'auto',
  padding: 24,
  boxShadow: '0 24px 70px rgba(0,0,0,.25)',
}

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 20,
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 12,
}

const card = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 6,
  textAlign: 'left',
  padding: 16,
  background: 'var(--surface, #fff)',
  color: 'inherit',
  border: '1px solid var(--line, #e6e7e1)',
  borderRadius: 13,
  cursor: 'pointer',
  font: 'inherit',
}

const number = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '.08em',
  color: 'var(--accent, #6478df)',
}