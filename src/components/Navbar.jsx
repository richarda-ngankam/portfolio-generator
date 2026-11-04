import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // L'éditeur et la page publique ont leur propre en-tête
  if (pathname.startsWith('/editor') || pathname.startsWith('/p/')) return null

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
      <Link to="/" style={{ fontWeight: 800, fontSize: 20, textDecoration: 'none', color: 'var(--text)' }}>Folio</Link>
      <nav style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link className="btn btn-sm" to="/a-propos">À propos</Link>
        {user ? (
          <>
            <Link className="btn btn-sm" to="/dashboard">Mes portfolios</Link>
            <button className="btn btn-sm" onClick={async () => { await signOut(); navigate('/') }}>Déconnexion</button>
          </>
        ) : (
          <Link className="btn btn-primary btn-sm" to="/connexion">Connexion</Link>
        )}
      </nav>
    </header>
  )
}