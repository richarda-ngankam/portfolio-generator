import Field from './Field'
import { LISTS } from '../../lib/formConfig'

export default function ItemList({ listKey, items = [], editor }) {
  const meta = LISTS[listKey]
  const { addItem, setItem, removeItem, moveItem, apply } = editor

  // « En cours » : efface la date de fin
  const toggleCurrent = (i, checked) =>
    apply((d) => {
      const list = [...(d[listKey] || [])]
      list[i] = { ...list[i], current: checked, ...(checked ? { endDate: '' } : {}) }
      return { ...d, [listKey]: list }
    })

  return (
    <div>
      {items.length === 0 && <div className="section-description">Aucun élément ajouté.</div>}

      {items.map((item, i) => {
        const badPeriod =
          !item.current && item.startDate && item.endDate && item.endDate < item.startDate

        return (
          <div className="item-card" key={i}>
            <div className="item-top">
              <strong>{meta.label} {i + 1}</strong>
              <div className="item-controls">
                <button type="button" aria-label="Monter" onClick={() => moveItem(listKey, i, -1)}>↑</button>
                <button type="button" aria-label="Descendre" onClick={() => moveItem(listKey, i, 1)}>↓</button>
                <button type="button" aria-label="Supprimer" onClick={() => removeItem(listKey, i)}>×</button>
              </div>
            </div>

            {meta.fields.map((f) => {
              const id = `${listKey}-${i}-${f.key}`

              if (f.key === 'endDate' && item.current) {
                return (
                  <div className="field" key={f.key}>
                    <label htmlFor={id}>{f.label}</label>
                    <input id={id} value="En cours" disabled />
                  </div>
                )
              }

              return (
                <Field
                  key={f.key}
                  id={id}
                  label={f.label}
                  type={f.type}
                  max={f.max}
                  value={item[f.key]}
                  onChange={(v) => setItem(listKey, i, f.key, v)}
                  error={
                    f.key === 'endDate' && badPeriod
                      ? 'La date de fin doit être postérieure ou égale à la date de début.'
                      : ''
                  }
                />
              )
            })}

            {meta.current && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  checked={!!item.current}
                  onChange={(e) => toggleCurrent(i, e.target.checked)}
                />
                {meta.current}
              </label>
            )}
          </div>
        )
      })}

      <button type="button" className="add-btn" onClick={() => addItem(listKey)}>
        ＋ {meta.add}
      </button>
    </div>
  )
}