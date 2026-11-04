import { useCallback, useRef, useState } from 'react'

const MAX_HISTORY = 60
const COALESCE_MS = 800

export function useEditorState() {
  const [draft, setDraftState] = useState(null)
  const [dirty, setDirty] = useState(false)

  const draftRef = useRef(null)
  const history = useRef([])
  const index = useRef(-1)
  const lastEdit = useRef({ key: null, time: 0 })

  const show = (p) => {
    draftRef.current = p
    setDraftState(p)
  }

  // Charge un portfolio (nouveau ou existant) et repart d'un historique propre
  const load = useCallback((p) => {
    history.current = [p]
    index.current = 0
    lastEdit.current = { key: null, time: 0 }
    show(p)
    setDirty(false)
  }, [])

  // Applique une modification. Les modifications rapides du même champ
  // (même coalesceKey) sont regroupées en une seule étape d'historique.
  const apply = useCallback((updater, coalesceKey = null) => {
    const base = draftRef.current
    if (!base) return
    const next = updater(base)
    if (next === base) return

    const now = Date.now()
    const merge =
      coalesceKey &&
      lastEdit.current.key === coalesceKey &&
      now - lastEdit.current.time < COALESCE_MS &&
      index.current === history.current.length - 1

    if (merge) {
      history.current[index.current] = next
    } else {
      const h = history.current.slice(0, index.current + 1)
      h.push(next)
      if (h.length > MAX_HISTORY) h.shift()
      history.current = h
      index.current = h.length - 1
    }
    lastEdit.current = { key: coalesceKey, time: now }
    show(next)
    setDirty(true)
  }, [])

  /* ---------- Champs simples ---------- */
  const setField = useCallback(
    (key, value) =>
      apply((d) => {
        const next = { ...d, [key]: value }
        // Le titre du portfolio suit le nom tant qu'il est vide
        if (key === 'name' && !d.titre) next.titre = value
        return next
      }, `field:${key}`),
    [apply]
  )

  // Objets imbriqués : contactsAffichés, titresRenommés
  const setMapValue = useCallback(
    (key, subKey, value) =>
      apply((d) => ({ ...d, [key]: { ...(d[key] || {}), [subKey]: value } }), `map:${key}:${subKey}`),
    [apply]
  )

  /* ---------- Listes (expériences, formations, compétences…) ---------- */
  const addItem = useCallback(
    (key) => apply((d) => ({ ...d, [key]: [...(d[key] || []), {}] })),
    [apply]
  )

  const setItem = useCallback(
    (key, i, field, value) =>
      apply((d) => {
        const list = [...(d[key] || [])]
        list[i] = { ...list[i], [field]: value }
        return { ...d, [key]: list }
      }, `item:${key}:${i}:${field}`),
    [apply]
  )

  const removeItem = useCallback(
    (key, i) => apply((d) => ({ ...d, [key]: (d[key] || []).filter((_, j) => j !== i) })),
    [apply]
  )

  const moveItem = useCallback(
    (key, i, dir) =>
      apply((d) => {
        const list = [...(d[key] || [])]
        const j = i + dir
        if (j < 0 || j >= list.length) return d
        ;[list[i], list[j]] = [list[j], list[i]]
        return { ...d, [key]: list }
      }),
    [apply]
  )

  /* ---------- Annuler / rétablir ---------- */
  const undo = useCallback(() => {
    if (index.current <= 0) return
    index.current -= 1
    lastEdit.current = { key: null, time: 0 }
    show(history.current[index.current])
    setDirty(true)
  }, [])

  const redo = useCallback(() => {
    if (index.current >= history.current.length - 1) return
    index.current += 1
    lastEdit.current = { key: null, time: 0 }
    show(history.current[index.current])
    setDirty(true)
  }, [])

  const markSaved = useCallback(() => setDirty(false), [])

  return {
    draft,
    dirty,
    load,
    apply,
    setField,
    setMapValue,
    addItem,
    setItem,
    removeItem,
    moveItem,
    undo,
    redo,
    canUndo: index.current > 0,
    canRedo: index.current < history.current.length - 1,
    markSaved,
  }
}