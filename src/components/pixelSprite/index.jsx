/**
 * Renders a bitmap (array of strings) as a crisp inline SVG.
 * @param {{ rows: string[], colors: Record<string,string>, size?: number, className?: string }} props
 */
export default function PixelSprite({ rows, colors, size = 64, className = '' }) {
  const w = rows[0].length
  const h = rows.length
  const rects = []
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (colors[ch]) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={colors[ch]} />)
    })
  )
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {rects}
    </svg>
  )
}
