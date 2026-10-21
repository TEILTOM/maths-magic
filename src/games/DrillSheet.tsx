import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { getDrillLevel, DRILL_LEVELS, TRICKY_ID, PASS_SCORE } from '../data/drillLevels'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'
import { unlockAudio, playCorrect, playWrong, playTick, playGo, playFanfare, isMuted, setMuted } from '../utils/sound'

interface Props {
  topicId: string
  onComplete: () => void
}

type Phase = 'ready' | 'countdown' | 'times' | 'divide' | 'done'
type Kind = 't' | 'd'
type Table = number | 'squares'

interface Question {
  key: string
  label: string
  answer: number
  options: number[] // always 4, sorted ascending
}

interface Answer {
  key: string
  label: string
  answer: number
  picked: number
  correct: boolean
  phase: 'times' | 'divide'
}

interface Result {
  score: number
  total: number
  secs: number
  passed: boolean
  timedOut: boolean
  newBestScore: boolean
  newBestTime: boolean
}

const TIMER_OPTIONS = [
  { label: '1:30', secs: 90 },
  { label: '1:45', secs: 105 },
  { label: '2:00', secs: 120 },
  { label: '2:30', secs: 150 },
]
const TIMER_KEY = 'maths-magic-drill-timer'

function loadTimerPref(): number {
  try {
    const v = Number(localStorage.getItem(TIMER_KEY))
    return TIMER_OPTIONS.some(o => o.secs === v) ? v : 105
  } catch { return 105 }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleNoConsec<T>(arr: T[]): T[] {
  for (let attempt = 0; attempt < 30; attempt++) {
    const a = shuffle(arr)
    if (a.every((v, i) => i === 0 || v !== a[i - 1])) return a
  }
  const counts = new Map<T, number>()
  arr.forEach(n => counts.set(n, (counts.get(n) ?? 0) + 1))
  const result: T[] = []
  while (result.length < arr.length) {
    const last = result[result.length - 1]
    const left = [...counts.entries()].filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1])
    const [pick] = (left.find(([n]) => n !== last) ?? left[0])
    result.push(pick)
    counts.set(pick, counts.get(pick)! - 1)
  }
  return result
}

function makeOptions(table: Table, correct: number, isDiv: boolean): number[] {
  const ns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  let pool: number[]
  if (isDiv) pool = table === 'squares' ? ns : ns.slice(0, 10)
  else pool = table === 'squares' ? ns.map(n => n * n) : ns.map(n => n * table)
  const distractors = shuffle(pool.filter(v => v !== correct)).slice(0, 3)
  return [correct, ...distractors].sort((a, b) => a - b)
}

function buildQuestion(kind: Kind, table: Table, display: number): Question {
  const sq = table === 'squares'
  let answer: number
  let label: string
  if (kind === 't') {
    answer = sq ? display * display : display * table
    label = sq ? `${display}²` : `${display} × ${table}`
  } else {
    answer = sq ? Math.round(Math.sqrt(display)) : display / table
    label = sq ? `√${display}` : `${display} ÷ ${table}`
  }
  return { key: `${kind}:${sq ? 'sq' : table}:${display}`, label, answer, options: makeOptions(table, answer, kind === 'd') }
}

function parseKey(key: string): Question | null {
  const [kind, t, d] = key.split(':')
  const table: Table = t === 'sq' ? 'squares' : Number(t)
  const display = Number(d)
  if ((kind !== 't' && kind !== 'd') || !display || (table !== 'squares' && !table)) return null
  return buildQuestion(kind, table, display)
}

// Multipliers 1-10, each twice, never the same twice in a row = 20 questions
function makeQuestions(kind: Kind, table: Table): Question[] {
  return shuffleNoConsec([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map(n => {
    if (kind === 't') return buildQuestion('t', table, n)
    return buildQuestion('d', table, table === 'squares' ? n * n : n * table)
  })
}

// Each tricky fact asked twice, trickiest first, max 20
function makeTrickyQuestions(misses: Record<string, number>): Question[] {
  const keys = Object.entries(misses).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => k)
  return shuffleNoConsec([...keys, ...keys])
    .map(parseKey)
    .filter((q): q is Question => q !== null)
}

function formatTime(secs: number) {
  const s = Math.max(0, secs)
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

export default function DrillSheet({ topicId, onComplete }: Props) {
  const navigate = useNavigate()
  const profile = useGameStore(s => s.profile)
  const completeGame = useGameStore(s => s.completeGame)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)
  const recordFact = useGameStore(s => s.recordFact)
  const recordDrill = useGameStore(s => s.recordDrill)

  const isTricky = topicId === TRICKY_ID
  const level = getDrillLevel(topicId)
  const table: Table = level?.table ?? 2
  const levelIdx = DRILL_LEVELS.findIndex(l => l.id === topicId)
  const nextLevel = levelIdx >= 0 ? DRILL_LEVELS[levelIdx + 1] : undefined
  const record = profile?.drillRecords?.[topicId]
  const trickyCount = Object.keys(profile?.factMisses ?? {}).length

  const [phase, setPhase] = useState<Phase>('ready')
  const [timerSecs, setTimerSecs] = useState(loadTimerPref)
  const [timesQs, setTimesQs] = useState<Question[]>([])
  const [divideQs, setDivideQs] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [tapped, setTapped] = useState<number | null>(null)
  const [count, setCount] = useState(3)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [muted, setMutedState] = useState(isMuted)
  const [result, setResult] = useState<Result | null>(null)

  const phaseRef = useRef<Phase>('ready')
  const answersRef = useRef<Answer[]>([])
  const totalRef = useRef(0)
  const startedAt = useRef(0)
  const listItemRef = useRef<HTMLDivElement>(null)

  phaseRef.current = phase
  const limit = isTricky ? null : timerSecs
  const playing = phase === 'times' || phase === 'divide'

  const finish = useCallback((timedOut: boolean) => {
    if (phaseRef.current === 'done') return
    phaseRef.current = 'done'
    const all = answersRef.current
    const score = all.filter(a => a.correct).length
    const total = totalRef.current
    const rawSecs = Math.round((Date.now() - startedAt.current) / 1000)
    const secs = limit ? Math.min(rawSecs, limit) : rawSecs
    const passed = !isTricky && score >= PASS_SCORE
    completeGame({ topicId, gameType: 'drill-sheet', score, totalQuestions: total, timeMs: secs * 1000 })
    const bests = isTricky
      ? { newBestScore: false, newBestTime: false }
      : recordDrill(topicId, score, secs, passed)
    setResult({ score, total, secs, passed, timedOut, ...bests })
    if (passed || (isTricky && score === total)) playFanfare()
    setTapped(null)
    setPhase('done')
  }, [completeGame, recordDrill, topicId, isTricky, limit])

  // Countdown 3-2-1-Go
  useEffect(() => {
    if (phase !== 'countdown') return
    if (count === 0) {
      playGo()
      startedAt.current = Date.now()
      setElapsed(0)
      setPhase('times')
      return
    }
    playTick()
    const id = setTimeout(() => setCount(c => c - 1), 650)
    return () => clearTimeout(id)
  }, [phase, count])

  // One clock across both × and ÷ phases
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 250)
    return () => clearInterval(id)
  }, [playing])

  useEffect(() => {
    if (playing && limit && elapsed >= limit) finish(true)
  }, [elapsed, playing, limit, finish])

  useEffect(() => {
    listItemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [current, phase])

  function toggleMute() {
    const m = !muted
    setMuted(m)
    setMutedState(m)
  }

  function pickTimer(secs: number) {
    setTimerSecs(secs)
    try { localStorage.setItem(TIMER_KEY, String(secs)) } catch { /* ignore */ }
  }

  function startDrill() {
    unlockAudio()
    const tq = isTricky ? makeTrickyQuestions(profile?.factMisses ?? {}) : makeQuestions('t', table)
    const dq = isTricky ? [] : makeQuestions('d', table)
    if (!tq.length) return
    setTimesQs(tq)
    setDivideQs(dq)
    totalRef.current = tq.length + dq.length
    answersRef.current = []
    setAnswers([])
    setCurrent(0)
    setTapped(null)
    setStreak(0)
    setBestStreak(0)
    setResult(null)
    setElapsed(0)
    setCount(3)
    startActiveGame(topicId, 'drill-sheet')
    setPhase('countdown')
  }

  function handleTap(opt: number) {
    if (tapped !== null || !playing) return
    const qs = phase === 'times' ? timesQs : divideQs
    const q = qs[current]
    if (!q) return
    const correct = opt === q.answer
    if (correct) playCorrect()
    else playWrong()
    setTapped(opt)
    recordActiveAnswer(correct)
    recordFact(q.key, correct)
    answersRef.current = [...answersRef.current, { key: q.key, label: q.label, answer: q.answer, picked: opt, correct, phase }]
    setAnswers(answersRef.current)
    const nextStreak = correct ? streak + 1 : 0
    setStreak(nextStreak)
    setBestStreak(b => Math.max(b, nextStreak))

    const tapPhase = phase
    setTimeout(() => {
      if (phaseRef.current !== tapPhase) return
      setTapped(null)
      const next = current + 1
      if (next < qs.length) setCurrent(next)
      else if (tapPhase === 'times' && divideQs.length) { setCurrent(0); setPhase('divide') }
      else finish(false)
    }, correct ? 250 : 650)
  }

  const muteButton = (
    <button
      type="button"
      onClick={toggleMute}
      className="text-xl w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )

  // ─── Ready ──────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-5">
        <div className="absolute top-3 left-3"><Button variant="ghost" size="sm" onClick={onComplete}>← Back</Button></div>
        <div className="absolute top-3 right-3">{muteButton}</div>

        <div className="text-6xl">{isTricky ? '🎯' : level?.emoji ?? '✖️'}</div>
        <div>
          <p className="text-white/60 text-lg">Ready, {profile?.name ?? 'superstar'}?</p>
          <h2 className="text-white font-fredoka text-3xl">{isTricky ? 'My Tricky Facts' : level?.label ?? 'Drill Sheet'}</h2>
        </div>

        {isTricky ? (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 max-w-xs w-full">
            {trickyCount > 0 ? (
              <p className="text-white/70 text-sm">
                {trickyCount} fact{trickyCount === 1 ? '' : 's'} you've found tricky. Each one comes up twice — no timer, take your time! Get them right to clear them from the list.
              </p>
            ) : (
              <p className="text-white/70 text-sm">No tricky facts right now — amazing! 🎉 Any you get wrong in drills will appear here.</p>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 max-w-xs w-full space-y-1">
              <p className="text-white/70 text-sm">20 × then 20 ÷ · get {PASS_SCORE}/40 to pass</p>
              {record && (
                <p className="text-yellow-300 text-sm font-bold">
                  ⭐ Best {record.bestScore}/40
                  {record.bestPassSecs != null && <> · ⚡ Fastest pass {formatTime(record.bestPassSecs)}</>}
                </p>
              )}
            </div>

            <div className="max-w-xs w-full">
              <p className="text-white/60 text-sm mb-2">Choose your time limit:</p>
              <div className="grid grid-cols-4 gap-2">
                {TIMER_OPTIONS.map(opt => (
                  <button
                    key={opt.secs}
                    onClick={() => pickTimer(opt.secs)}
                    className={`rounded-xl py-3 font-black text-sm border-2 transition-all ${
                      timerSecs === opt.secs
                        ? 'bg-yellow-400 border-yellow-300 text-amber-900'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {(!isTricky || trickyCount > 0) && (
          <Button variant="gold" size="xl" onClick={startDrill}>⏱️ Start!</Button>
        )}
      </div>
    )
  }

  // ─── Countdown ──────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-white font-fredoka text-9xl"
          >
            {count > 0 ? count : 'Go!'}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ─── Done ───────────────────────────────────────────────────────
  if (phase === 'done' && result) {
    const { score, total, secs, passed, timedOut, newBestScore, newBestTime } = result
    const pct = score / Math.max(total, 1)
    const need = PASS_SCORE - score
    const unanswered = total - answers.length
    const mistakes = answers.filter(a => !a.correct)
      .filter((a, i, arr) => arr.findIndex(b => b.key === a.key) === i)
    const timesScore = answers.filter(a => a.phase === 'times' && a.correct).length
    const divideScore = answers.filter(a => a.phase === 'divide' && a.correct).length
    const perfect = score === total

    let emoji = '💪', heading = 'Keep practising!', sub = ''
    if (isTricky) {
      emoji = perfect ? '🌟' : '🎯'
      heading = perfect ? 'All tricky facts right!' : 'Great practice!'
    } else if (passed) {
      emoji = perfect ? '👑' : '🏆'
      heading = perfect ? 'Perfect score!' : 'Level passed!'
    } else if (need <= 3) {
      emoji = '⭐'; heading = 'So close!'
      sub = `Just ${need} more to pass — you've got this!`
    } else {
      sub = `Need ${PASS_SCORE}/40 to unlock the next level`
    }

    return (
      <div className="flex flex-col items-center min-h-screen px-4 py-8 text-center gap-4">
        {(passed || (isTricky && perfect)) && <Confetti />}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-7xl">{emoji}</motion.div>
        <h2 className="text-white font-fredoka text-3xl">{heading}</h2>
        {sub && <p className="text-white/60 text-sm -mt-2">{sub}</p>}

        {(newBestTime || newBestScore) && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="bg-yellow-400/20 border-2 border-yellow-400/60 rounded-2xl px-4 py-2 text-yellow-300 font-black"
          >
            {newBestTime ? `⚡ New fastest time: ${formatTime(secs)}!` : `⭐ New best score: ${score}/40!`}
          </motion.div>
        )}

        <div className="bg-white/10 border border-white/20 rounded-2xl p-5 max-w-xs w-full space-y-2">
          {!isTricky && (
            <>
              <div className="flex justify-between text-sm"><span className="text-white/60">✖️ Times</span><span className="text-white font-black">{timesScore} / {timesQs.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/60">➗ Divide</span><span className="text-white font-black">{divideScore} / {divideQs.length}</span></div>
            </>
          )}
          <div className="flex justify-between text-sm"><span className="text-white/60">⏱ Time</span><span className="text-white font-black">{formatTime(secs)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-white/60">🔥 Best streak</span><span className="text-white font-black">{bestStreak}</span></div>
          <div className="border-t border-white/10 pt-2 flex justify-between">
            <span className="text-white/80 font-bold">Total</span>
            <span className={`font-black text-lg ${passed || (isTricky && pct >= 0.9) ? 'text-green-400' : 'text-white'}`}>{score} / {total}</span>
          </div>
          {timedOut && unanswered > 0 && (
            <p className="text-orange-300 text-xs pt-1">⏰ Time ran out with {unanswered} left to answer</p>
          )}
        </div>

        {mistakes.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-xs w-full text-left">
            <p className="text-white/70 text-sm font-bold mb-2">📝 Let's remember these:</p>
            <div className="space-y-1">
              {mistakes.map(m => (
                <div key={m.key} className="flex justify-between text-sm">
                  <span className="text-white font-bold">{m.label} = <span className="text-green-400">{m.answer}</span></span>
                  <span className="text-red-300/70 text-xs self-center">you picked {m.picked}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full max-w-xs">
          {passed && nextLevel && (
            <Button variant="gold" size="lg" fullWidth onClick={() => navigate(`/game/${nextLevel.id}/drill-sheet`, { replace: true })}>
              🎉 Start {nextLevel.label} →
            </Button>
          )}
          {passed && !nextLevel && (
            <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-4 py-3 text-yellow-300 font-bold">
              🏆 Tables Champion! All levels complete!
            </div>
          )}
          <Button variant="primary" size="lg" fullWidth onClick={startDrill}>🔄 {isTricky ? 'Practise again' : 'Try again'}</Button>
          {!isTricky && trickyCount > 0 && (
            <Button variant="secondary" fullWidth onClick={() => navigate(`/game/${TRICKY_ID}/drill-sheet`, { replace: true })}>
              🎯 Practise my tricky facts ({trickyCount})
            </Button>
          )}
          <Button variant="ghost" fullWidth onClick={onComplete}>← Back to Drills</Button>
        </div>
      </div>
    )
  }

  // ─── Playing ────────────────────────────────────────────────────
  const questions = phase === 'times' ? timesQs : divideQs
  const q = questions[current]
  if (!q) return null

  const phaseAnswers = answers.filter(a => a.phase === phase)
  const progress = answers.length / Math.max(totalRef.current, 1)
  const timeLeft = limit ? limit - elapsed : elapsed
  const timerDanger = !!limit && timeLeft <= 20
  const timerWarning = !!limit && timeLeft <= 45
  const tappedCorrect = tapped === q.answer
  const tappedWrong = tapped !== null && tapped !== q.answer

  return (
    <div className="flex flex-col h-screen px-2 pt-3 pb-3">
      {/* Header */}
      <div className="w-full mb-2 space-y-1 px-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onComplete}
              className="text-white/60 text-sm w-9 h-9 rounded-full bg-white/10 border border-white/20"
              aria-label="Exit drill"
            >
              ✕
            </button>
            <div className={`font-black text-2xl font-mono tabular-nums ${
              timerDanger ? 'text-red-400 animate-pulse' :
              timerWarning ? 'text-yellow-300' : 'text-white'
            }`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isTricky ? 'bg-amber-500/40 text-amber-200' :
              phase === 'times' ? 'bg-purple-500/40 text-purple-200' : 'bg-pink-500/40 text-pink-200'
            }`}>
              {isTricky ? '🎯 Tricky' : phase === 'times' ? '✖️ Times' : '➗ Divide'}
            </span>
            <AnimatePresence>
              {streak >= 3 && (
                <motion.span
                  key={streak}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-orange-300 font-black text-sm"
                >
                  🔥{streak}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-white/50 text-sm">{answers.length + 1}/{totalRef.current}</div>
            {muteButton}
          </div>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
      </div>

      {/* Main area: question list | question box | answer buttons */}
      <div className="flex gap-2 flex-1 min-h-0">
        <div className="w-[110px] shrink-0 flex flex-col gap-0.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {questions.map((qItem, i) => {
            const res = phaseAnswers[i]
            const isCurrent = i === current
            return (
              <div
                key={i}
                ref={isCurrent ? listItemRef : undefined}
                className={`text-sm px-2 py-1.5 rounded-lg whitespace-nowrap overflow-hidden font-bold ${
                  isCurrent
                    ? 'bg-purple-500/50 text-white ring-1 ring-purple-400/60'
                    : res?.correct ? 'text-green-400'
                    : res ? 'text-red-400/80'
                    : 'text-white/30'
                }`}
              >
                {qItem.label.replace(/ /g, '')}
                {res?.correct && <span className="text-green-300"> ={qItem.answer}✓</span>}
                {res && !res.correct && <span className="text-red-400"> ✗</span>}
              </div>
            )
          })}
        </div>

        <motion.div
            key={`${phase}-${current}`}
            initial={{ scale: 0.97, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.08 }}
            className="flex-1 flex gap-2 min-w-0 self-start"
          >
            <div className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl flex items-center justify-center p-3 min-h-[230px]">
              <div className="text-center">
                <div className="text-white font-fredoka text-4xl">{q.label}</div>
                <div className="text-white/50 text-xl mt-1">= ?</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-[44%]">
              {q.options.map(opt => {
                const isTapped = tapped === opt
                let bg = 'bg-white/10 border-white/20'
                if (isTapped && tappedCorrect) bg = 'bg-green-500 border-green-400'
                else if (isTapped && tappedWrong) bg = 'bg-red-500 border-red-400'
                return (
                  <motion.button
                    key={`${phase}-${current}-${opt}`}
                    whileTap={tapped !== null ? {} : { scale: 0.93 }}
                    onClick={() => handleTap(opt)}
                    disabled={tapped !== null}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    className={`h-[52px] border-2 rounded-xl text-white font-black text-2xl focus:outline-none ${bg}`}
                  >
                    {opt}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
      </div>
    </div>
  )
}
