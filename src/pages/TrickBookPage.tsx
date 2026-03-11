import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { MATH_TRICKS } from '../data/mathTricks'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function TrickBookPage() {
  const navigate = useNavigate()
  const viewedTricks = useGameStore(s => s.profile?.viewedTricks ?? [])
  const markTrickViewed = useGameStore(s => s.markTrickViewed)
  const [selectedTrick, setSelectedTrick] = useState<string | null>(null)
  const [tryItAnswer, setTryItAnswer] = useState('')
  const [tryResult, setTryResult] = useState<'correct' | 'incorrect' | null>(null)

  function openTrick(id: string) {
    setSelectedTrick(id)
    setTryItAnswer('')
    setTryResult(null)
    markTrickViewed(id)
  }

  function checkAnswer(trick: typeof MATH_TRICKS[0]) {
    const answer = parseInt(tryItAnswer, 10)
    if (answer === trick.tryItAnswer) {
      setTryResult('correct')
    } else {
      setTryResult('incorrect')
    }
  }

  const trick = MATH_TRICKS.find(t => t.id === selectedTrick)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 pb-8">
      <div className="sticky top-0 z-20 bg-indigo-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => selectedTrick ? setSelectedTrick(null) : navigate('/dashboard')}>
            ← {selectedTrick ? 'All Tricks' : 'Back'}
          </Button>
          <h1 className="text-white font-fredoka text-xl">🎩 Trick Book</h1>
          <span className="ml-auto text-white/50 text-sm">{viewedTricks.length}/{MATH_TRICKS.length} found</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          {!trick ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-purple-200 text-sm mb-4 text-center">
                🧙 Discover secret maths shortcuts that even some teachers don't know!
              </p>
              <div className="grid grid-cols-1 gap-3">
                {MATH_TRICKS.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card onClick={() => openTrick(t.id)} className="cursor-pointer hover:border-white/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{t.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-black">{t.title}</span>
                            {viewedTricks.includes(t.id) && <span className="text-green-400 text-xs">✓ Viewed</span>}
                          </div>
                          <div className="text-white/60 text-xs">{t.tagline}</div>
                          <div className="text-white/40 text-xs mt-0.5">From {t.yearFrom}</div>
                        </div>
                        <div className="text-white/30">›</div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key={trick.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Trick header */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">{trick.emoji}</div>
                <h2 className="text-white font-fredoka text-3xl">{trick.title}</h2>
                <p className="text-purple-200 font-semibold">{trick.tagline}</p>
                <span className="text-white/40 text-xs">From {trick.yearFrom} • {trick.category}</span>
              </div>

              {/* Steps */}
              <Card className="mb-4">
                <h3 className="text-white font-black mb-3">📋 How it works:</h3>
                <ol className="space-y-2">
                  {trick.steps.map((step, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-white/80 text-sm">{step}</span>
                    </motion.li>
                  ))}
                </ol>
              </Card>

              {/* Example */}
              <Card className="mb-4 border-yellow-400/30">
                <h3 className="text-yellow-400 font-black mb-3">✏️ Example: {trick.example.problem}</h3>
                <div className="space-y-1">
                  {trick.example.workingOut.map((line, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-white/40">→</span>
                      <span className="text-white/80">{line}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-green-500/20 border border-green-400/30 rounded-xl p-2 text-center">
                  <span className="text-green-400 font-black">Answer: {trick.example.answer}</span>
                </div>
              </Card>

              {/* Tip */}
              <Card className="mb-4 border-blue-400/30 bg-blue-500/10">
                <div className="flex gap-2">
                  <span className="text-xl">💡</span>
                  <p className="text-blue-200 text-sm">{trick.tip}</p>
                </div>
              </Card>

              {/* Try it! */}
              <Card className="mb-4 border-pink-400/40 bg-pink-500/10">
                <h3 className="text-pink-300 font-black mb-2">🎯 Try it yourself!</h3>
                <p className="text-white text-lg font-bold mb-3">{trick.tryItQuestion}</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={tryItAnswer}
                    onChange={e => { setTryItAnswer(e.target.value); setTryResult(null) }}
                    onKeyDown={e => e.key === 'Enter' && tryItAnswer && checkAnswer(trick)}
                    placeholder="Your answer..."
                    className="flex-1 bg-white/10 border-2 border-pink-400/40 rounded-xl px-4 py-2 text-white font-black text-xl text-center focus:outline-none focus:border-pink-400"
                  />
                  <Button variant="primary" onClick={() => tryItAnswer && checkAnswer(trick)}>Check!</Button>
                </div>
                <AnimatePresence>
                  {tryResult && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`mt-3 rounded-xl p-3 text-center font-black ${
                        tryResult === 'correct' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
                      }`}
                    >
                      {tryResult === 'correct' ? '🎉 Correct! You\'ve got the trick!' : `❌ Not quite! The answer is ${trick.tryItAnswer} — try the trick again!`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
