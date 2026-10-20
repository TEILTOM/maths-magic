import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { getDrillLevel, DRILL_TIME, DRILL_QUESTIONS } from '../data/drillLevels'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'

interface Props {
  topicId: string
  onComplete: () => void
}

type Phase = 'ready' | 'times' | 'divide' | 'done'

interface Question {
  display: number
  answer: number
  options: number[]
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeOptions(table: number | 'squares', correct: number, isDiv: boolean): number[] {
  const opts = new Set([correct])

  if (table === 'squares') {
    if (!isDiv) {
      // Times: answer is n². Wrong answers are nearby squares.
      const n = Math.round(Math.sqrt(correct))
      for (let off = 1; off <= 8 && opts.size < 5; off++) {
        if (n + off <= 12) opts.add((n + off) ** 2)
        if (n - off >= 1 && opts.size < 5) opts.add((n - off) ** 2)
      }
    } else {
      // Divide: answer is n (1-12). Wrong answers are nearby integers.
      for (let off = 1; off <= 8 && opts.size < 5; off++) {
        if (correct + off <= 12) opts.add(correct + off)
        if (correct - off >= 1 && opts.size < 5) opts.add(correct - off)
      }
    }
  } else {
    if (!isDiv) {
      // Times: answer is n * table. Wrong = neighboring multiples of table.
      for (let off = 1; off <= 8 && opts.size < 5; off++) {
        const up = correct + off * (table as number)
        const dn = correct - off * (table as number)
        if (up <= (table as number) * 12) opts.add(up)
        if (dn >= 0 && opts.size < 5) opts.add(dn)
      }
    } else {
      // Divide: answer is factor (0-10). Wrong = nearby integers in range.
      for (let off = 1; off <= 8 && opts.size < 5; off++) {
        if (correct + off <= 10) opts.add(correct + off)
        if (correct - off >= 0 && opts.size < 5) opts.add(correct - off)
      }
    }
  }

  return shuffle([...opts]).slice(0, 5)
}

function makeTimesQuestions(table: number | 'squares'): Question[] {
  return Array.from({ length: DRILL_QUESTIONS }, () => {
    if (table === 'squares') {
      const n = randInt(1, 12)
      const answer = n * n
      return { display: n, answer, options: makeOptions(table, answer, false) }
    }
    const n = randInt(0, 10)
    const answer = n * (table as number)
    return { display: n, answer, options: makeOptions(table, answer, false) }
  })
}

function makeDivideQuestions(table: number | 'squares'): Question[] {
  return Array.from({ length: DRILL_QUESTIONS }, () => {
    if (table === 'squares') {
      const n = randInt(1, 12)
      const answer = n
      return { display: n * n, answer, options: makeOptions(table, answer, true) }
    }
    const factor = randInt(0, 10)
    const answer = factor
    return { display: factor * (table as number), answer, options: makeOptions(table, answer, true) }
  })
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function DrillSheet({ topicId, onComplete }: Props) {
  const completeGame = useGameStore(s => s.completeGame)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)

  const level = getDrillLevel(topicId)
  const table = level?.table ?? 2

  const [phase, setPhase] = useState<Phase>('ready')
  const [timesQs, setTimesQs] = useState<Question[]>([])
  const [divideQs, setDivideQs] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DRILL_TIME)
  const [timesCorrect, setTimesCorrect] = useState(0)
  const [divideCorrect, setDivideCorrect] = useState(0)
  const [tapped, setTapped] = useState<number | null>(null) // which option was tapped
  const [advancing, setAdvancing] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef = useRef<Phase>('ready')
  const timesCorrectRef = useRef(0)
  const divideCorrectRef = useRef(0)
  const currentRef = useRef(0)
  const timerRunning = useRef(false)

  phaseRef.current = phase
  timesCorrectRef.current = timesCorrect
  divideCorrectRef.current = divideCorrect
  currentRef.current = current

  const finishDrill = useCallback((tc: number, dc: number) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    timerRunning.current = false
    completeGame({
      topicId,
      gameType: 'drill-sheet',
      score: tc + dc,
      totalQuestions: DRILL_QUESTIONS * 2,
      timeMs: 0,
    })
    setPhase('done')
  }, [completeGame, topicId])

  useEffect(() => {
    if (phase === 'times' && !timerRunning.current) {
      timerRunning.current = true
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
            timerRunning.current = false
            finishDrill(timesCorrectRef.current, divideCorrectRef.current)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    if (phase === 'ready' || phase === 'done') {
      timerRunning.current = false
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function startDrill() {
    setTimesQs(makeTimesQuestions(table))
    setDivideQs(makeDivideQuestions(table))
    setTimesCorrect(0)
    setDivideCorrect(0)
    setCurrent(0)
    setTimeLeft(DRILL_TIME)
    setTapped(null)
    setAdvancing(false)
    startActiveGame(topicId, 'drill-sheet')
    setPhase('times')
  }

  function handleTap(option: number) {
    if (advancing) return
    const questions = phase === 'times' ? timesQs : divideQs
    const q = questions[current]
    if (!q) return

    const isCorrect = option === q.answer
    setTapped(option)
    setAdvancing(true)
    recordActiveAnswer(isCorrect)

    if (isCorrect) {
      if (phase === 'times') setTimesCorrect(c => { timesCorrectRef.current = c + 1; return c + 1 })
      else setDivideCorrect(c => { divideCorrectRef.current = c + 1; return c + 1 })
    }

    setTimeout(() => {
      setTapped(null)
      setAdvancing(false)
      const nextIdx = currentRef.current + 1
      if (phaseRef.current === 'times') {
        if (nextIdx >= DRILL_QUESTIONS) { setCurrent(0); setPhase('divide') }
        else setCurrent(nextIdx)
      } else {
        if (nextIdx >= DRILL_QUESTIONS) finishDrill(timesCorrectRef.current, divideCorrectRef.current)
        else setCurrent(nextIdx)
      }
    }, isCorrect ? 300 : 600)
  }

  // ─── Ready ──────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-5">
        <div className="text-7xl">{level?.emoji ?? '✖️'}</div>
        <h2 className="text-white font-fredoka text-3xl">{level?.label ?? 'Drill Sheet'}</h2>
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 max-w-xs w-full text-left space-y-2">
          <p className="text-white font-bold">📋 How it works:</p>
          <p className="text-white/70 text-sm">1. 28 times questions, then 28 divide</p>
          <p className="text-white/70 text-sm">2. All in <span className="text-yellow-300 font-black">1 minute 45 seconds</span></p>
          <p className="text-white/70 text-sm">3. Tap the right answer — rapid fire!</p>
        </div>
        <Button variant="gold" size="xl" onClick={startDrill}>⏱️ Start Drill!</Button>
        <Button variant="ghost" size="sm" onClick={onComplete}>← Back</Button>
      </div>
    )
  }

  // ─── Done ───────────────────────────────────────────────────────
  if (phase === 'done') {
    const total = timesCorrect + divideCorrect
    const pct = Math.round((total / (DRILL_QUESTIONS * 2)) * 100)
    const great = pct >= 85

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-4">
        {great && <Confetti />}
        <div className="text-6xl">{great ? '🏆' : pct >= 60 ? '⭐' : '💪'}</div>
        <h2 className="text-white font-fredoka text-3xl">
          {great ? 'Brilliant!' : pct >= 60 ? 'Good try!' : 'Keep practising!'}
        </h2>
        <div className="bg-white/10 border border-white/20 rounded-2xl p-5 max-w-xs w-full space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">✖️ Times</span>
            <span className="text-white font-black">{timesCorrect} / {DRILL_QUESTIONS}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">➗ Divide</span>
            <span className="text-white font-black">{divideCorrect} / {DRILL_QUESTIONS}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="text-white/80 font-bold">Total</span>
            <span className="text-white font-black text-lg">{total} / {DRILL_QUESTIONS * 2}</span>
          </div>
        </div>
        {great && level?.nextLabel && level.nextLabel !== 'Champion!' && (
          <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-4 py-2 text-yellow-300 text-sm font-bold">
            🎉 Next up: {level.nextLabel}
          </div>
        )}
        {great && level?.nextLabel === 'Champion!' && (
          <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-4 py-2 text-yellow-300 font-bold">
            🏆 Tables Champion!
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onComplete}>← Back</Button>
          <Button variant="gold" size="lg" onClick={startDrill}>🔄 Try Again!</Button>
        </div>
      </div>
    )
  }

  // ─── Playing ────────────────────────────────────────────────────
  const questions = phase === 'times' ? timesQs : divideQs
  const q = questions[current]
  if (!q) return null

  const totalAnswered = (phase === 'times' ? 0 : DRILL_QUESTIONS) + current
  const progress = totalAnswered / (DRILL_QUESTIONS * 2)
  const timerDanger = timeLeft <= 20
  const timerWarning = timeLeft <= 45
  const tappedCorrect = tapped === q.answer
  const tappedWrong = tapped !== null && tapped !== q.answer

  return (
    <div className="flex flex-col min-h-screen px-3 pt-12 pb-4 items-center">
      {/* Timer + progress */}
      <div className="max-w-lg w-full mb-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className={`font-black text-3xl font-mono tabular-nums ${
            timerDanger ? 'text-red-400 animate-pulse' :
            timerWarning ? 'text-yellow-300' : 'text-white'
          }`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <div className="text-white/50 text-sm">{totalAnswered + 1}/{DRILL_QUESTIONS * 2}</div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40">
          <span>✖️ {timesCorrect}/{DRILL_QUESTIONS}</span>
          <span className={`font-bold ${phase === 'times' ? 'text-purple-300' : 'text-pink-300'}`}>
            {phase === 'times' ? '✖️ Times' : '➗ Divide'}
          </span>
          <span>➗ {divideCorrect}/{DRILL_QUESTIONS}</span>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${current}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="max-w-sm w-full text-center mb-4"
        >
          <div className="bg-white/10 border-2 border-white/20 rounded-2xl py-5 px-4">
            {phase === 'times' ? (
              table === 'squares'
                ? <span className="text-white font-fredoka text-5xl">{q.display}<sup>2</sup> = ?</span>
                : <span className="text-white font-fredoka text-5xl">{q.display} × {table} = ?</span>
            ) : (
              table === 'squares'
                ? <span className="text-white font-fredoka text-5xl">√{q.display} = ?</span>
                : <span className="text-white font-fredoka text-5xl">{q.display} ÷ {table} = ?</span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Answer buttons — 2×2 + 1 centred */}
      <div className="max-w-sm w-full space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {q.options.slice(0, 4).map(opt => {
            const isCorrectOpt = opt === q.answer
            const isTapped = tapped === opt
            let bg = 'bg-white/10 border-white/20 hover:bg-white/20 active:scale-95'
            if (isTapped && tappedCorrect) bg = 'bg-green-500 border-green-400 scale-95'
            else if (isTapped && tappedWrong) bg = 'bg-red-500 border-red-400 scale-95'
            else if (tappedWrong && isCorrectOpt) bg = 'bg-green-500/60 border-green-400'

            return (
              <motion.button
                key={opt}
                whileTap={advancing ? {} : { scale: 0.93 }}
                onClick={() => handleTap(opt)}
                disabled={advancing}
                className={`border-2 rounded-2xl py-5 text-white font-black text-3xl transition-all ${bg}`}
              >
                {opt}
              </motion.button>
            )
          })}
        </div>
        {q.options[4] !== undefined && (
          <motion.button
            whileTap={advancing ? {} : { scale: 0.93 }}
            onClick={() => handleTap(q.options[4])}
            disabled={advancing}
            className={`w-full border-2 rounded-2xl py-5 text-white font-black text-3xl transition-all ${
              tapped === q.options[4] && tappedCorrect ? 'bg-green-500 border-green-400 scale-95' :
              tapped === q.options[4] && tappedWrong ? 'bg-red-500 border-red-400 scale-95' :
              tappedWrong && q.options[4] === q.answer ? 'bg-green-500/60 border-green-400' :
              'bg-white/10 border-white/20 hover:bg-white/20 active:scale-95'
            }`}
          >
            {q.options[4]}
          </motion.button>
        )}
      </div>
    </div>
  )
}
