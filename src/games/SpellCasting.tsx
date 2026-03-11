import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { generateQuestion, type Question } from '../utils/questionGenerator'
import type { TopicId, Difficulty } from '../data/curriculum'
import { getCharacter } from '../data/characters'
import Character from '../components/Character'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'
import StarRating from '../components/ui/StarRating'

interface Props { topicId: TopicId; difficulty: Difficulty; onComplete: () => void }

const TOTAL_QUESTIONS = 10
const TIME_PER_QUESTION = 15

export default function SpellCasting({ topicId, difficulty, onComplete }: Props) {
  const profile = useGameStore(s => s.profile)!
  const completeGame = useGameStore(s => s.completeGame)
  const unlockAchievement = useGameStore(s => s.unlockAchievement)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)
  const char = getCharacter(profile.characterId)

  const [phase, setPhase] = useState<'ready' | 'playing' | 'feedback' | 'results'>('ready')
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [charMessage, setCharMessage] = useState<{ text: string; type: 'correct' | 'incorrect' | 'greeting' }>({ text: '', type: 'greeting' })
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const generateQuestions = useCallback(() => {
    const qs = Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion(topicId, difficulty))
    setQuestions(qs)
  }, [topicId, difficulty])

  useEffect(() => { generateQuestions() }, [generateQuestions])

  useEffect(() => {
    if (phase !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleAnswer(-1) // time out
          return TIME_PER_QUESTION
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, current])

  function handleAnswer(optionIndex: number) {
    if (selectedOption !== null) return
    if (timerRef.current) clearInterval(timerRef.current)

    const q = questions[current]
    const correct = optionIndex === q.correctIndex
    setSelectedOption(optionIndex)
    setIsCorrect(correct)

    if (correct) {
      setScore(s => s + 1)
      setCharMessage({ text: char.correctMessages[Math.floor(Math.random() * char.correctMessages.length)], type: 'correct' })
    } else {
      setCharMessage({ text: char.incorrectMessages[Math.floor(Math.random() * char.incorrectMessages.length)], type: 'incorrect' })
    }
    // Keep localStorage in sync after every answer — survives swipe-up kills
    recordActiveAnswer(correct)

    setPhase('feedback')
    setTimeout(() => {
      setSelectedOption(null)
      setIsCorrect(null)
      setTimeLeft(TIME_PER_QUESTION)
      if (current + 1 >= TOTAL_QUESTIONS) {
        finishGame(correct ? score + 1 : score)
      } else {
        setCurrent(c => c + 1)
        setPhase('playing')
      }
    }, 1200)
  }

  function finishGame(finalScore: number) {
    const elapsed = Date.now() - startTimeRef.current
    completeGame({ topicId, gameType: 'spell-casting', score: finalScore, totalQuestions: TOTAL_QUESTIONS, timeMs: elapsed })
    if (finalScore === TOTAL_QUESTIONS) unlockAchievement('perfect-game')
    if (profile.gamesPlayedTotal === 0) unlockAchievement('first-spell')
    setPhase('results')
  }

  function startGame() {
    startTimeRef.current = Date.now()
    startActiveGame(topicId, 'spell-casting') // register session in localStorage immediately
    setPhase('playing')
  }

  const currentQ = questions[current]
  const accuracy = score / Math.max(current + (phase === 'results' ? 0 : 1), 1)
  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <Character characterId={profile.characterId} messageType="greeting" size="lg" />
        <h2 className="text-white font-fredoka text-3xl mt-6 mb-2">Spell Casting!</h2>
        <p className="text-purple-200 mb-2">Answer {TOTAL_QUESTIONS} questions as fast as you can!</p>
        <p className="text-white/50 text-sm mb-6">You have {TIME_PER_QUESTION} seconds per question. Difficulty: <span className="text-purple-300 font-bold capitalize">{difficulty}</span></p>
        <Button variant="gold" size="xl" onClick={startGame}>⚡ Cast Your First Spell!</Button>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {stars === 3 && <Confetti />}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-7xl mb-4">
          {stars === 3 ? '🏆' : stars === 2 ? '🌟' : stars === 1 ? '⭐' : '💪'}
        </motion.div>
        <h2 className="text-white font-fredoka text-3xl mb-2">
          {score >= 8 ? 'Brilliant!' : score >= 6 ? 'Well Done!' : score >= 4 ? 'Good Try!' : 'Keep Practising!'}
        </h2>
        <div className="text-5xl font-black text-white mb-2">{score}/{TOTAL_QUESTIONS}</div>
        <StarRating stars={stars} size="lg" animate />
        <div className="mt-4 text-white/60 text-sm">{Math.round(accuracy * 100)}% accuracy</div>
        <Character characterId={profile.characterId} messageType={score >= 7 ? 'correct' : 'incorrect'} size="md" showBubble />
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={onComplete}>← Back</Button>
          <Button variant="gold" size="lg" onClick={() => {
            generateQuestions(); setCurrent(0); setScore(0); setPhase('ready')
          }}>
            ⚡ Play Again!
          </Button>
        </div>
      </div>
    )
  }

  if (!currentQ) return null

  return (
    <div className="flex flex-col min-h-screen px-4 pt-16 pb-4">
      {/* Progress */}
      <div className="max-w-lg mx-auto w-full mb-4">
        <div className="flex justify-between text-white/60 text-sm mb-1">
          <span>Question {current + 1}/{TOTAL_QUESTIONS}</span>
          <span>Score: {score}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-purple-400 h-2 rounded-full transition-all" style={{ width: `${(current / TOTAL_QUESTIONS) * 100}%` }} />
        </div>
      </div>

      {/* Timer */}
      <div className="max-w-lg mx-auto w-full mb-4">
        <div className={`text-center text-4xl font-black transition-colors ${timeLeft <= 5 ? 'text-red-400 animate-bounce' : 'text-white'}`}>
          {timeLeft}s
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 mt-1">
          <div
            className={`h-3 rounded-full transition-all ${timeLeft <= 5 ? 'bg-red-500' : 'bg-green-400'}`}
            style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-lg mx-auto w-full"
        >
          <div className="bg-white/10 border border-white/20 rounded-3xl p-6 mb-4 text-center min-h-[100px] flex items-center justify-center">
            <p className="text-white font-black text-2xl whitespace-pre-line">{currentQ.question}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => {
              let bgClass = 'bg-white/10 hover:bg-white/20 border-white/20'
              if (phase === 'feedback') {
                if (i === currentQ.correctIndex) bgClass = 'bg-green-500/40 border-green-400'
                else if (i === selectedOption && !isCorrect) bgClass = 'bg-red-500/40 border-red-400'
                else bgClass = 'bg-white/5 border-white/10'
              }
              return (
                <motion.button
                  key={i}
                  whileTap={phase === 'playing' ? { scale: 0.95 } : {}}
                  onClick={() => phase === 'playing' && handleAnswer(i)}
                  className={`${bgClass} border-2 rounded-2xl p-4 text-white font-black text-xl text-center transition-colors`}
                >
                  {opt}
                </motion.button>
              )
            })}
          </div>

          {phase === 'feedback' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-3 rounded-2xl p-3 text-center font-bold text-sm ${isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
            >
              {isCorrect ? '✅ Correct!' : `❌ Answer: ${currentQ.options[currentQ.correctIndex]}`}
              {currentQ.explanation && !isCorrect && <div className="text-white/60 text-xs mt-1">{currentQ.explanation}</div>}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Character hint */}
      {phase === 'feedback' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto w-full mt-4">
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3">
            <span className="text-2xl">{char.emoji}</span>
            <p className="text-white/70 text-xs">{charMessage.text}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
