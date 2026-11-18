// Turns a remote SVG logo into a tiny 8-bit sprite (a 16×16 canvas).
// The SVG is fetched as text and given an explicit size before rasterising, because
// some browsers (Firefox) can't draw an SVG with no intrinsic width/height onto a canvas.
// Loading it from a blob URL also keeps the canvas untainted, so its pixels can be read.

const cache = new Map()

const withSize = svg => (/<svg[^>]*\swidth=/.test(svg) ? svg : svg.replace(/<svg/, '<svg width="128" height="128"'))

/**
 * @param {string} url  SVG URL (must allow CORS, e.g. jsDelivr)
 * @param {number} res  sprite resolution (pixels per side)
 * @returns {Promise<HTMLCanvasElement|null>}  null when the icon can't be loaded
 */
export default function pixelIcon(url, res = 16) {
  const key = `${url}@${res}`
  if (cache.has(key)) return cache.get(key)

  const job = (async () => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`icon ${response.status}`)
    const blobUrl = URL.createObjectURL(new Blob([withSize(await response.text())], { type: 'image/svg+xml' }))
    try {
      const img = await new Promise((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = reject
        el.src = blobUrl
      })
      const canvas = document.createElement('canvas')
      canvas.width = res
      canvas.height = res
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, res, res)

      // hard alpha edges = proper pixel-art silhouette
      const data = ctx.getImageData(0, 0, res, res)
      const px = data.data
      for (let i = 3; i < px.length; i += 4) px[i] = px[i] > 110 ? 255 : 0
      ctx.putImageData(data, 0, 0)
      return canvas
    } finally {
      URL.revokeObjectURL(blobUrl)
    }
  })().catch(() => null)

  cache.set(key, job)
  return job
}
