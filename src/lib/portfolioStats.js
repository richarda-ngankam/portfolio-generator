const TEXT_KEYS = [
  'name', 'profession', 'tagline', 'bio', 'city', 'country', 'photo',
  'email', 'phone', 'github', 'linkedin', 'customTitle', 'customContent',
]
const LIST_KEYS = [
  'customLinks', 'experiences', 'education', 'skills',
  'languages', 'certifications', 'projects', 'hobbies',
]
const COMPLETION_KEYS = [
  'name', 'profession', 'tagline', 'bio', 'city', 'country', 'email', 'phone',
  'experiences', 'education', 'skills', 'languages', 'projects',
]

// Vrai si au moins un champ est rempli (sert à décider d'afficher « Enregistrer ? »)
export function hasContent(p) {
  if (!p) return false
  if (TEXT_KEYS.some((k) => typeof p[k] === 'string' && p[k].trim() !== '')) return true
  return LIST_KEYS.some(
    (k) =>
      Array.isArray(p[k]) &&
      p[k].some((item) => Object.values(item).some((v) => String(v || '').trim()))
  )
}

// Pourcentage de complétion affiché dans la barre de progression
export function completion(p) {
  if (!p) return 0
  const done = COMPLETION_KEYS.filter((k) => {
    const v = p[k]
    return Array.isArray(v) ? v.length > 0 : String(v || '').trim() !== ''
  }).length
  return Math.round((done / COMPLETION_KEYS.length) * 100)
}