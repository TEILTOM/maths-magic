import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import SpellCasting from '../games/SpellCasting'
import NumberBondsPotion from '../games/NumberBondsPotion'
import TimesTableQuest from '../games/TimesTableQuest'
import FractionFeast from '../games/FractionFeast'
import MemoryCrystal from '../games/MemoryCrystal'
import MagicMarket from '../games/MagicMarket'
import Button from '../components/ui/Button'
import { getDifficultyForMastery } from '../utils/questionGenerator'

export default function GamePage() {
  const { topicId, gameType } = useParams<{ topicId: string; gameType: string }>()
  const navigate = useNavigate()
  const profile = useGameStore(s => s.profile)!
  const getTopicMastery = useGameStore(s => s.getTopicMastery)

  const topic = topicId ?? 'y2-add-sub'
  const game = gameType ?? 'spell-casting'
  const mastery = getTopicMastery(topic)
  const difficulty = getDifficultyForMastery(mastery)

  const commonProps = { topicId: topic, difficulty, onComplete: () => navigate(-1) }

  function renderGame() {
    switch (game) {
      case 'spell-casting': return <SpellCasting {...commonProps} />
      case 'number-bonds-potion': return <NumberBondsPotion {...commonProps} />
      case 'times-table-quest': return <TimesTableQuest {...commonProps} />
      case 'fraction-feast': return <FractionFeast {...commonProps} />
      case 'memory-crystal': return <MemoryCrystal {...commonProps} />
      case 'magic-market': return <MagicMarket {...commonProps} />
      default: return <SpellCasting {...commonProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950">
      <div className="absolute top-3 left-3 z-20">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>✕ Exit</Button>
      </div>
      {renderGame()}
    </div>
  )
}
