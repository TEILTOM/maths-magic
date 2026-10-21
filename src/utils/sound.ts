let ctx: AudioContext | null = null
const MUTE_KEY = 'maths-magic-muted'

export function isMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === '1' } catch { return false }
}

export function setMuted(m: boolean) {
  try { localStorage.setItem(MUTE_KEY, m ? '1' : '0') } catch { /* ignore */ }
}

// Must be called from a tap handler first so iOS lets audio play
export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
  } catch { /* no audio */ }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ctx.currentTime + start
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(vol, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

export function playCorrect() {
  if (isMuted()) return
  tone(880, 0, 0.12)
  tone(1320, 0.06, 0.14)
}

export function playWrong() {
  if (isMuted()) return
  tone(180, 0, 0.22, 'square', 0.08)
  try { navigator.vibrate?.(120) } catch { /* ignore */ }
}

export function playTick() {
  if (isMuted()) return
  tone(660, 0, 0.08, 'triangle', 0.12)
}

export function playGo() {
  if (isMuted()) return
  tone(990, 0, 0.25, 'triangle', 0.15)
}

export function playFanfare() {
  if (isMuted()) return
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.14))
  tone(1319, 0.5, 0.6, 'triangle', 0.12)
}
