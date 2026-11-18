// Image → glyph grid. Pure Canvas 2D, so it works everywhere (no WebGL).

export const CHARSETS = {
  classic: ' .:-=+*#%@',
  dense: ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: ' ░▒▓█',
  binary: ' 01',
  code: ' .,:;=+<>{}[]#'
}

/** Render modes supported by components/asciiCanvas. */
export const MODES = ['ascii', 'pixel', 'photo']

export const SCRAMBLE_GLYPHS = '{}[]<>/\\;:=+*#01$&%!?'

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v)
const smoothstep = (a, b, v) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const imageCache = new Map()

/** Loads (and caches) an image. */
export function loadImage(src) {
  if (!imageCache.has(src)) {
    imageCache.set(
      src,
      new Promise((resolve, reject) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    )
  }
  return imageCache.get(src)
}

/** Waits for a font to be usable on canvas, but never longer than `timeout` ms. */
export function waitForFont(font, timeout = 1500) {
  if (!document.fonts?.load) return Promise.resolve()
  return Promise.race([document.fonts.load(font).catch(() => {}), new Promise(r => setTimeout(r, timeout))])
}

/**
 * Downsamples an image region into a cols×rows grid.
 * @param {HTMLImageElement} img
 * @param {object} o
 * @param {number} o.cols
 * @param {number} o.rows
 * @param {{x:number,y:number,w:number,h:number}} [o.crop]  normalised crop rect
 * @param {number} [o.contrast]
 * @param {number} [o.gamma]
 * @param {{cx:number,cy:number,rx:number,ry:number,soft:number}} [o.mask]  elliptical vignette, normalised
 * @returns {{cols:number, rows:number, lum:Float32Array, rgb:Uint8ClampedArray, alpha:Float32Array}}
 */
export function sampleImage(img, { cols, rows, crop = { x: 0, y: 0, w: 1, h: 1 }, contrast = 1.2, gamma = 1, mask }) {
  const canvas = document.createElement('canvas')
  canvas.width = cols
  canvas.height = rows
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const sw = img.naturalWidth
  const sh = img.naturalHeight
  ctx.drawImage(img, crop.x * sw, crop.y * sh, crop.w * sw, crop.h * sh, 0, 0, cols, rows)
  const { data } = ctx.getImageData(0, 0, cols, rows)

  const n = cols * rows
  const lum = new Float32Array(n)
  const rgb = new Uint8ClampedArray(n * 3)
  const alpha = new Float32Array(n)

  for (let i = 0; i < n; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    let l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    l = Math.pow(l, gamma)
    l = (l - 0.5) * contrast + 0.5

    let m = 1
    if (mask) {
      const x = ((i % cols) + 0.5) / cols
      const y = (Math.floor(i / cols) + 0.5) / rows
      const dx = (x - mask.cx) / mask.rx
      const dy = (y - mask.cy) / mask.ry
      m = 1 - smoothstep(1 - mask.soft, 1, Math.sqrt(dx * dx + dy * dy))
    }

    lum[i] = clamp01(l) * m
    alpha[i] = m
    rgb[i * 3] = r
    rgb[i * 3 + 1] = g
    rgb[i * 3 + 2] = b
  }

  return { cols, rows, lum, rgb, alpha }
}

/** Picks the glyph for a luminance value. */
export const glyphFor = (l, charset, invert = false) => {
  const v = invert ? 1 - l : l
  return charset[Math.min(charset.length - 1, Math.floor(v * charset.length))]
}

/** Plain-text version of a sample, for "copy as text". */
export function sampleToText(sample, charset, invert = false) {
  const lines = []
  for (let y = 0; y < sample.rows; y++) {
    let line = ''
    for (let x = 0; x < sample.cols; x++) line += glyphFor(sample.lum[y * sample.cols + x], charset, invert)
    lines.push(line.replace(/\s+$/, ''))
  }
  return lines.join('\n')
}
