export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'
const ALLOWED = /^image\/(png|jpeg|webp|gif)$/
const MAX_BYTES = 15 * 1024 * 1024

export function readFile(file) {
  return new Promise((resolve, reject) => {
    if (!ALLOWED.test(file.type) || file.size > MAX_BYTES) {
      reject(new Error('Image invalide (PNG, JPEG, WebP ou GIF) ou supérieure à 15 Mo.'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("Lecture de l'image impossible."))
    reader.readAsDataURL(file)
  })
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image illisible.'))
    img.src = src
  })
}

// Logo : jamais rogné, réduit à 240 px, transparence conservée
export async function compressLogo(file) {
  const img = await loadImage(await readFile(file))
  const scale = Math.min(1, 240 / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/webp', 0.9)
}

// Recadrage : box = taille de la zone affichée (px), out = taille finale
export function cropToDataURL(img, { boxW, boxH, outW, outH, scale, offset, quality }) {
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outW, outH)
  const sw = boxW / scale
  const sh = boxH / scale
  const sx = img.width / 2 - offset.x / scale - sw / 2
  const sy = img.height / 2 - offset.y / scale - sh / 2
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)
  return canvas.toDataURL('image/jpeg', quality)
}

export const dataSizeKb = (dataUrl) => Math.round((dataUrl.length * 0.75) / 1024)