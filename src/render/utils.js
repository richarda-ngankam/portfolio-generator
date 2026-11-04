export function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]))
}

// N'accepte que les liens http(s)
export function safeURL(value) {
  try {
    const u = new URL(value)
    return ['http:', 'https:'].includes(u.protocol) ? u.href : ''
  } catch {
    return ''
  }
}

// N'accepte que de vraies images intégrées (data:image/...;base64,...)
const IMG_RE = /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/
export const safeImage = (v) => (typeof v === 'string' && IMG_RE.test(v) ? v : '')

export function monthYear(value) {
  if (!value) return ''
  const m = String(value).match(/^(\d{4})-(\d{2})$/)
  if (!m) return String(value)
  return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString('fr-FR', {
    month: 'short',
    year: 'numeric',
  })
}

export function formatPeriod(item) {
  const start = monthYear(item.startDate)
  const end = item.current ? 'En cours' : monthYear(item.endDate)
  return [start, end].filter(Boolean).join(' — ')
}

const ICONS = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  phone: '<path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 3h10v12H7z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10 18h4" stroke="currentColor" stroke-width="1.7"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 4v-3.2a2.8 2.8 0 0 0-.8-2.2c3-.3 6.2-1.5 6.2-7A5.5 5.5 0 0 0 19 4.8 5 5 0 0 0 18.9 1S17.7.7 15 2.5a13.3 13.3 0 0 0-7 0C5.3.7 4.1 1 4.1 1A5 5 0 0 0 4 4.8a5.5 5.5 0 0 0-1.4 3.8c0 5.5 3.2 6.7 6.2 7A2.8 2.8 0 0 0 8 17.8V21" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  linkedin: '<path d="M4 9v11M4 4v.1M10 20v-6a4 4 0 0 1 8 0v6M10 9v11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
}

export const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`