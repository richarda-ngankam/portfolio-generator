// Couleurs par défaut de chaque thème (utilisées tant que la personne n'a rien choisi)
export const THEME_DEFAULTS = {
  une: { bg: '#ffffff', accent: '#b5543c' },
  ardoise: { bg: '#ffffff', accent: '#263d4a' },
  frise: { bg: '#fbfaf7', accent: '#6478df' },
  affiche: { bg: '#6478df', accent: '#ffe36e' },
  bento: { bg: '#f4f3ef', accent: '#6478df' },
  carnet: { bg: '#fffaf0', accent: '#a4672f' },
  terminal: { bg: '#111b20', accent: '#a7e6bb' },
  pop: { bg: '#ffe96e', accent: '#ff735e' },
  suisse: { bg: '#ffffff', accent: '#d6402c' },
  galerie: { bg: '#111317', accent: '#d6b36a' },
}

const HEX = /^#[0-9a-f]{6}$/i
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const toHex = (c) =>
  '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
const channel = (v) => {
  const x = v / 255
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}
const luminance = (c) => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2])
const contrast = (a, b) => {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const pickText = (bg, dark, light) => (contrast(bg, rgb(dark)) >= contrast(bg, rgb(light)) ? dark : light)

// Couleurs réellement appliquées : le choix de la personne, sinon celles du thème
export function effectiveColors(themeId, p) {
  const d = THEME_DEFAULTS[themeId] || THEME_DEFAULTS.une
  return {
    background: HEX.test(p.couleurFond || '') ? p.couleurFond.toLowerCase() : d.bg,
    accent: HEX.test(p.couleurAccent || '') ? p.couleurAccent.toLowerCase() : d.accent,
  }
}

// Variables CSS posées sur le portfolio (valeurs validées : jamais de texte libre)
export function themeStyle(themeId, p) {
  const { background, accent } = effectiveColors(themeId, p)
  const bg = rgb(background)
  const ac = rgb(accent)
  const ink = pickText(bg, '#20221f', '#f4f4f4')
  const dark = ink === '#f4f4f4'
  const onAccent = pickText(ac, '#171717', '#ffffff')
  const paper = toHex(dark ? mix(bg, [255, 255, 255], 0.08) : mix(bg, [255, 255, 255], 0.75))
  const line = toHex(mix(bg, rgb(ink), 0.2))
  const accentText = contrast(ac, bg) >= 3 ? accent : ink
  const link = dark ? '#8abaff' : '#1769c2'

  return [
    `--tb:${background}`,
    `--ta:${accent}`,
    `--ta-text:${accentText}`,
    `--ink:${ink}`,
    `--on-accent:${onAccent}`,
    `--paper:${paper}`,
    `--line:${line}`,
    `--link:${link}`,
    `--theme-accent:${accent}`,
    `--theme-background:${background}`,
  ].join(';') + ';'
}