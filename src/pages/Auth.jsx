import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, authErrorMessage } from '../context/AuthContext'

export default function Auth() {
  const { user, signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [mode, setMode] = useState('login') // login | signup | reset
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setInfo('')
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password)
        navigate(from, { replace: true })
      } else if (mode === 'signup') {
        await signUp(name.trim(), email.trim(), password)
        navigate(from, { replace: true })
      } else {
        await resetPassword(email.trim())
        setInfo('Si ce compte existe, un e-mail de réinitialisation a été envoyé.')
      }
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const title =
    mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Créer un compte' : 'Mot de passe oublié'

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: '0 20px' }}>
      <form className="card" onSubmit={submit} style={{ padding: 28 }}>
        <h1 style={{ fontSize: 26, marginBottom: 18 }}>{title}</h1>

        {mode === 'signup' && (
          <div className="field">
            <label htmlFor="name">Nom</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
        )}

        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>

        {mode !== 'reset' && (
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>
        )}

        {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
        {info && <p style={{ color: 'var(--success)', fontSize: 14 }}>{info}</p>}

        <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', marginTop: 8 }}>
          {busy ? '…' : mode === 'login' ? 'Se connecter' : mode === 'signup' ? "S'inscrire" : 'Envoyer le lien'}
        </button>

        <div className="small muted" style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
          {mode === 'login' ? (
            <>
              <button type="button" className="btn btn-sm" onClick={() => switchMode('signup')}>Créer un compte</button>
              <button type="button" className="btn btn-sm" onClick={() => switchMode('reset')}>Mot de passe oublié</button>
            </>
          ) : (
            <button type="button" className="btn btn-sm" onClick={() => switchMode('login')}>← Retour à la connexion</button>
          )}
        </div>
      </form>
    </div>
  )
}