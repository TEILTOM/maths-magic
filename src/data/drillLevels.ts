export const DRILL_TIME = 105 // 1 min 45 sec total (both × and ÷)
export const DRILL_QUESTIONS = 20 // per phase

export interface DrillLevel {
  table: number | 'squares'
  id: string
  label: string
  emoji: string
  nextLabel: string
  color: string
}

// School progression order: 10, 2, 5, 4, 3, 6, 7, 8, 9, squares
export const DRILL_LEVELS: DrillLevel[] = [
  { table: 10, id: 'drill-x10', label: '×10 and ÷10', emoji: '🔟', nextLabel: '×2', color: 'from-emerald-500 to-teal-600' },
  { table: 2,  id: 'drill-x2',  label: '×2 and ÷2',  emoji: '✌️', nextLabel: '×5', color: 'from-blue-500 to-cyan-600' },
  { table: 5,  id: 'drill-x5',  label: '×5 and ÷5',  emoji: '🖐️', nextLabel: '×4', color: 'from-violet-500 to-purple-600' },
  { table: 4,  id: 'drill-x4',  label: '×4 and ÷4',  emoji: '🍀', nextLabel: '×3', color: 'from-pink-500 to-rose-600' },
  { table: 3,  id: 'drill-x3',  label: '×3 and ÷3',  emoji: '🔺', nextLabel: '×6', color: 'from-orange-500 to-amber-600' },
  { table: 6,  id: 'drill-x6',  label: '×6 and ÷6',  emoji: '🎲', nextLabel: '×7', color: 'from-red-500 to-orange-600' },
  { table: 7,  id: 'drill-x7',  label: '×7 and ÷7',  emoji: '🌈', nextLabel: '×8', color: 'from-indigo-500 to-violet-600' },
  { table: 8,  id: 'drill-x8',  label: '×8 and ÷8',  emoji: '🕸️', nextLabel: '×9', color: 'from-cyan-500 to-blue-600' },
  { table: 9,  id: 'drill-x9',  label: '×9 and ÷9',  emoji: '🌙', nextLabel: 'Squares!', color: 'from-purple-500 to-indigo-600' },
  { table: 'squares', id: 'drill-squares', label: 'Squares & √Roots', emoji: '💎', nextLabel: 'Champion!', color: 'from-yellow-400 to-amber-500' },
]

export function getDrillLevel(id: string): DrillLevel | undefined {
  return DRILL_LEVELS.find(l => l.id === id)
}
