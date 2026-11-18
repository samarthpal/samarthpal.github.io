import me from 'images/me.jpeg'

// Crop/mask tuned for me.jpeg (640×640): keeps the face + shoulders, fades the café lights.
export const PORTRAIT = {
  src: me,
  crop: { x: 0.19, y: 0.24, w: 0.7, h: 0.76 },
  aspect: 0.76 / 0.7, // height ÷ width of the crop
  mask: { cx: 0.52, cy: 0.46, rx: 0.52, ry: 0.62, soft: 0.5 },
  contrast: 1.35,
  gamma: 0.9
}
