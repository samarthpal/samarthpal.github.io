// Pointy-top hexagon as a CSS clip-path polygon, radius in vmax so it covers any aspect ratio.
// Same point count at every size, so GSAP can tween between two values.
const ANGLES = [-90, -30, 30, 90, 150, 210].map(a => (a * Math.PI) / 180)

/**
 * @param {number} radius  radius in vmax (0 = collapsed point, ~120 = covers the viewport)
 * @param {string} cx      centre x (any CSS length, default 50%)
 * @param {string} cy      centre y
 */
export default function hexClip(radius, cx = '50%', cy = '50%') {
  const points = ANGLES.map(a => {
    const x = (Math.cos(a) * radius).toFixed(3)
    const y = (Math.sin(a) * radius).toFixed(3)
    return `calc(${cx} + ${x}vmax) calc(${cy} + ${y}vmax)`
  })
  return `polygon(${points.join(', ')})`
}
