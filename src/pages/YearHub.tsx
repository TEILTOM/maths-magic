import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { getTopicsForYear, getYearData, type YearGroup } from '../data/curriculum'
import { getCharacter } from '../data/characters'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import StarRating from '../components/ui/StarRating'

const GAME_OPTIONS = [
  { id: 'spell-casting', label: 'Spell Casting', emoji: '⚡' },
  { id: 'number-bonds-potion', label: 'Potion Lab', emoji: '🧪' },
  { id: 'memory-crystal', label: 'Memory Crystals', emoji: '💎' },
  { id: 'times-table-quest', label: 'Times Quest', emoji: '🗺️' },
  { id: 'fraction-feast', label: 'Fraction Feast', emoji: '🍕' },
  { id: 'magic-market', label: 'Magic Market', emoji: '🛒' },
]

export default function YearHub() {
  const { yearId } = useParams<{ yearId: string }>()
  const navigate = useNavigate()
  const profile = useGameStore(s => s.profile)!
  const getTopicMastery = useGameStore(s => s.getTopicMastery)
  const setCurrentTopic = useGameStore(s => s.setCurrentTopic)

  const yearGroup = (yearId ?? 'year2') as YearGroup
  const yearData = getYearData(yearGroup)
  const topics = getTopicsForYear(yearGroup)
  const char = getCharacter(profile.characterId)

  function handlePlayTopic(topicId: string, gameType: string) {
    setCurrentTopic(topicId, gameType)
    navigate(`/game/${topicId}/${gameType}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-indigo-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>← Back</Button>
          <div className={`flex items-center gap-2 bg-gradient-to-r ${yearData.bgGradient} rounded-xl px-3 py-1.5`}>
            <span className="text-2xl">{yearData.emoji}</span>
            <span className="text-white font-black">{yearData.label}</span>
          </div>
          <span className="text-white/50 text-sm ml-auto">{yearData.ageRange}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        {/* Character hint */}
        <div className="flex items-center gap-3 mb-5 bg-white/5 rounded-2xl p-3 border border-white/10">
          <span className="text-4xl">{char.emoji}</span>
          <p className="text-white/80 text-sm font-semibold">
            Choose a topic below and pick how you want to practice it! You can play the same topic in lots of different ways. 🎮
          </p>
        </div>

        {/* Topics */}
        <h2 className="text-white font-fredoka text-xl mb-3">📖 Topics to Master</h2>

        <div className="space-y-3">
          {topics.map((topic, i) => {
            const mastery = getTopicMastery(topic.id)
            const progress = profile.topicProgress[topic.id]
            const stars = progress?.stars ?? 0

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-3xl">{topic.emoji}</span>
                      <div className="flex-1">
                        <div className="text-white font-black">{topic.name}</div>
                        <div className="text-white/60 text-xs">{topic.description}</div>
                        {stars > 0 && <StarRating stars={stars} size="sm" />}
                      </div>
                    </div>
                    <div className="text-right">
                      {mastery > 0 && (
                        <div className="text-white/60 text-xs mb-1">{mastery}%</div>
                      )}
                    </div>
                  </div>

                  {mastery > 0 && (
                    <div className="mb-3">
                      <ProgressBar value={mastery} height="h-1.5" color="from-purple-400 to-pink-500" />
                    </div>
                  )}

                  {/* Game type buttons */}
                  <div className="flex flex-wrap gap-2">
                    {GAME_OPTIONS.filter(g => topic.gameTypes.includes(g.id)).map(game => (
                      <button
                        key={game.id}
                        onClick={() => handlePlayTopic(topic.id, game.id)}
                        className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-white/15 transition-colors"
                      >
                        <span>{game.emoji}</span>
                        <span>{game.label}</span>
                      </button>
                    ))}
                    {/* Always available */}
                    {!topic.gameTypes.includes('spell-casting') && (
                      <button
                        onClick={() => handlePlayTopic(topic.id, 'spell-casting')}
                        className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-white/15 transition-colors"
                      >
                        <span>⚡</span><span>Quick Quiz</span>
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
