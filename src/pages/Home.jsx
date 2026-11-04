import { useNavigate } from 'react-router-dom'
import { THEMES } from '../lib/portfolio'
import MiniPreview from '../components/MiniPreview'

export default function Home() {
  const navigate = useNavigate()
  const start = (themeId) => navigate(`/editor/new?theme=${themeId}`)

  return (
    <div className="container">
      <section className="hero">
        <div>
          <span className="pill"><span className="dot" />Gratuit</span>
          <h1>
            Votre parcours.<br />Votre <span>histoire.</span>
          </h1>
          <p>
            Créez un portfolio professionnel ou un CV qui vous ressemble. Choisissez un modèle,
            personnalisez-le et exportez votre document.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => start('une')}>Créer mon portfolio ↗</button>
            <button
              className="btn"
              onClick={() => document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explorer les modèles
            </button>
          </div>
          <p className="small muted" style={{ marginTop: 18 }}>
            Aucun abonnement. Vos données restent sous votre contrôle.
          </p>
        </div>
        <div className="hero-art">
          <div className="art-paper">
            <div className="art-avatar" />
            <div className="art-bar title" />
            <div className="art-bar" style={{ width: '40%' }} />
            <div className="art-line" style={{ marginTop: 26 }} />
            <div className="art-line" style={{ width: '60%' }} />
            <div className="art-line" style={{ width: '45%' }} />
          </div>
        </div>
      </section>

      <section id="models">
        <div className="models-header">
          <div>
            <div className="eyebrow">Choisir un thème</div>
            <h2 className="section-title">10 modèles, 10 personnalités</h2>
            <p className="muted">Choisissez le style qui raconte le mieux votre parcours.</p>
          </div>
          <span className="pill">10 templates</span>
        </div>
        <div className="models-track">
          {THEMES.map((th, i) => (
            <article
              key={th.id}
              className="model-card"
              tabIndex={0}
              onClick={() => start(th.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') start(th.id)
              }}
            >
              <div className="model-preview"><MiniPreview theme={th} /></div>
              <strong>{String(i + 1).padStart(2, '0')} — {th.name}</strong>
              <small>{th.description}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-strip">
        <div className="feature">
          <div className="feature-icon">✎</div>
          <h3>Une création simple</h3>
          <p>Un éditeur intuitif avec aperçu instantané.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">⌂</div>
          <h3>Vos données vous appartiennent</h3>
          <p>Stockées sur votre compte, supprimables à tout moment.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">↗</div>
          <h3>Des exports prêts à utiliser</h3>
          <p>PDF, Word et HTML, sans filigrane.</p>
        </div>
      </section>

      <footer className="footer">Folio © 2026</footer>
    </div>
  )
}