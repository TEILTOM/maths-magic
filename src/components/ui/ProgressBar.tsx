import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  color?: string
  showLabel?: boolean
  label?: string
  height?: string
  animate?: boolean
}

export default function ProgressBar({
  value, max = 100, color = 'from-purple-400 to-pink-500',
  showLabel = false, label, height = 'h-3', animate = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-white/70 mb-1 font-semibold">
          <span>{label ?? 'Progress'}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${height}`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={animate ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
