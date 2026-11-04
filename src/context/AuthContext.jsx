import { createContext, useContext, useEffect, useState } from 'react'
import { DB } from '../db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = DB.onUser((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = {
    user,
    loading,
    signUp: DB.signUp,
    signIn: DB.signIn,
    signOut: DB.signOut,
    resetPassword: DB.resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}

// Messages d'erreur Firebase en français
export function authErrorMessage(err) {
  const map = {
    'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail.',
    'auth/invalid-email': "Adresse e-mail invalide.",
    'auth/weak-password': 'Mot de passe trop court (6 caractères minimum).',
    'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
    'auth/user-not-found': 'E-mail ou mot de passe incorrect.',
    'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
    'auth/too-many-requests': 'Trop de tentatives. Réessaie plus tard.',
    'auth/network-request-failed': 'Problème de connexion internet.',
    'auth/requires-recent-login': 'Reconnecte-toi pour effectuer cette action.',
  }
  return map[err?.code] || err?.message || 'Une erreur est survenue.'
}