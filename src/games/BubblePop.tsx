import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import type { TopicId } from '../data/curriculum'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'
import TablePicker from '../components/TablePicker'
import { makeFact, resolveTable, useSuggestedTable, type Fact, type TableChoice } from '../utils/timesFacts'
import { playPop, playWrong, playFanfare } from '../utils/sound'

interface Props { topicId: TopicId; onComplete: () => void }

interface Bubble { id: number; value: number; x: number; delay: number; hue: number }

const LANES = [3, 27, 51, 75]
const HUES = [190, 280, 330, 140, 40]
const MAX_HEARTS = 5

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function BubblePop({ topicId, onComplete }: Props) {
  const completeGame = useGameStore(s => s.completeGame)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)
  const recordFact = useGameStore(s => s.recordFact)
  const recordBest = useGameStore(s => s.recordBest)
  const best = useGameStore(s => s.profile?.gameBests?.['bubble-pop'] ?? 0)

  const suggested = useSuggestedTable()
  const [choice, setChoice] = useState<TableChoice>(suggested)
  const [phase, setPhase] = useState<'ready' | 'playing' | 'over'>('ready')
  const [fact, setFact] = useState<Fact | null>(null)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [qid, setQid] = useState(0)
  const [score, setScore] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [streak, setStreak] = useState(0)
  const [popped, setPopped] = useState<number | null>(null)
  const [burst, setBurst] = useState<number[]>([])
  const [flash, setFlash] = useState<string | null>(null)
  const [newBest, setNewBest] = useState(false)

  const answered = useRef(0)
  const missed = useRef<Fact[]>([])
  const resolved = useRef(false)

  const level = Math.floor(score / 5) + 1
  const riseSecs = Math.max(3, 7.5 - (level - 1) * 0.6)

  function nextQuestion(lastKey?: string) {
    let f = makeFact(resolveTable(choice), true)
    while (f.key === lastKey) f = makeFact(resolveTable(choice), true)
    const lanes = shuffle(LANES)
    const delays = shuffle([0, 0.45, 0.9, 1.35])
    setFact(f)
    setBubbles(f.options.map((v, i) => ({ id: i, value: v, x: lanes[i], delay: delays[i], hue: HUES[(qid + i) % HUES.length] })))
    setPopped(null)
    setBurst([])
    resolved.current = false
    setQid(q => q + 1)
  }

  function start() {
    setScore(0)
    setHearts(3)
    setStreak(0)
    setNewBest(false)
    answered.current = 0
    missed.current = []
    startActiveGame(topicId, 'bubble-pop')
    setPhase('playing')
    nextQuestion()
  }

  function gameOver(finalScore: number) {
    completeGame({ topicId, gameType: 'bubble-pop', score: finalScore, totalQuestions: Math.max(answered.current, 1), timeMs: 60000 })
    const isNew = recordBest('bubble-pop', finalScore)
    setNewBest(isNew)
    if (isNew) playFanfare()
    setPhase('over')
  }

  function loseHeart(f: Fact) {
    missed.current.push(f)
    recordFact(f.key, false)
    recordActiveAnswer(false)
    setStreak(0)
    const h = hearts - 1
    setHearts(h)
    if (h <= 0) setTimeout(() => gameOver(score), 500)
    return h
  }

  function tap(b: Bubble) {
    if (!fact || resolved.current || burst.includes(b.id)) return
    answered.current++
    if (b.value === fact.answer) {
      resolved.current = true
      playPop()
      setPopped(b.id)
      recordFact(fact.key, true)
      recordActiveAnswer(true)
      const s = streak + 1
      setStreak(s)
      setScore(sc => sc + 1)
      if (s % 10 === 0 && hearts < MAX_HEARTS) {
        setHearts(h => h + 1)
        setFlash('❤️ Bonus heart!')
      } else if (s % 5 === 0) {
        setFlash(`🔥 ${s} in a row!`)
      }
      setTimeout(() => setFlash(null), 900)
      const key = fact.key
      setTimeout(() => nextQuestion(key), 280)
    } else {
      playWrong()
      setBurst(x => [...x, b.id])
      if (loseHeart(fact) <= 0) resolved.current = true
    }
  }

  function escaped(b: Bubble) {
    if (!fact || resolved.current || b.value !== fact.answer || phase !== 'playing') return
    resolved.current = true
    answered.current++
    playWrong()
    setFlash(`It was ${fact.answer}!`)
    setTimeout(() => setFlash(null), 900)
    const key = fact.key
    if (loseHeart(fact) > 0) setTimeout(() => nextQuestion(key), 700)
  }

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-5">
        <div className="text-7xl">🫧</div>
        <h2 className="text-white font-fredoka text-3xl">Bubble Pop!</h2>
        <p className="text-purple-200 max-w-xs">Pop the bubble with the right answer before it floats away! It gets faster as you go.</p>
        {best > 0 && <p className="text-yellow-300 font-bold">🏆 Your best: {best} bubbles</p>}
        <TablePicker value={choice} onChange={setChoice} />
        <Button variant="gold" size="xl" onClick={start}>🫧 Start popping!</Button>
      </div>
    )
  }

  if (phase === 'over') {
    const uniqueMissed = missed.current.filter((f, i, a) => a.findIndex(g => g.key === f.key) === i)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center gap-4">
        {newBest && <Confetti />}
        <div className="text-7xl">{newBest ? '🏆' : '🫧'}</div>
        <h2 className="text-white font-fredoka text-3xl">{newBest ? 'New high score!' : 'Game over!'}</h2>
        <div className="text-5xl font-black text-white">{score}</div>
        <p className="text-white/60">bubbles popped · best {Math.max(best, score)}</p>
        {uniqueMissed.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-xs w-full text-left">
            <p className="text-white/70 text-sm font-bold mb-2">📝 Let's remember these:</p>
            {uniqueMissed.map(f => (
              <div key={f.key} className="text-white font-bold text-sm">{f.label} = <span className="text-green-400">{f.answer}</span></div>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onComplete}>← Back</Button>
          <Button variant="gold" size="lg" onClick={start}>🫧 Play again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen px-3 pt-16 pb-3 items-center">
      <div className="max-w-2xl w-full flex items-center justify-between mb-2">
        <div className="text-2xl tracking-tight">
          {Array.from({ length: Math.max(hearts, 0) }, (_, i) => <span key={i}>❤️</span>)}
          {Array.from({ length: Math.max(3 - hearts, 0) }, (_, i) => <span key={i} className="opacity-25">🤍</span>)}
        </div>
        <div className="text-white/60 text-sm font-bold">Level {level}</div>
        <div className="text-white font-black text-2xl">🫧 {score}</div>
      </div>

      <div className="max-w-2xl w-full bg-white/10 border-2 border-white/20 rounded-2xl py-3 text-center mb-2">
        <span className="text-white font-fredoka text-4xl">{fact?.label} = ?</span>
      </div>

      <div className="relative max-w-2xl w-full flex-1 overflow-hidden rounded-3xl bg-gradient-to-b from-sky-900/40 to-indigo-900/60 border border-white/10">
        <AnimatePresence>
          {flash && (
            <motion.div
              key={flash}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-1/3 text-center text-3xl font-black text-yellow-300 z-10 pointer-events-none drop-shadow"
            >
              {flash}
            </motion.div>
          )}
        </AnimatePresence>
        {bubbles.map(b => {
          const isPopped = popped === b.id
          const isBurst = burst.includes(b.id)
          return (
            <motion.button
              key={`${qid}-${b.id}`}
              type="button"
              onPointerDown={() => tap(b)}
              initial={{ top: '100%', scale: 1, opacity: 1 }}
              animate={isPopped || isBurst ? { scale: isPopped ? 1.7 : 0.6, opacity: 0 } : { top: '-28%' }}
              transition={isPopped || isBurst ? { duration: isPopped ? 0.25 : 0.4 } : { duration: riseSecs, delay: b.delay, ease: 'linear' }}
              onAnimationComplete={() => !isPopped && !isBurst && escaped(b)}
              style={{
                left: `${b.x}%`,
                background: isBurst
                  ? 'radial-gradient(circle at 30% 30%, #fca5a5, #dc2626)'
                  : `radial-gradient(circle at 30% 30%, hsla(${b.hue},90%,85%,0.95), hsla(${b.hue},80%,55%,0.75))`,
                WebkitTapHighlightColor: 'transparent',
              }}
              className="absolute w-[22%] aspect-square max-w-[130px] rounded-full border-2 border-white/60 shadow-[inset_-6px_-8px_16px_rgba(0,0,0,0.2)] flex items-center justify-center text-white font-black text-3xl drop-shadow focus:outline-none"
            >
              {b.value}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
