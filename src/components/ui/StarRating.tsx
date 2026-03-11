import { motion } from 'framer-motion'

interface StarRatingProps {
  stars: number // 0-3
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }

export default function StarRating({ stars, maxStars = 3, size = 'md', animate = false }: StarRatingProps) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: maxStars }, (_, i) => (
        <motion.span
          key={i}
          className={sizes[size]}
          initial={animate ? { scale: 0, rotate: -30 } : {}}
          animate={animate ? { scale: 1, rotate: 0 } : {}}
          transition={animate ? { delay: i * 0.2, type: 'spring', stiffness: 300 } : {}}
        >
          {i < stars ? '⭐' : '☆'}
        </motion.span>
      ))}
    </div>
  )
}
