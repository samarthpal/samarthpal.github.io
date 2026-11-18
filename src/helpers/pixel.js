// 16-colour palette for the 8-bit look (original palette, tuned for skin tones + neon UI).
export const PALETTE = [
  '#0b0a12',
  '#1e1b33',
  '#3b3561',
  '#6d6a8f',
  '#b3b0c9',
  '#f4f1ea',
  '#4a2a1c',
  '#7a4a2e',
  '#b5763f',
  '#e0a878',
  '#ffd7a8',
  '#2d5a3d',
  '#59b36b',
  '#ffb21a',
  '#ff5d5d',
  '#3ec5ff'
]

const hexToRgb = hex => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const PALETTE_RGB = PALETTE.map(hexToRgb)

/** Index of the nearest palette colour (weighted RGB distance). */
export function nearest(r, g, b, palette = PALETTE_RGB) {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < palette.length; i++) {
    const [pr, pg, pb] = palette[i]
    const dr = r - pr
    const dg = g - pg
    const db = b - pb
    const d = 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/**
 * Converts a sample (from ascii.sampleImage) into palette indices. -1 = transparent.
 * @param {{cols:number, rows:number, rgb:Uint8ClampedArray, alpha:Float32Array}} sample
 * @param {number} cutoff  alpha below this becomes transparent
 */
export function quantize(sample, cutoff = 0.35) {
  const out = new Int8Array(sample.cols * sample.rows)
  for (let i = 0; i < out.length; i++) {
    out[i] = sample.alpha[i] < cutoff ? -1 : nearest(sample.rgb[i * 3], sample.rgb[i * 3 + 1], sample.rgb[i * 3 + 2])
  }
  return out
}

/**
 * Draws a bitmap (array of strings) as crisp pixels.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]} rows   e.g. ['.11.', '1221']
 * @param {Record<string,string>} colors  char → fill colour ('.' is transparent)
 * @param {number} x
 * @param {number} y
 * @param {number} size  pixel size in canvas units
 */
export function drawBitmap(ctx, rows, colors, x, y, size) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    for (let c = 0; c < row.length; c++) {
      const fill = colors[row[c]]
      if (!fill) continue
      ctx.fillStyle = fill
      ctx.fillRect(x + c * size, y + r * size, size, size)
    }
  }
}
