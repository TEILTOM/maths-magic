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
type Flash = 'correct' | 'wrong' | null

interface Question {
  display: number   // number shown in question
  answer: number
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeTimesQuestions(table: number | 'squares'): Question[] {
  return Array.from({ length: DRILL_QUESTIONS }, () => {
    if (table === 'squares') {
      const n = randInt(1, 12)
      return { display: n, answer: n * n }
    }
    const n = randInt(0, 10)
    return { display: n, answer: n * table }
  })
}

function makeDivideQuestions(table: number | 'squares'): Question[] {
  return Array.from({ length: DRILL_QUESTIONS }, () => {
    if (table === 'squares') {
      const n = randInt(1, 12)
      return { display: n * n, answer: n }
    }
    const factor = randInt(0, 10)
    return { display: factor * (table as number), answer: factor }
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
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(DRILL_TIME)
  const [timesCorrect, setTimesCorrect] = useState(0)
  const [divideCorrect, setDivideCorrect] = useState(0)
  const [flash, setFlash] = useState<Flash>(null)
  const [showCorrect, setShowCorrect] = useState<number | null>(null)
  const [advancing, setAdvancing] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef = useRef<Phase>('ready')
  const timesCorrectRef = useRef(0)
  const divideCorrectRef = useRef(0)
  const currentRef = useRef(0)

  phaseRef.current = phase
  timesCorrectRef.current = timesCorrect
  divideCorrectRef.current = divideCorrect
  currentRef.current = current

  const finishDrill = useCallback((tc: number, dc: number) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    completeGame({
      topicId,
      gameType: 'drill-sheet',
      score: tc + dc,
      totalQuestions: DRILL_QUESTIONS * 2,
      timeMs: Date.now() * 1000, // placeholder; store uses completedAt
    })
    setPhase('done')
  }, [completeGame, topicId])

  // Single timer started when drill begins, runs through both phases
  const timerRunning = useRef(false)
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

  useEffect(() => {
    if ((phase === 'times' || phase === 'divide') && !advancing) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [phase, current, advancing])

  function startDrill() {
    const tqs = makeTimesQuestions(table)
    const dqs = makeDivideQuestions(table)
    setTimesQs(tqs)
    setDivideQs(dqs)
    setTimesCorrect(0)
    setDivideCorrect(0)
    setCurrent(0)
    setInput('')
    setTimeLeft(DRILL_TIME)
    setFlash(null)
    setShowCorrect(null)
    setAdvancing(false)
    startActiveGame(topicId, 'drill-sheet')
    setPhase('times')
  }

  function advanceQuestion(isCorrect: boolean, correctAnswer: number) {
    setAdvancing(true)
    setFlash(isCorrect ? 'correct' : 'wrong')
    if (!isCorrect) setShowCorrect(correctAnswer)

    setTimeout(() => {
      setFlash(null)
      setShowCorrect(null)
      setAdvancing(false)
      setInput('')

      const nextIdx = currentRef.current + 1
      if (phaseRef.current === 'times') {
        if (nextIdx >= DRILL_QUESTIONS) {
          setCurrent(0)
          setPhase('divide')
        } else {
          setCurrent(nextIdx)
        }
      } else {
        if (nextIdx >= DRILL_QUESTIONS) {
          finishDrill(timesCorrectRef.current, divideCorrectRef.current)
        } else {
          setCurrent(nextIdx)
        }
      }
    }, isCorrect ? 250 : 900)
  }

  function handleInputChange(val: string) {
    if (advancing) return
    const clean = val.replace(/[^0-9]/g, '')
    setInput(clean)
    if (!clean) return

    const questions = phase === 'times' ? timesQs : divideQs
    const q = questions[current]
    if (!q) return

    const num = parseInt(clean, 10)
    const answerStr = String(q.answer)

    if (num === q.answer) {
      recordActiveAnswer(true)
      if (phase === 'times') setTimesCorrect(c => { timesCorrectRef.current = c + 1; return c + 1 })
      else setDivideCorrect(c => { divideCorrectRef.current = c + 1; return c + 1 })
      advanceQuestion(true, q.answer)
    } else if (clean.length >= answerStr.length) {
      recordActiveAnswer(false)
      advanceQuestion(false, q.answer)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && input && !advancing) {
      const questions = phase === 'times' ? timesQs : divideQs
      const q = questions[current]
      if (!q) return
      const num = parseInt(input, 10)
      const isCorrect = num === q.answer
      recordActiveAnswer(isCorrect)
      if (isCorrect) {
        if (phase === 'times') setTimesCorrect(c => { timesCorrectRef.current = c + 1; return c + 1 })
        else setDivideCorrect(c => { divideCorrectRef.current = c + 1; return c + 1 })
      }
      advanceQuestion(isCorrect, q.answer)
    }
  }

  // ─── Ready screen ───────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-5">
        <div className="text-7xl">{level?.emoji ?? '✖️'}</div>
        <h2 className="text-white font-fredoka text-3xl">{level?.label ?? 'Drill Sheet'}</h2>
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 max-w-xs w-full text-left space-y-2">
          <p className="text-white font-bold">📋 How it works:</p>
          <p className="text-white/70 text-sm">1. Answer 28 times questions</p>
          <p className="text-white/70 text-sm">2. Then 28 divide questions</p>
          <p className="text-white/70 text-sm">3. All in <span className="text-yellow-300 font-black">1 minute 45 seconds</span></p>
          <p className="text-white/70 text-sm">4. Type the answer — it auto-submits!</p>
        </div>
        <Button variant="gold" size="xl" onClick={startDrill}>
          ⏱️ Start Drill!
        </Button>
        <Button variant="ghost" size="sm" onClick={onComplete}>← Back</Button>
      </div>
    )
  }

  // ─── Done screen ────────────────────────────────────────────────
  if (phase === 'done') {
    const total = timesCorrect + divideCorrect
    const pct = Math.round((total / (DRILL_QUESTIONS * 2)) * 100)
    const passed = total >= DRILL_QUESTIONS * 2 // all correct
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

        {passed && level?.nextLabel && level.nextLabel !== 'Champion!' && (
          <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-4 py-2 text-yellow-300 text-sm font-bold">
            🎉 Next up: {level.nextLabel}
          </div>
        )}
        {passed && level?.nextLabel === 'Champion!' && (
          <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-4 py-2 text-yellow-300 text-sm font-bold">
            🏆 Tables Champion! All levels complete!
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
  const totalAnswered = (phase === 'times' ? 0 : DRILL_QUESTIONS) + current
  const totalQ = DRILL_QUESTIONS * 2
  const progress = totalAnswered / totalQ
  const timerDanger = timeLeft <= 20
  const timerWarning = timeLeft <= 45

  return (
    <div className="flex flex-col min-h-screen px-4 pt-14 pb-6 items-center">
      {/* Timer + progress bar */}
      <div className="max-w-lg w-full mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className={`font-black text-3xl font-mono tabular-nums transition-colors ${
            timerDanger ? 'text-red-400 animate-pulse' :
            timerWarning ? 'text-yellow-300' : 'text-white'
          }`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <div className="text-white/50 text-sm">
            {totalAnswered + 1}/{totalQ}
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40">
          <span>✖️ {timesCorrect}/{DRILL_QUESTIONS}</span>
          <span className={phase === 'times' ? 'text-purple-300 font-bold' : 'text-white/40'}>
            {phase === 'times' ? '← Times' : 'Divide →'}
          </span>
          <span>➗ {divideCorrect}/{DRILL_QUESTIONS}</span>
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${current}`}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`max-w-sm w-full rounded-3xl border-4 p-8 text-center mb-5 transition-colors ${
            flash === 'correct' ? 'border-green-400 bg-green-500/20' :
            flash === 'wrong' ? 'border-red-400 bg-red-500/20' :
            'border-white/20 bg-white/10'
          }`}
        >
          {phase === 'times' ? (
            table === 'squares' ? (
              <div className="text-white font-fredoka text-4xl">
                {q?.display}<sup>2</sup> = ?
              </div>
            ) : (
              <div className="text-white font-fredoka text-4xl">
                {q?.display} × {table} = ?
              </div>
            )
          ) : (
            table === 'squares' ? (
              <div className="text-white font-fredoka text-4xl">
                √{q?.display} = ?
              </div>
            ) : (
              <div className="text-white font-fredoka text-4xl">
                {q?.display} ÷ {table} = ?
              </div>
            )
          )}

          {flash === 'correct' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-400 font-black text-xl mt-2">
              ✓ Correct!
            </motion.div>
          )}
          {flash === 'wrong' && showCorrect !== null && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-300 text-lg mt-2">
              The answer is <span className="font-black text-white">{showCorrect}</span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Input */}
      {!flash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={advancing}
            autoComplete="off"
            placeholder="?"
            className="w-full text-center text-4xl font-black text-white bg-white/10 border-2 border-white/30 focus:border-purple-400 rounded-2xl py-4 outline-none transition-colors caret-purple-400"
          />
          <p className="text-white/30 text-xs">Type answer · auto-submits when right · Enter to confirm</p>
        </motion.div>
      )}

      {/* Phase banner */}
      <div className="mt-auto pt-4 text-center">
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          phase === 'times' ? 'bg-purple-500/30 text-purple-300' : 'bg-pink-500/30 text-pink-300'
        }`}>
          {phase === 'times' ? '✖️ Times phase' : '➗ Divide phase'}
        </span>
      </div>
    </div>
  )
}
