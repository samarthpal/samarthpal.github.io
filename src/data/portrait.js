import me from 'images/samarth-pal.jpeg'

// Crop/mask tuned for samarth-pal.jpeg (640×640). The descriptive filename matters: it's what
// Google Images sees.
// The crop centres the face; the elliptical mask is inscribed in the crop (cx/cy 0.5,
// rx/ry 0.5) so it fades to fully transparent *before* any edge — a soft oval, never a
// visible square border. Used by every render mode (photo, ASCII, pixel).
export const PORTRAIT = {
  src: me,
  crop: { x: 0.18, y: 0.1, w: 0.72, h: 0.8 },
  aspect: 0.8 / 0.72, // height ÷ width of the crop
  mask: { cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, soft: 0.55 },
  contrast: 1.35,
  gamma: 0.9
}
