import { useRef, useState } from 'react'
import Field from './Field'
import ItemList from './ItemList'
import { SECTIONS, orderedSections } from '../../lib/formConfig'

export default function ContentPanel({ draft, editor }) {
  const { setField, setMapValue, apply } = editor
  const [expanded, setExpanded] = useState({ identity: true })
  const dragged = useRef(null)

  const order = orderedSections(draft.ordreSections)
  const hiddenIds = draft.sectionsMasquées || []
  const renamed = draft.titresRenommés || {}

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))

  const reorder = (fromId, toId) => {
    if (!fromId || fromId === toId) return
    const next = order.filter((x) => x !== fromId)
    next.splice(next.indexOf(toId), 0, fromId)
    apply((d) => ({ ...d, ordreSections: next }))
  }

  const move = (id, dir) => {
    const i = order.indexOf(id)
    const j = i + dir
    if (j < 0 || j >= order.length) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    apply((d) => ({ ...d, ordreSections: next }))
  }

  const setVisible = (id, visible) =>
    apply((d) => {
      const rest = (d.sectionsMasquées || []).filter((x) => x !== id)
      return { ...d, sectionsMasquées: visible ? rest : [...rest, id] }
    })

  return (
    <div>
      {order.map((id, index) => {
        const def = SECTIONS[id]
        const isOpen = !!expanded[id]
        const isHidden = hiddenIds.includes(id)
        const title = renamed[id] || def.label

        return (
          <section
            key={id}
            className="editor-section"
            draggable
            onDragStart={() => (dragged.current = id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              reorder(dragged.current, id)
              dragged.current = null
            }}
            style={isHidden ? { opacity: 0.6 } : undefined}
          >
            <div className="editor-section-head" onClick={() => toggle(id)}>
              <span aria-hidden="true">⠿</span>
              <strong>
                {title}
                {isHidden && <span className="small muted"> · masquée</span>}
              </strong>
              <button
                type="button"
                aria-label="Monter la section"
                disabled={index === 0}
                onClick={(e) => {
                  e.stopPropagation()
                  move(id, -1)
                }}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Descendre la section"
                disabled={index === order.length - 1}
                onClick={(e) => {
                  e.stopPropagation()
                  move(id, 1)
                }}
              >
                ↓
              </button>
              <button type="button" aria-expanded={isOpen} aria-label={isOpen ? 'Replier' : 'Déplier'}>
                {isOpen ? '⌃' : '⌄'}
              </button>
            </div>

            {isOpen && (
              <div className="editor-section-body">
                <div className="field">
                  <label htmlFor={`rename-${id}`}>Renommer</label>
                  <input
                    id={`rename-${id}`}
                    placeholder={def.label}
                    maxLength={60}
                    value={renamed[id] || ''}
                    onChange={(e) => setMapValue('titresRenommés', id, e.target.value)}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 15 }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto' }}
                    checked={!isHidden}
                    onChange={(e) => setVisible(id, e.target.checked)}
                  />
                  Afficher cette section
                </label>

                {def.fields?.map((f) => (
                  <Field
                    key={f.key}
                    id={`f-${f.key}`}
                    label={f.label}
                    type={f.type}
                    max={f.max}
                    kind={f.kind}
                    options={f.options}
                    shape={draft.formePhoto}
                    value={draft[f.key] ?? (f.key === 'formePhoto' ? 'round' : '')}
                    onChange={(v) => setField(f.key, v)}
                  />
                ))}

                {def.list && <ItemList listKey={def.list} items={draft[def.list]} editor={editor} />}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}