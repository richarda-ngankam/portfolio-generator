import ImageField from './ImageField'

export default function Field({ id, label, type = 'text', value, onChange, max, error, kind, options, shape }) {
  const v = value ?? ''

  if (type === 'image') {
    return <ImageField id={id} label={label} kind={kind} value={v} onChange={onChange} shape={shape} />
  }

  if (type === 'select') {
    return (
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <select id={id} value={String(v)} onChange={(e) => onChange(e.target.value)}>
          {(options || []).map(([val, text]) => (
            <option key={val} value={val}>{text}</option>
          ))}
        </select>
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <textarea id={id} maxLength={max} value={v} onChange={(e) => onChange(e.target.value)} />
        {max && <small>{v.length} / {max}</small>}
      </div>
    )
  }

  if (type === 'year') {
    const top = new Date().getFullYear() + 5
    const years = Array.from({ length: 90 }, (_, n) => top - n)
    return (
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <select id={id} value={String(v)} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        maxLength={max}
        value={v}
        className={error ? 'field-error' : ''}
        autoComplete={type === 'email' ? 'email' : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <small style={{ color: 'var(--danger)' }}>{error}</small>}
    </div>
  )
}