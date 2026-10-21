import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import type { TopicId } from '../data/curriculum'
import Button from '../components/ui/Button'
import Confetti from '../components/Confetti'
import StarRating from '../components/ui/StarRating'
import TablePicker from '../components/TablePicker'
import { makeFactSet, useSuggestedTable, type Fact, type TableChoice } from '../utils/timesFacts'
import { playCorrect, playWrong, playFanfare } from '../utils/sound'

interface Props { topicId: TopicId; onComplete: () => void }

export const PICTURES = [
  { emoji: '🦄', name: 'Unicorn' }, { emoji: '🐉', name: 'Dragon' }, { emoji: '🦊', name: 'Fox' },
  { emoji: '🐼', name: 'Panda' }, { emoji: '🦁', name: 'Lion' }, { emoji: '🐙', name: 'Octopus' },
  { emoji: '🦋', name: 'Butterfly' }, { emoji: '🐬', name: 'Dolphin' }, { emoji: '🦉', name: 'Owl' },
  { emoji: '🐢', name: 'Turtle' }, { emoji: '🦒', name: 'Giraffe' }, { emoji: '🐧', name: 'Penguin' },
  { emoji: '🦜', name: 'Parrot' }, { emoji: '🐨', name: 'Koala' }, { emoji: '🐝', name: 'Bee' },
  { emoji: '🦩', name: 'Flamingo' }, { emoji: '🐳', name: 'Whale' }, { emoji: '🦔', name: 'Hedgehog' },
  { emoji: '🐸', name: 'Frog' }, { emoji: '🐯', name: 'Tiger' }, { emoji: '🦥', name: 'Sloth' },
  { emoji: '🐰', name: 'Bunny' }, { emoji: '🦖', name: 'T-Rex' }, { emoji: '🐱', name: 'Kitten' },
]
const TILES = 16

export default function MysteryPicture({ topicId, onComplete }: Props) {
  const completeGame = useGameStore(s => s.completeGame)
  const startActiveGame = useGameStore(s => s.startActiveGame)
  const recordActiveAnswer = useGameStore(s => s.recordActiveAnswer)
  const recordFact = useGameStore(s => s.recordFact)
  const addToCollection = useGameStore(s => s.addToCollection)
  const collection = useGameStore(s => s.profile?.collection ?? [])

  const suggested = useSuggestedTable()
  const [choice, setChoice] = useState<TableChoice>(suggested)
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready')
  const [picture, setPicture] = useState(PICTURES[0])
  const [facts, setFacts] = useState<Fact[]>([])
  const [revealed, setRevealed] = useState<boolean[]>([])
  const [selected, setSelected] = useState(0)
  const [shake, setShake] = useState<number | null>(null)
  const [wrongPicks, setWrongPicks] = useState<number[]>([])
  const [isNewSticker, setIsNewSticker] = useState(false)
  const mistakes = useRef(0)
  const startedAt = useRef(0)

  function start() {
    const unseen = PICTURES.filter(p => !collection.includes(p.emoji))
    const pool = unseen.length ? unseen : PICTURES
    const pic = pool[Math.floor(Math.random() * pool.length)]
    setPicture(pic)
    setIsNewSticker(!collection.includes(pic.emoji))
    setFacts(makeFactSet(choice, TILES, true))
    setRevealed(Array(TILES).fill(false))
    setSelected(Math.floor(Math.random() * TILES))
    setWrongPicks([])
    mistakes.current = 0
    startedAt.current = Date.now()
    startActiveGame(topicId, 'mystery-picture')
    setPhase('playing')
  }

  function pickNext(rev: boolean[], from: number) {
    const left = rev.map((r, i) => (r ? -1 : i)).filter(i => i >= 0 && i !== from)
    return left.length ? left[Math.floor(Math.random() * left.length)] : -1
  }

  function answer(opt: number) {
    const f = facts[selected]
    if (!f || revealed[selected]) return
    const correct = opt === f.answer
    recordFact(f.key, correct)
    recordActiveAnswer(correct)
    if (!correct) {
      playWrong()
      mistakes.current++
      setWrongPicks(w => [...w, opt])
      setShake(selected)
      setTimeout(() => setShake(null), 400)
      return
    }
    playCorrect()
    const rev = [...revealed]
    rev[selected] = true
    setRevealed(rev)
    setWrongPicks([])
    const next = pickNext(rev, selected)
    if (next === -1) {
      completeGame({ topicId, gameType: 'mystery-picture', score: TILES, totalQuestions: TILES + mistakes.current, timeMs: Date.now() - startedAt.current })
      addToCollection(picture.emoji)
      setTimeout(() => { playFanfare(); setPhase('done') }, 600)
    } else {
      setSelected(next)
    }
  }

  const collectionStrip = (
    <div className="max-w-sm w-full bg-white/5 border border-white/10 rounded-2xl p-3">
      <p className="text-white/60 text-xs mb-2">Sticker collection: {collection.length}/{PICTURES.length}</p>
      <div className="flex flex-wrap gap-1 justify-center">
        {PICTURES.map(p => (
          <span key={p.emoji} className={`text-2xl ${collection.includes(p.emoji) ? '' : 'opacity-20 grayscale'}`}>
            {collection.includes(p.emoji) ? p.emoji : '❔'}
          </span>
        ))}
      </div>
    </div>
  )

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center gap-5">
        <div className="text-7xl">🖼️</div>
        <h2 className="text-white font-fredoka text-3xl">Mystery Picture!</h2>
        <p className="text-purple-200 max-w-xs">An animal is hiding behind the tiles. Answer each tile's question to uncover it and win the sticker!</p>
        <TablePicker value={choice} onChange={setChoice} />
        <Button variant="gold" size="xl" onClick={start}>🔍 Find the mystery animal!</Button>
        {collectionStrip}
      </div>
    )
  }

  if (phase === 'done') {
    const stars = mistakes.current === 0 ? 3 : mistakes.current <= 3 ? 2 : 1
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center gap-4">
        <Confetti />
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }} className="text-[9rem] leading-none">
          {picture.emoji}
        </motion.div>
        <h2 className="text-white font-fredoka text-3xl">You found the {picture.name}!</h2>
        {isNewSticker && <p className="text-yellow-300 font-bold">✨ New sticker for your collection!</p>}
        <StarRating stars={stars} size="lg" animate />
        <p className="text-white/60 text-sm">{mistakes.current === 0 ? 'No mistakes — perfect!' : `${mistakes.current} mistake${mistakes.current === 1 ? '' : 's'}`}</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onComplete}>← Back</Button>
          <Button variant="gold" size="lg" onClick={start}>🔍 Another one!</Button>
        </div>
        {collectionStrip}
      </div>
    )
  }

  const f = facts[selected]

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen px-4 pt-16 pb-6 gap-6">
      <div className="relative w-full max-w-[min(90vw,62vh)] aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-sky-200 to-pink-200 border-4 border-white/30">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <text x="50" y="56" fontSize="78" textAnchor="middle" dominantBaseline="middle">{picture.emoji}</text>
        </svg>
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5">
          {facts.map((fact, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => { if (!revealed[i] && i !== selected) { setSelected(i); setWrongPicks([]) } }}
              animate={
                revealed[i] ? { rotateY: 90, opacity: 0 } :
                shake === i ? { x: [0, -8, 8, -5, 0] } : { rotateY: 0, opacity: 1 }
              }
              transition={{ duration: revealed[i] ? 0.4 : 0.3 }}
              style={{ WebkitTapHighlightColor: 'transparent', pointerEvents: revealed[i] ? 'none' : 'auto' }}
              className={`rounded-lg flex items-center justify-center font-black text-white text-sm sm:text-lg focus:outline-none ${
                selected === i
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 ring-4 ring-yellow-200 z-10'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-700'
              }`}
            >
              {fact.label.replace(/ /g, '')}
            </motion.button>
          ))}
        </div>
      </div>

      {f && (
        <div className="w-full max-w-xs flex flex-col items-center gap-3">
          <p className="text-white/60 text-sm">{revealed.filter(Boolean).length}/{TILES} tiles uncovered</p>
          <motion.div
            key={selected}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-white/10 border-2 border-yellow-400/50 rounded-2xl py-5 text-center"
          >
            <span className="text-white font-fredoka text-4xl">{f.label} = ?</span>
          </motion.div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {f.options.map(opt => {
              const wrong = wrongPicks.includes(opt)
              return (
                <motion.button
                  key={`${selected}-${opt}`}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => answer(opt)}
                  disabled={wrong}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  className={`h-16 border-2 rounded-xl text-white font-black text-2xl focus:outline-none ${
                    wrong ? 'bg-red-500/30 border-red-400/40 opacity-40' : 'bg-white/10 border-white/20'
                  }`}
                >
                  {opt}
                </motion.button>
              )
            })}
          </div>
          <p className="text-white/40 text-xs">Tip: tap any tile to choose a different question</p>
        </div>
      )}
    </div>
  )
}
