export default function MiniPreview({ theme }) {
  const accent = theme.id === 'affiche' ? '#aab4ee' : '#e6e8f2'
  return (
    <div className="mini-paper" style={{ borderTop: `4px solid ${accent}` }}>
      <div className="mini-label" />
      <div className="mini-title" />
      <div className="mini-sub" />
      <div style={{ display: 'flex', gap: 6, margin: '12px 0' }}>
        <div
          style={{
            width: 35,
            height: 42,
            background: '#e8e3db',
            borderRadius: theme.id === 'une' ? '50% 50% 0 0' : 4,
          }}
        />
        <div style={{ flex: 1 }}>
          <div className="mini-rule" />
          <div className="mini-rule" style={{ width: '60%' }} />
          <div className="mini-rule" style={{ width: '85%' }} />
        </div>
      </div>
      <div className="mini-cols">
        <div><div className="mini-tag" /><div className="mini-tag" /></div>
        <div><div className="mini-tag" /><div className="mini-tag" /></div>
      </div>
    </div>
  )
}