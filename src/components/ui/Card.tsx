import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  glow?: boolean
  variant?: 'default' | 'dark' | 'glass'
}

const variants = {
  default: 'bg-white/10 backdrop-blur-sm border border-white/20',
  dark: 'bg-magic-night-mid/80 backdrop-blur-sm border border-white/10',
  glass: 'bg-white/5 backdrop-blur-md border border-white/15',
}

export default function Card({ children, className = '', onClick, glow, variant = 'default' }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`
        rounded-2xl p-4 shadow-xl
        ${variants[variant]}
        ${glow ? 'glow-purple' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
