const mq = query => typeof window !== 'undefined' && window.matchMedia(query).matches

export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)')

/** True for touch-first devices (phones, most tablets). */
export const isTouch = () => mq('(hover: none), (pointer: coarse)')

/** True when a precise pointer can hover (mouse / trackpad). */
export const hasFinePointer = () => mq('(hover: hover) and (pointer: fine)')

export const dpr = () => Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1)
