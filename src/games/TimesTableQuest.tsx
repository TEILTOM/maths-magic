import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import type { TopicId, Difficulty } from '../data/curriculum'
import { getCharacter } from '../data/characters'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'
import StarRating from '../components/ui/StarRating'
import TablePicker from '../components/TablePicker'
import { makeFactSet, useSuggestedTable, type Fact, type TableChoice } from '../utils/timesFacts'
import { playCorrect, playWrong, playHit, playRoar, playFanfare } from '../utils/sound'

interface Props { topicId: TopicId; difficulty: Difficulty; onComplete: () => void }

const ROOMS = [
  { emoji: '🚪', name: 'Castle Gate' },
  { emoji: '🕯️', name: 'Candle Corridor' },
  { emoji: '🔮', name: 'Crystal Chamber' },
  { emoji: '📚', name: 'Wizard Library' },
  { emoji: '🧪', name: 'Potion Lab' },
  { emoji: '🕸️', name: 'Spider Stairs' },
  { emoji: '🗝️', name: 'Key Vault' },
  { emoji: '🌋', name: 'Lava Bridge' },
]
const DRAGON_HP = 5
const BOSS_SECS = 10
const START_HEARTS = 3

type Phase = 'ready' | 'rooms' | 'boss' | 'won' | 'lost'

export default function TimesTableQuest({ topicId, onComplete }: Props) {
  const profile = useGameStore(s => s.profile)!
  const completeGame = useGameStore(s => s.completeGame)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)
  const recordFact = useGameStore(s => s.recordFact)
  const recordBest = useGameStore(s => s.recordBest)
  const dragonsBeaten = profile.gameBests?.['dragons-beaten'] ?? 0
  const char = getCharacter(profile.characterId)

  const suggested = useSuggestedTable()
  const [choice, setChoice] = useState<TableChoice>(suggested)
  const [phase, setPhase] = useState<Phase>('ready')
  const [facts, setFacts] = useState<Fact[]>([])
  const [idx, setIdx] = useState(0)
  const [hearts, setHearts] = useState(START_HEARTS)
  const [dragonHp, setDragonHp] = useState(DRAGON_HP)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [wrongPick, setWrongPick] = useState<number | null>(null)
  const [bossTime, setBossTime] = useState(BOSS_SECS)
  const [fire, setFire] = useState(false)

  const correctCount = useRef(0)
  const attempts = useRef(0)
  const startedAt = useRef(0)

  const fact = facts[idx]
  const inBoss = phase === 'boss'

  function finish(won: boolean) {
    completeGame({ topicId, gameType: 'times-table-quest', score: correctCount.current, totalQuestions: Math.max(attempts.current, 1), timeMs: Date.now() - startedAt.current })
    if (won) {
      recordBest('dragons-beaten', dragonsBeaten + 1)
      playFanfare()
    }
    setPhase(won ? 'won' : 'lost')
  }

  function start() {
    setFacts(makeFactSet(choice, ROOMS.length + 12, true))
    setIdx(0)
    setHearts(START_HEARTS)
    setDragonHp(DRAGON_HP)
    setFeedback(null)
    setWrongPick(null)
    correctCount.current = 0
    attempts.current = 0
    startedAt.current = Date.now()
    startActiveGame(topicId, 'times-table-quest')
    setPhase('rooms')
  }

  function damageHero() {
    const h = hearts - 1
    setHearts(h)
    if (h <= 0) setTimeout(() => finish(false), 900)
    return h
  }

  function dragonAttack() {
    playRoar()
    setFire(true)
    setTimeout(() => setFire(false), 800)
  }

  // Boss questions are timed — the dragon attacks if you're too slow
  useEffect(() => {
    if (!inBoss || feedback) return
    if (bossTime <= 0) {
      attempts.current++
      if (fact) recordFact(fact.key, false)
      recordActiveAnswer(false)
      dragonAttack()
      if (damageHero() > 0) {
        setIdx(i => i + 1)
        setBossTime(BOSS_SECS)
      }
      return
    }
    const id = setTimeout(() => setBossTime(t => t - 1), 1000)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inBoss, bossTime, feedback])

  function answer(opt: number) {
    if (!fact || feedback || hearts <= 0) return
    attempts.current++
    const correct = opt === fact.answer
    recordFact(fact.key, correct)
    recordActiveAnswer(correct)

    if (correct) {
      correctCount.current++
      setFeedback('correct')
      if (inBoss) {
        playHit()
        const hp = dragonHp - 1
        setDragonHp(hp)
        setTimeout(() => {
          setFeedback(null)
          if (hp <= 0) finish(true)
          else { setIdx(i => i + 1); setBossTime(BOSS_SECS) }
        }, 700)
      } else {
        playCorrect()
        setTimeout(() => {
          setFeedback(null)
          setWrongPick(null)
          if (idx + 1 >= ROOMS.length) { setPhase('boss'); setBossTime(BOSS_SECS); dragonAttack() }
          setIdx(i => i + 1)
        }, 700)
      }
    } else {
      setFeedback('wrong')
      setWrongPick(opt)
      if (inBoss) dragonAttack()
      else playWrong()
      const h = damageHero()
      setTimeout(() => {
        setFeedback(null)
        if (h > 0 && inBoss) { setIdx(i => i + 1); setBossTime(BOSS_SECS); setWrongPick(null) }
      }, 900)
    }
  }

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-5">
        <div className="text-7xl">🐉</div>
        <h2 className="text-white font-fredoka text-3xl">Dragon Quest!</h2>
        <p className="text-purple-200 max-w-xs">
          Answer times table questions to get through {ROOMS.length} castle rooms, then defeat the dragon guarding the treasure!
        </p>
        <p className="text-white/50 text-sm">You have {START_HEARTS} hearts ❤️ — be careful!</p>
        {dragonsBeaten > 0 && <p className="text-yellow-300 font-bold">⚔️ Dragons defeated: {dragonsBeaten}</p>}
        <TablePicker value={choice} onChange={setChoice} />
        <Button variant="gold" size="xl" onClick={start}>⚔️ Begin Quest!</Button>
      </div>
    )
  }

  if (phase === 'won' || phase === 'lost') {
    const won = phase === 'won'
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-4">
        {won && <Confetti />}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">
          {won ? '💰' : '🐉'}
        </motion.div>
        <h2 className="text-white font-fredoka text-3xl">{won ? 'Dragon defeated!' : 'The dragon won this time…'}</h2>
        <p className="text-purple-200">
          {won ? `${profile.name} found the treasure! 🎉` : 'Every hero needs practice — try again!'}
        </p>
        {won && <StarRating stars={hearts} size="lg" animate />}
        <p className="text-white/60 text-sm">{correctCount.current} right out of {attempts.current}</p>
        <div className="flex gap-3 mt-2">
          <Button variant="ghost" onClick={onComplete}>← Back</Button>
          <Button variant="gold" size="lg" onClick={start}>⚔️ {won ? 'New quest!' : 'Try again!'}</Button>
        </div>
      </div>
    )
  }

  if (!fact) return null
  const room = ROOMS[Math.min(idx, ROOMS.length - 1)]

  return (
    <div className="flex flex-col min-h-screen px-4 pt-16 pb-4 items-center">
      <div className="max-w-lg w-full flex items-center justify-between mb-3">
        <div className="text-2xl">
          {Array.from({ length: START_HEARTS }, (_, i) => (
            <span key={i} className={i < hearts ? '' : 'opacity-25'}>{i < hearts ? '❤️' : '🤍'}</span>
          ))}
        </div>
        {!inBoss && <div className="text-white/60 text-sm font-bold">Room {idx + 1}/{ROOMS.length}</div>}
        {inBoss && <div className={`font-black text-xl ${bossTime <= 3 ? 'text-red-400 animate-pulse' : 'text-white'}`}>⏱ {bossTime}</div>}
      </div>

      {!inBoss && (
        <div className="max-w-lg w-full flex gap-1 mb-4">
          {ROOMS.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${i < idx ? 'bg-green-400' : i === idx ? 'bg-purple-400' : 'bg-white/20'}`} />
          ))}
          <div className="w-6 h-2 rounded-full bg-red-500/60" />
        </div>
      )}

      {/* Scene */}
      <div className="relative max-w-lg w-full h-40 mb-4 flex items-end justify-between px-6">
        <motion.div
          animate={feedback === 'correct' ? { x: [0, 40, 0] } : feedback === 'wrong' ? { x: [0, -10, 10, -6, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="text-6xl"
        >
          {char.emoji}
        </motion.div>
        {inBoss ? (
          <div className="flex flex-col items-center">
            <div className="w-32 h-3 bg-white/10 rounded-full overflow-hidden mb-1 border border-white/20">
              <motion.div className="h-full bg-gradient-to-r from-red-500 to-orange-400" animate={{ width: `${(dragonHp / DRAGON_HP) * 100}%` }} />
            </div>
            <motion.div
              animate={feedback === 'correct' ? { x: [0, 12, -12, 8, 0], rotate: [0, -8, 8, 0] } : { y: [0, -6, 0] }}
              transition={feedback === 'correct' ? { duration: 0.4 } : { duration: 1.6, repeat: Infinity }}
              className="text-8xl"
            >
              🐉
            </motion.div>
            <AnimatePresence>
              {fire && (
                <motion.div
                  initial={{ x: 0, opacity: 0, scale: 0.5 }}
                  animate={{ x: -160, opacity: 1, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute bottom-10 right-28 text-5xl"
                >
                  🔥
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div key={idx} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="text-7xl">{room.emoji}</div>
            <div className="text-white/60 text-xs mt-1">{room.name}</div>
          </motion.div>
        )}
      </div>

      <motion.div
        key={`${phase}-${idx}`}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`max-w-sm w-full border-4 rounded-3xl px-8 py-5 text-center mb-4 ${
          feedback === 'correct' ? 'border-green-400 bg-green-500/20' :
          feedback === 'wrong' ? 'border-red-400 bg-red-500/20' :
          inBoss ? 'border-red-400/50 bg-white/10' : 'border-purple-400/50 bg-white/10'
        }`}
      >
        <div className="text-white/60 text-sm mb-1">{inBoss ? 'Attack the dragon!' : 'Open the door:'}</div>
        <div className="text-white font-fredoka text-5xl">{fact.label}</div>
      </motion.div>

      <div className="h-8 mb-1">
        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-xl font-black ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
            {feedback === 'correct'
              ? (inBoss ? '⚔️ Direct hit!' : '🚪 The door opens!')
              : (inBoss ? '🔥 Ouch! Dragon fire!' : '🛡️ Not quite — try again!')}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {fact.options.map(opt => (
          <motion.button
            key={`${phase}-${idx}-${opt}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => answer(opt)}
            disabled={opt === wrongPick}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className={`border-2 rounded-2xl py-4 text-white font-black text-2xl focus:outline-none ${
              opt === wrongPick ? 'bg-red-500/30 border-red-400/50 opacity-50' : 'bg-white/10 border-white/20'
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
