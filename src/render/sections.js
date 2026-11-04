import { esc, safeURL, safeImage, icon, formatPeriod } from './utils'
import { SECTIONS, orderedSections } from '../lib/formConfig'

export const visibleSections = (p) =>
  orderedSections(p.ordreSections).filter((id) => !(p.sectionsMasquées || []).includes(id))

export function sectionTitle(id, p) {
  const custom = id === 'custom' ? p.customTitle : ''
  return esc(p.titresRenommés?.[id] || custom || SECTIONS[id]?.label || id)
}

export const photoImg = (p) => {
  const src = safeImage(p.photo)
  return src ? `<img class="p-photo photo-${esc(p.formePhoto || 'round')}" src="${src}" alt="Photo de profil">` : ''
}

export function renderContacts(p) {
  const shown = p.contactsAffichés || {}
  const items = [
    ['email', 'mail', p.email],
    ['phone', 'phone', p.phone],
    ['github', 'github', p.github],
    ['linkedin', 'linkedin', p.linkedin],
  ]
  let html = items
    .filter(([k, , v]) => v && shown[k] !== false)
    .map(([k, ic, v]) => {
      const url = k === 'email' ? 'mailto:' + v : k === 'phone' ? 'tel:' + v : safeURL(v)
      if (!url) return `<div class="p-contact">${icon(ic)}<span>${esc(v)}</span></div>`
      return `<div class="p-contact">${icon(ic)}<a href="${esc(url)}">${esc(v)}</a></div>`
    })
    .join('')

  ;(p.customLinks || []).forEach((x) => {
    if (x.name && x.url && safeURL(x.url)) {
      html += `<div class="p-contact">${icon('link')}<a href="${esc(safeURL(x.url))}">${esc(x.name)}</a></div>`
    }
  })
  return html
}

export function renderIdentity(p) {
  return `<h1 class="p-name">${esc(p.name || 'Votre nom')}</h1>
<div class="p-profession">${esc(p.profession || 'Profession')}</div>
${p.tagline ? `<p class="p-text" style="margin-top:12px">${esc(p.tagline)}</p>` : ''}
${photoImg(p)}
${p.bio ? `<p class="p-text" style="margin-top:16px">${esc(p.bio)}</p>` : ''}
${p.city || p.country ? `<p class="p-item-meta">${esc([p.city, p.country].filter(Boolean).join(', '))}</p>` : ''}`
}

const logo = (src, size) => {
  const s = safeImage(src)
  return s
    ? `<img src="${s}" alt="" style="width:${size}px;height:${size}px;object-fit:contain;padding:4px">`
    : ''
}

const BODIES = {
  identity: renderIdentity,
  contacts: renderContacts,

  experience: (p) =>
    (p.experiences || [])
      .map(
        (x) => `<div class="p-item"><div class="p-item-title">${esc(x.position || '')}</div><div class="p-item-meta">${esc(x.company || '')} · ${esc(formatPeriod(x))}</div>${logo(x.logo, 45)}<div class="p-text">${esc(x.description || '')}</div></div>`
      )
      .join(''),

  education: (p) =>
    (p.education || [])
      .map(
        (x) => `<div class="p-item">${logo(x.logo, 48)}<div class="p-item-title">${esc(x.degree || '')}</div><div class="p-item-meta">${esc(x.school || '')} · ${esc(formatPeriod(x))}</div><div class="p-text">${esc(x.description || '')}</div></div>`
      )
      .join(''),

  skills: (p) =>
    (p.skills || [])
      .map((x) => `<span class="p-skill">${esc(x.name || '')}${x.level ? ' · ' + esc(x.level) : ''}</span>`)
      .join(''),

  languages: (p) =>
    (p.languages || [])
      .map((x) => `<div class="p-item"><strong>${esc(x.name || '')}</strong> — ${esc(x.level || '')}</div>`)
      .join(''),

  certifications: (p) =>
    (p.certifications || [])
      .map(
        (x) => `<div class="p-item"><strong>${esc(x.name || '')}</strong><div class="p-item-meta">${esc(x.organization || '')} · ${esc(x.year || '')}</div>${x.link && safeURL(x.link) ? `<a href="${esc(safeURL(x.link))}">En savoir plus</a>` : ''}</div>`
      )
      .join(''),

  projects: (p) =>
    (p.projects || [])
      .map((x) => {
        const img = safeImage(x.image)
        return `<div class="p-item">${img ? `<img class="p-project-image" src="${img}" alt="">` : ''}<div class="p-item-title">${esc(x.title || '')}</div><div class="p-text">${esc(x.description || '')}</div>${x.link && safeURL(x.link) ? `<a href="${esc(safeURL(x.link))}" target="_blank" rel="noopener">${esc(x.link)}</a>` : ''}</div>`
      })
      .join(''),

  hobbies: (p) =>
    (p.hobbies || [])
      .map((x) => `<div class="p-item"><strong>${esc(x.name || '')}</strong><div class="p-text">${esc(x.description || '')}</div></div>`)
      .join(''),

  // Une section libre vide n'est jamais affichée
  custom: (p) => ((p.customContent || '').trim() ? `<div class="p-text">${esc(p.customContent)}</div>` : ''),
}

export function renderSection(id, p) {
  const body = BODIES[id]?.(p)
  if (!body) return ''
  return `<section class="p-section" data-section="${id}">${id === 'identity' ? '' : `<h2>${sectionTitle(id, p)}</h2>`}${body}</section>`
}

export function renderSections(p, exclude = []) {
  return visibleSections(p)
    .filter((id) => !exclude.includes(id))
    .map((id) => renderSection(id, p))
    .join('')
}