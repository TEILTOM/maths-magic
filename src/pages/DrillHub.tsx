import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import { DRILL_LEVELS, TRICKY_ID, PASS_SCORE, isDrillPassed } from '../data/drillLevels'
import Button from '../components/ui/Button'

function formatTime(secs: number) {
  return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`
}

export default function DrillHub() {
  const navigate = useNavigate()
  const profile = useGameStore(s => s.profile)
  const records = profile?.drillRecords ?? {}
  const topicProgress = profile?.topicProgress ?? {}
  const trickyCount = Object.keys(profile?.factMisses ?? {}).length

  const passedFlags = DRILL_LEVELS.map(l => isDrillPassed(records[l.id], topicProgress[l.id]?.mastery ?? 0))
  const passedCount = passedFlags.filter(Boolean).length
  const currentIdx = passedFlags.findIndex(p => !p)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 pb-8">
      <div className="sticky top-0 z-20 bg-indigo-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>← Back</Button>
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl px-3 py-1.5">
            <span className="text-2xl">📋</span>
            <span className="text-white font-black">Drill Sheets</span>
          </div>
          <span className="text-yellow-300 text-sm font-black ml-auto">🏆 {passedCount}/{DRILL_LEVELS.length}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 text-center">
          <p className="text-white/70 text-sm">
            20 × and 20 ÷ questions against the clock. Score <span className="text-yellow-300 font-bold">{PASS_SCORE}/40</span> to unlock the next level!
          </p>
        </div>

        {/* Journey progress */}
        <div className="mb-4">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(passedCount / DRILL_LEVELS.length) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-white/50 text-xs mt-1 text-center">
            {passedCount === DRILL_LEVELS.length ? '👑 Tables Champion — every level passed!' : `${DRILL_LEVELS.length - passedCount} levels to go to become Tables Champion`}
          </p>
        </div>

        {trickyCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/game/${TRICKY_ID}/drill-sheet`)}
            className="w-full mb-4 rounded-2xl border-2 border-amber-400/50 bg-amber-500/15 p-4 flex items-center gap-4 text-left"
          >
            <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shrink-0">🎯</div>
            <div className="flex-1">
              <div className="text-white font-black text-sm">My Tricky Facts</div>
              <div className="text-amber-200/80 text-xs">{trickyCount} fact{trickyCount === 1 ? '' : 's'} to practise · no timer</div>
            </div>
            <div className="text-white/40">›</div>
          </motion.button>
        )}

        <div className="space-y-3">
          {DRILL_LEVELS.map((level, i) => {
            const unlocked = i === 0 || passedFlags[i - 1]
            const passed = passedFlags[i]
            const rec = records[level.id]
            const isNext = i === currentIdx

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: unlocked ? 1 : 0.4, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border p-4 flex items-center gap-4 ${
                  isNext
                    ? 'bg-white/15 border-yellow-400/60 ring-2 ring-yellow-400/30 cursor-pointer'
                    : unlocked
                      ? 'bg-white/10 border-white/20 cursor-pointer hover:bg-white/15'
                      : 'bg-white/5 border-white/10 cursor-not-allowed'
                }`}
                onClick={() => unlocked && navigate(`/game/${level.id}/drill-sheet`)}
              >
                <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${level.color} shrink-0`}>
                  {unlocked ? level.emoji : '🔒'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-black text-sm">{level.label}</span>
                    {passed && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5">✓ Passed</span>}
                    {isNext && <span className="text-xs bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 rounded-full px-2 py-0.5">Up next</span>}
                  </div>
                  {rec ? (
                    <p className="text-white/50 text-xs mt-1">
                      ⭐ Best {rec.bestScore}/40
                      {rec.bestPassSecs != null && <> · ⚡ {formatTime(rec.bestPassSecs)}</>}
                      {' '}· {rec.attempts} {rec.attempts === 1 ? 'go' : 'goes'}
                    </p>
                  ) : unlocked ? (
                    <p className="text-white/40 text-xs mt-1">Not tried yet</p>
                  ) : (
                    <p className="text-white/30 text-xs mt-0.5">Pass {DRILL_LEVELS[i - 1]?.label} first</p>
                  )}
                </div>

                {unlocked && <div className="text-white/40 shrink-0">›</div>}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
