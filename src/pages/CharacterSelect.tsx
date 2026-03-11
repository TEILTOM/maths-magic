import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CHARACTERS } from '../data/characters'
import { YEARS } from '../data/curriculum'
import type { CharacterId } from '../data/characters'
import type { YearGroup } from '../data/curriculum'
import { useGameStore } from '../store/useGameStore'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function CharacterSelect() {
  const navigate = useNavigate()
  const createProfile = useGameStore(s => s.createProfile)

  const [step, setStep] = useState<'name' | 'character' | 'year'>('name')
  const [name, setName] = useState('')
  const [selectedChar, setSelectedChar] = useState<CharacterId>('sparkle')
  const [selectedYear, setSelectedYear] = useState<YearGroup>('year2')

  function handleStart() {
    if (!name.trim()) return
    createProfile(name.trim(), selectedChar, selectedYear)
    navigate('/dashboard')
  }

  const char = CHARACTERS.find(c => c.id === selectedChar)!

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 px-4 py-8 flex flex-col items-center">
      {/* Progress steps */}
      <div className="flex gap-2 mb-8">
        {(['name', 'character', 'year'] as const).map((s, i) => (
          <div key={s} className={`flex items-center gap-2`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
              step === s ? 'bg-purple-500 text-white' :
              ['name', 'character', 'year'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-white/20 text-white/50'
            }`}>
              {['name', 'character', 'year'].indexOf(step) > i ? '✓' : i + 1}
            </div>
            {i < 2 && <div className={`w-8 h-0.5 ${['name', 'character', 'year'].indexOf(step) > i ? 'bg-green-500' : 'bg-white/20'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Name */}
        {step === 'name' && (
          <motion.div key="name" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-md text-center">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-3xl font-fredoka text-white mb-2">What's your name?</h2>
            <p className="text-purple-200 mb-6">Your wizard name for the adventure!</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && setStep('character')}
              placeholder="Enter your name..."
              maxLength={20}
              autoFocus
              className="w-full bg-white/10 border-2 border-purple-400/50 rounded-2xl px-5 py-4 text-white text-xl font-bold text-center placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors mb-6"
            />
            <Button variant="gold" size="lg" fullWidth onClick={() => setStep('character')} disabled={!name.trim()}>
              Next →
            </Button>
          </motion.div>
        )}

        {/* STEP 2: Character */}
        {step === 'character' && (
          <motion.div key="char" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-lg text-center">
            <div className="text-5xl mb-2">{char.emoji}</div>
            <h2 className="text-3xl font-fredoka text-white mb-1">Choose your companion!</h2>
            <p className="text-purple-200 text-sm mb-5">They'll help you through every challenge</p>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {CHARACTERS.map(c => (
                <motion.button
                  key={c.id}
                  onClick={() => setSelectedChar(c.id)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                    selectedChar === c.id ? `border-white bg-white/20 scale-110` : 'border-white/20 bg-white/5 hover:border-white/50'
                  }`}
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="text-white text-xs font-bold mt-1">{c.name}</span>
                </motion.button>
              ))}
            </div>

            <Card className="mb-6 text-left">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{char.emoji}</span>
                <div>
                  <div className="text-white font-black text-lg">{char.name}</div>
                  <div className="text-white/70 text-sm">{char.personality}</div>
                  <div className="text-purple-300 text-xs mt-1 italic">"{char.greetings[0]}"</div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('name')}>← Back</Button>
              <Button variant="gold" size="lg" onClick={() => setStep('year')} className="flex-1">
                Choose Year →
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Year */}
        {step === 'year' && (
          <motion.div key="year" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-lg text-center">
            <div className="text-5xl mb-2">📚</div>
            <h2 className="text-3xl font-fredoka text-white mb-1">What year are you in?</h2>
            <p className="text-purple-200 text-sm mb-5">Don't worry — you can explore other years too!</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {YEARS.map(y => (
                <motion.button
                  key={y.id}
                  onClick={() => setSelectedYear(y.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedYear === y.id ? 'border-white bg-white/20' : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="text-2xl mb-1">{y.emoji}</div>
                  <div className="text-white font-black">{y.label}</div>
                  <div className="text-white/60 text-xs">{y.ageRange}</div>
                  <div className="text-white/50 text-xs mt-1">{y.description}</div>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('character')}>← Back</Button>
              <Button variant="gold" size="lg" onClick={handleStart} className="flex-1">
                {char.emoji} Start the Magic!
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
