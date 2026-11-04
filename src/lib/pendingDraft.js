// Brouillon d'un visiteur non connecté, conservé le temps de la connexion
const KEY = 'folio-pending-draft'
const MAX_AGE = 30 * 60 * 1000 // 30 minutes

export function stashDraft(draft, after) {
  sessionStorage.setItem(KEY, JSON.stringify({ draft, after, time: Date.now() }))
}

export function readPending() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const pending = JSON.parse(raw)
    if (!pending?.draft || Date.now() - (pending.time || 0) > MAX_AGE) {
      sessionStorage.removeItem(KEY)
      return null
    }
    return pending
  } catch {
    return null
  }
}

export function clearPending() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Rien à faire : le stockage de session est indisponible
  }
}