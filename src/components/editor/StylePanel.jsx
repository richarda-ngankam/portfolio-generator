import { THEMES } from '../../lib/portfolio'

const ACCENTS = ['#6478df', '#e45f4d', '#208c75', '#d9a52c', '#a45fc2', '#252b38', '#df6d96']
const BACKGROUNDS = ['#ffffff', '#f4f1eb', '#eef1f5', '#f8f0e9', '#17191c']
const SHAPES = [
  ['round', 'Rond'],
  ['square', 'Carré'],
  ['rounded', 'Arrondi'],
]
const DEFAULT_ACCENT = '#6478df'
const DEFAULT_BACKGROUND = '#ffffff'

const title = { fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted, #777)', margin: '22px 0 10px' }

function Swatches({ colors, value, label, onPick }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '10px 0 4px' }}>
      {colors.map((c) => {
        const active = value.toLowerCase() === c
        return (
          <button
            key={c}
            type="button"
            onClick={() => onPick(c)}
            aria-label={`${label} ${c}`}
            aria-pressed={active}
            title={c}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: c,
              cursor: 'pointer',
              border: '1px solid var(--line, #e6e7e1)',
              outline: active ? '2px solid var(--accent, #6478df)' : 'none',
              outlineOffset: 2,
            }}
          />
        )
      })}
    </div>
  )
}

function ColorRow({ id, label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <label htmlFor={id} style={{ flex: 1, margin: 0 }}>{label}</label>
      <input
        id={id}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 44, height: 32, padding: 2, cursor: 'pointer' }}
      />
    </div>
  )
}

export default function StylePanel({ draft, editor }) {
  const { setField, apply } = editor
  const accent = draft.couleurAccent || DEFAULT_ACCENT
  const background = draft.couleurFond || DEFAULT_BACKGROUND
  const shape = draft.formePhoto || 'round'

  const resetColors = () =>
    apply((d) =>
      d.couleurAccent === DEFAULT_ACCENT && d.couleurFond === DEFAULT_BACKGROUND
        ? d
        : { ...d, couleurAccent: DEFAULT_ACCENT, couleurFond: DEFAULT_BACKGROUND }
    )

  return (
    <div>
      <div style={{ ...title, marginTop: 4 }}>Modèle</div>
      <p className="small muted" style={{ marginTop: 0 }}>
        Tu peux changer de modèle à tout moment : ton contenu est conservé.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {THEMES.map((t) => {
          const active = draft.themeId === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setField('themeId', t.id)}
              aria-pressed={active}
              title={t.description}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                font: 'inherit',
                color: 'inherit',
                border: `1px solid ${active ? 'var(--accent, #6478df)' : 'var(--line, #e6e7e1)'}`,
                background: active ? 'var(--accent-light, #eef0ff)' : 'var(--surface, #fff)',
              }}
            >
              <strong style={{ display: 'block', fontSize: 14 }}>{t.name}</strong>
              <span style={{ fontSize: 12, color: 'var(--muted, #777)' }}>{t.description}</span>
            </button>
          )
        })}
      </div>

      <div style={title}>Couleurs</div>
      <ColorRow
        id="style-accent"
        label="Couleur d'accentuation"
        value={accent}
        onChange={(v) => setField('couleurAccent', v)}
      />
      <Swatches
        colors={ACCENTS}
        value={accent}
        label="Accentuation"
        onPick={(c) => setField('couleurAccent', c)}
      />

      <div style={{ height: 14 }} />
      <ColorRow
        id="style-background"
        label="Couleur de fond"
        value={background}
        onChange={(v) => setField('couleurFond', v)}
      />
      <Swatches
        colors={BACKGROUNDS}
        value={background}
        label="Fond"
        onPick={(c) => setField('couleurFond', c)}
      />

      <button type="button" className="btn btn-sm" style={{ marginTop: 14 }} onClick={resetColors}>
        Réinitialiser les couleurs
      </button>

      <div style={title}>Forme de la photo</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {SHAPES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="btn btn-sm"
            aria-pressed={shape === id}
            onClick={() => setField('formePhoto', id)}
            style={
              shape === id
                ? { borderColor: 'var(--accent, #6478df)', background: 'var(--accent-light, #eef0ff)', color: 'var(--accent, #6478df)' }
                : undefined
            }
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}