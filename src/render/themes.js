import { esc, safeImage } from './utils'
import {
  visibleSections,
  sectionTitle,
  photoImg,
  renderIdentity,
  renderSection,
  renderSections,
} from './sections'

const vars = (p) =>
  `--theme-accent:${esc(p.couleurAccent || '#6478df')};--theme-background:${esc(p.couleurFond || '#ffffff')};`

const wrap = (name, p, inner) =>
  `<div class="portfolio-render theme-${name}" style="${vars(p)}">${inner}</div>`

const withoutIdentity = (p) => visibleSections(p).filter((id) => id !== 'identity')
const content = (p) => visibleSections(p).filter((id) => id !== 'identity' && id !== 'contacts')

function une(p) {
  const other = content(p)
  const left = other.filter((_, i) => i % 2 === 0)
  const right = other.filter((_, i) => i % 2 === 1)
  const place = esc([p.city, p.country].filter(Boolean).join(' · '))
  const monogram = esc(
    (p.name || 'F').split(/\s+/).filter(Boolean).map((x) => x[0]).slice(0, 2).join('')
  )
  return wrap('une', p, `<div class="une-top"><span>FOLIO — PORTRAIT</span><span>${place}</span></div>
<header class="une-hero"><div>${renderIdentity({ ...p, photo: '' })}</div>${safeImage(p.photo) ? photoImg(p) : `<div class="une-monogram">${monogram}</div>`}</header>
<div class="une-columns"><div>${left.map((id) => renderSection(id, p)).join('')}</div><div>${right.map((id) => renderSection(id, p)).join('')}${visibleSections(p).includes('contacts') ? renderSection('contacts', p) : ''}</div></div>`)
}

function ardoise(p) {
  const side = ['contacts', 'skills', 'languages', 'hobbies']
  const shown = visibleSections(p)
  return wrap('ardoise', p, `<aside class="ardoise-side">${photoImg(p)}<h1 class="p-name">${esc(p.name || 'Votre nom')}</h1><p>${esc(p.profession || '')}</p>${side.filter((id) => shown.includes(id)).map((id) => renderSection(id, p)).join('')}</aside>
<main class="ardoise-main">${p.tagline ? `<p class="p-text">${esc(p.tagline)}</p>` : ''}${p.bio ? `<section class="p-section"><h2>${sectionTitle('identity', p)}</h2><p class="p-text">${esc(p.bio)}</p></section>` : ''}${renderSections(p, ['identity', ...side])}</main>`)
}

function frise(p) {
  const timeline = content(p)
    .map((id) => `<div class="timeline-item">${renderSection(id, p)}</div>`)
    .join('')
  return wrap('frise', p, `<header class="frise-head">${renderIdentity(p)}${visibleSections(p).includes('contacts') ? renderSection('contacts', p) : ''}</header><div class="frise-body">${timeline}</div>`)
}

function affiche(p) {
  return wrap('affiche', p, `<header>${renderIdentity(p)}</header><div style="clear:both"></div>${renderSections(p, ['identity'])}`)
}

function bento(p) {
  const wide = ['experience', 'projects', 'custom']
  const cells = withoutIdentity(p)
    .map((id) => {
      const html = renderSection(id, p)
      return html ? `<div class="p-section ${wide.includes(id) ? 'wide' : ''}">${html}</div>` : ''
    })
    .join('')
  return wrap('bento', p, `<header class="bento-head"><div>${renderIdentity(p)}</div></header><div class="bento-grid">${cells}</div>`)
}

function carnet(p) {
  return wrap('carnet', p, `<header class="carnet-head">${renderIdentity(p)}${visibleSections(p).includes('contacts') ? renderSection('contacts', p) : ''}</header>${renderSections(p, ['identity', 'contacts'])}`)
}

function terminal(p) {
  return wrap('terminal', p, `<div class="terminal-bar">folio@portfolio:~$ ./profile.sh</div><div style="padding:35px 0">${renderIdentity(p)}</div>${renderSections(p, ['identity'])}`)
}

function pop(p) {
  return wrap('pop', p, `<header class="pop-head"><div>${renderIdentity(p)}</div></header><div class="p-grid" style="margin-top:18px">${withoutIdentity(p).map((id) => renderSection(id, p)).join('')}</div>`)
}

function suisse(p) {
  const numbered = content(p)
    .map((id, i) => `<div class="suisse-numbered" data-number="${String(i + 1).padStart(2, '0')}">${renderSection(id, p)}</div>`)
    .join('')
  return wrap('suisse', p, `<header class="suisse-head"><div>${renderIdentity(p)}${visibleSections(p).includes('contacts') ? renderSection('contacts', p) : ''}</div>${safeImage(p.photo) ? '' : `<div class="eyebrow">FOLIO / ${esc(p.profession || 'PORTFOLIO')}</div>`}</header><div class="suisse-body">${numbered}</div>`)
}

function galerie(p) {
  const shown = visibleSections(p)
  const projects = shown.includes('projects') ? (p.projects || []) : []
  const projectsHtml = projects.length
    ? `<section class="p-section" data-section="projects"><h2>${sectionTitle('projects', p)}</h2>${projects.map((x) => {
        const img = safeImage(x.image)
        return `<article class="p-item galerie-project">${img ? `<img class="p-project-image" src="${img}" alt="">` : ''}<div class="p-item-title">${esc(x.title || '')}</div><p class="p-text">${esc(x.description || '')}</p></article>`
      }).join('')}</section>`
    : ''
  return wrap('galerie', p, `<header class="galerie-head">${renderIdentity({ ...p, photo: '' })}${photoImg(p)}${shown.includes('contacts') ? renderSection('contacts', p) : ''}</header>${projectsHtml}${renderSections(p, ['identity', 'contacts', 'projects'])}`)
}

const RENDERERS = { une, ardoise, frise, affiche, bento, carnet, terminal, pop, suisse, galerie }

export function renderPortfolio(p) {
  return (RENDERERS[p.themeId] || une)(p)
}