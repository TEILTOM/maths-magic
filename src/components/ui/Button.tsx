import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'gold'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  type?: 'button' | 'submit'
}

const variants = {
  primary: 'bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white border-b-4 border-purple-900 shadow-lg',
  secondary: 'bg-gradient-to-b from-slate-500 to-slate-700 hover:from-slate-400 hover:to-slate-600 text-white border-b-4 border-slate-900 shadow-lg',
  success: 'bg-gradient-to-b from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white border-b-4 border-green-800 shadow-lg',
  danger: 'bg-gradient-to-b from-red-400 to-red-600 hover:from-red-300 hover:to-red-500 text-white border-b-4 border-red-800 shadow-lg',
  ghost: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow',
  gold: 'bg-gradient-to-b from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-amber-900 border-b-4 border-amber-700 shadow-lg font-black',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-base rounded-2xl',
  lg: 'px-7 py-3.5 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-3xl',
}

export default function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, fullWidth = false, className = '', type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.95, y: 2 }}
      whileHover={disabled ? {} : { scale: 1.03 }}
      className={`
        font-bold font-nunito select-none cursor-pointer transition-colors
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
