import storage from 'helpers/storage'

// Tiny 8-bit sound synth on the Web Audio API. No audio files are downloaded.
// The AudioContext is created lazily on the first user gesture (browser autoplay rules).

const MUTE_KEY = 'sfx.muted'
let ctx = null
let noiseBuffer = null
let muted = storage.get(MUTE_KEY, false)

function audio() {
  if (!ctx) {
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone({ freq, to, type = 'square', dur = 0.1, vol = 0.06, delay = 0 }) {
  const ac = muted ? null : audio()
  if (!ac) return
  const t = ac.currentTime + delay
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function noise({ dur = 0.07, vol = 0.05, delay = 0 } = {}) {
  const ac = muted ? null : audio()
  if (!ac) return
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const t = ac.currentTime + delay
  const src = ac.createBufferSource()
  const gain = ac.createGain()
  src.buffer = noiseBuffer
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(gain).connect(ac.destination)
  src.start(t)
  src.stop(t + dur + 0.02)
}

const arpeggio = (notes, step, opts = {}) => notes.forEach((freq, i) => tone({ freq, delay: i * step, ...opts }))

const sfx = {
  /** Call from a click/tap so later sounds are allowed to play. */
  unlock: () => {
    if (!muted) audio()
  },
  isMuted: () => muted,
  setMuted(value) {
    muted = value
    storage.set(MUTE_KEY, value)
  },

  start: () => arpeggio([523, 659, 784, 1047], 0.08, { dur: 0.09 }),
  squash: (combo = 1) => {
    noise({ dur: 0.06, vol: 0.05 })
    tone({ freq: 260 + combo * 90, to: 110, dur: 0.12, vol: 0.06 })
  },
  gold: () => {
    noise({ dur: 0.05, vol: 0.04 })
    arpeggio([880, 1175, 1568, 2093], 0.045, { dur: 0.07, vol: 0.05 })
  },
  miss: () => tone({ freq: 150, to: 70, dur: 0.1, type: 'triangle', vol: 0.08 }),
  escape: () => tone({ freq: 240, to: 120, dur: 0.14, type: 'sawtooth', vol: 0.025 }),
  tick: () => tone({ freq: 1320, dur: 0.035, vol: 0.03 }),
  over: (best = false) =>
    arpeggio(best ? [784, 988, 1175, 1568, 2093] : [523, 415, 330, 262], 0.13, { dur: 0.16, vol: 0.06 })
}

export default sfx
