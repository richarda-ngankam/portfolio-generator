export default function MiniPreview({ theme }) {
  const accent = theme.id === 'affiche' ? '#6478df' : '#dce0ec'
  return (
    <div className="mini-paper" style={{ borderTop: `4px solid ${accent}` }}>
      <div style={{ fontSize: 8, color: '#888' }}>PORTFOLIO / 2026</div>
      <div className="mini-name">Alex Morgan</div>
      <div style={{ fontSize: 8, color: '#777' }}>Designer &amp; Developer</div>
      <div style={{ display: 'flex', gap: 5, margin: '10px 0' }}>
        <div
          style={{
            width: 35,
            height: 42,
            background: '#d5c4b3',
            borderRadius: theme.id === 'une' ? '50% 50% 0 0' : 3,
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