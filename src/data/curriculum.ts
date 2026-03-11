export type YearGroup = 'reception' | 'year1' | 'year2' | 'year3' | 'year4' | 'year5' | 'year6'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'challenge'
export type TopicId = string

export interface Topic {
  id: TopicId
  name: string
  emoji: string
  description: string
  yearGroup: YearGroup
  gameTypes: string[]
  color: string
}

export interface YearData {
  id: YearGroup
  label: string
  emoji: string
  ageRange: string
  color: string
  bgGradient: string
  description: string
  unlockRequirement?: { yearGroup: YearGroup; minMastery: number }
}

export const YEARS: YearData[] = [
  {
    id: 'reception',
    label: 'Reception',
    emoji: '🌱',
    ageRange: 'Age 4-5',
    color: '#22c55e',
    bgGradient: 'from-green-400 to-emerald-500',
    description: 'Numbers 1-10, shapes, and counting!',
  },
  {
    id: 'year1',
    label: 'Year 1',
    emoji: '⭐',
    ageRange: 'Age 5-6',
    color: '#f59e0b',
    bgGradient: 'from-yellow-400 to-amber-500',
    description: 'Numbers to 20, adding and shapes!',
    unlockRequirement: { yearGroup: 'reception', minMastery: 50 },
  },
  {
    id: 'year2',
    label: 'Year 2',
    emoji: '🌟',
    ageRange: 'Age 6-7',
    color: '#3b82f6',
    bgGradient: 'from-blue-400 to-cyan-500',
    description: 'Numbers to 100, times tables 2, 5, 10!',
    unlockRequirement: { yearGroup: 'year1', minMastery: 50 },
  },
  {
    id: 'year3',
    label: 'Year 3',
    emoji: '🔮',
    ageRange: 'Age 7-8',
    color: '#8b5cf6',
    bgGradient: 'from-violet-500 to-purple-600',
    description: 'Numbers to 1000, fractions, money!',
    unlockRequirement: { yearGroup: 'year2', minMastery: 60 },
  },
  {
    id: 'year4',
    label: 'Year 4',
    emoji: '⚡',
    ageRange: 'Age 8-9',
    color: '#ec4899',
    bgGradient: 'from-pink-500 to-rose-600',
    description: 'All times tables, decimals, area!',
    unlockRequirement: { yearGroup: 'year3', minMastery: 60 },
  },
  {
    id: 'year5',
    label: 'Year 5',
    emoji: '🌙',
    ageRange: 'Age 9-10',
    color: '#14b8a6',
    bgGradient: 'from-teal-500 to-cyan-600',
    description: 'Big numbers, percentages, angles!',
    unlockRequirement: { yearGroup: 'year4', minMastery: 60 },
  },
  {
    id: 'year6',
    label: 'Year 6',
    emoji: '🏆',
    ageRange: 'Age 10-11',
    color: '#f97316',
    bgGradient: 'from-orange-500 to-red-600',
    description: 'Algebra, ratio, complex geometry!',
    unlockRequirement: { yearGroup: 'year5', minMastery: 60 },
  },
]

export const TOPICS: Topic[] = [
  // RECEPTION
  { id: 'rec-counting', name: 'Counting to 10', emoji: '🔢', description: 'Count objects and recognise numbers 0–10', yearGroup: 'reception', gameTypes: ['spell-casting', 'memory-crystal'], color: '#22c55e' },
  { id: 'rec-one-more', name: 'One More, One Less', emoji: '➕', description: 'One more and one less than a number', yearGroup: 'reception', gameTypes: ['spell-casting'], color: '#16a34a' },
  { id: 'rec-shapes', name: 'Magic Shapes', emoji: '🔷', description: 'Circles, squares, triangles and rectangles', yearGroup: 'reception', gameTypes: ['spell-casting', 'memory-crystal'], color: '#15803d' },
  { id: 'rec-patterns', name: 'Magical Patterns', emoji: '🌈', description: 'Copy and continue simple AB patterns', yearGroup: 'reception', gameTypes: ['spell-casting'], color: '#166534' },
  { id: 'rec-comparing', name: 'Big & Small', emoji: '📏', description: 'Compare sizes: bigger, smaller, taller, shorter', yearGroup: 'reception', gameTypes: ['spell-casting'], color: '#14532d' },

  // YEAR 1
  { id: 'y1-numbers20', name: 'Numbers to 20', emoji: '🔢', description: 'Count, order and compare numbers up to 20', yearGroup: 'year1', gameTypes: ['spell-casting', 'memory-crystal'], color: '#f59e0b' },
  { id: 'y1-add-sub', name: 'Adding & Taking Away', emoji: '➕', description: 'Add and subtract within 10', yearGroup: 'year1', gameTypes: ['spell-casting', 'number-bonds-potion'], color: '#d97706' },
  { id: 'y1-shapes', name: '2D & 3D Shapes', emoji: '🔷', description: 'Name and describe 2D and 3D shapes', yearGroup: 'year1', gameTypes: ['spell-casting', 'memory-crystal'], color: '#b45309' },
  { id: 'y1-halves', name: 'Halves', emoji: '🍕', description: 'Find half of shapes and small numbers', yearGroup: 'year1', gameTypes: ['fraction-feast', 'spell-casting'], color: '#92400e' },
  { id: 'y1-time', name: 'Telling Time', emoji: '🕐', description: "O'clock and half past times", yearGroup: 'year1', gameTypes: ['spell-casting'], color: '#78350f' },
  { id: 'y1-money', name: 'Coins & Notes', emoji: '💰', description: 'Recognise coins and simple totals', yearGroup: 'year1', gameTypes: ['magic-market'], color: '#451a03' },

  // YEAR 2
  { id: 'y2-place-value', name: 'Place Value to 100', emoji: '💯', description: 'Tens and ones, ordering numbers to 100', yearGroup: 'year2', gameTypes: ['spell-casting', 'memory-crystal'], color: '#3b82f6' },
  { id: 'y2-add-sub', name: 'Adding & Subtracting', emoji: '➕', description: 'Addition and subtraction within 100', yearGroup: 'year2', gameTypes: ['spell-casting', 'number-bonds-potion'], color: '#2563eb' },
  { id: 'y2-times-2-5-10', name: 'Times Tables 2, 5, 10', emoji: '✖️', description: 'Multiplication and division for 2, 5, 10', yearGroup: 'year2', gameTypes: ['times-table-quest', 'spell-casting', 'memory-crystal'], color: '#1d4ed8' },
  { id: 'y2-fractions', name: 'Halves & Quarters', emoji: '🍕', description: 'Halves, quarters and three-quarters', yearGroup: 'year2', gameTypes: ['fraction-feast', 'spell-casting'], color: '#1e40af' },
  { id: 'y2-shapes', name: '2D Shapes', emoji: '🔷', description: 'Properties of 2D shapes, lines of symmetry', yearGroup: 'year2', gameTypes: ['spell-casting', 'memory-crystal'], color: '#1e3a8a' },
  { id: 'y2-money', name: 'Money', emoji: '💰', description: 'Adding money and giving change', yearGroup: 'year2', gameTypes: ['magic-market'], color: '#172554' },

  // YEAR 3
  { id: 'y3-place-value', name: 'Place Value to 1000', emoji: '🔢', description: 'Hundreds, tens and ones', yearGroup: 'year3', gameTypes: ['spell-casting', 'memory-crystal'], color: '#8b5cf6' },
  { id: 'y3-add-sub', name: 'Column Method', emoji: '📊', description: 'Column addition and subtraction up to 1000', yearGroup: 'year3', gameTypes: ['spell-casting', 'trick-book'], color: '#7c3aed' },
  { id: 'y3-times-3-4', name: 'Times Tables 3 & 4', emoji: '✖️', description: '3 and 4 times tables', yearGroup: 'year3', gameTypes: ['times-table-quest', 'spell-casting', 'memory-crystal'], color: '#6d28d9' },
  { id: 'y3-times-8', name: 'Times Table 8', emoji: '✖️', description: '8 times table', yearGroup: 'year3', gameTypes: ['times-table-quest', 'spell-casting', 'memory-crystal'], color: '#5b21b6' },
  { id: 'y3-fractions', name: 'Fractions', emoji: '🍕', description: 'Unit and non-unit fractions', yearGroup: 'year3', gameTypes: ['fraction-feast', 'spell-casting'], color: '#4c1d95' },
  { id: 'y3-time', name: 'Telling Time', emoji: '🕐', description: 'Read time to 5 minutes, 12/24 hour', yearGroup: 'year3', gameTypes: ['spell-casting'], color: '#3b0764' },
  { id: 'y3-money', name: 'Money Problems', emoji: '💰', description: 'Add and subtract money, making change', yearGroup: 'year3', gameTypes: ['magic-market'], color: '#2e1065' },

  // YEAR 4
  { id: 'y4-place-value', name: 'Place Value to 10,000', emoji: '🔢', description: 'Thousands, hundreds, tens and ones', yearGroup: 'year4', gameTypes: ['spell-casting'], color: '#ec4899' },
  { id: 'y4-all-tables', name: 'All Times Tables!', emoji: '✖️', description: 'All tables from 1 to 12', yearGroup: 'year4', gameTypes: ['times-table-quest', 'spell-casting', 'memory-crystal'], color: '#db2777' },
  { id: 'y4-decimals', name: 'Decimals', emoji: '🔢', description: 'Tenths and hundredths', yearGroup: 'year4', gameTypes: ['spell-casting', 'memory-crystal'], color: '#be185d' },
  { id: 'y4-fractions', name: 'Fraction Fun', emoji: '🍕', description: 'Equivalent fractions, add/subtract fractions', yearGroup: 'year4', gameTypes: ['fraction-feast', 'spell-casting'], color: '#9d174d' },
  { id: 'y4-area', name: 'Area & Perimeter', emoji: '📐', description: 'Calculate area and perimeter of shapes', yearGroup: 'year4', gameTypes: ['spell-casting'], color: '#831843' },
  { id: 'y4-statistics', name: 'Charts & Data', emoji: '📊', description: 'Bar charts, pictograms, tables', yearGroup: 'year4', gameTypes: ['spell-casting'], color: '#500724' },

  // YEAR 5
  { id: 'y5-place-value', name: 'Numbers to 1,000,000', emoji: '🔢', description: 'Read, write, order large numbers', yearGroup: 'year5', gameTypes: ['spell-casting'], color: '#14b8a6' },
  { id: 'y5-long-mult', name: 'Long Multiplication', emoji: '✖️', description: 'Multiply multi-digit numbers', yearGroup: 'year5', gameTypes: ['spell-casting', 'trick-book'], color: '#0d9488' },
  { id: 'y5-division', name: 'Long Division', emoji: '➗', description: 'Short and long division', yearGroup: 'year5', gameTypes: ['spell-casting', 'trick-book'], color: '#0f766e' },
  { id: 'y5-fractions', name: 'Fractions & Decimals', emoji: '🍕', description: 'Mixed numbers, improper fractions, decimals', yearGroup: 'year5', gameTypes: ['fraction-feast', 'spell-casting'], color: '#115e59' },
  { id: 'y5-percentages', name: 'Percentages', emoji: '%', description: 'Percentages of amounts, percentage changes', yearGroup: 'year5', gameTypes: ['spell-casting', 'trick-book'], color: '#134e4a' },
  { id: 'y5-angles', name: 'Angles', emoji: '📐', description: 'Measure and calculate angles', yearGroup: 'year5', gameTypes: ['spell-casting', 'memory-crystal'], color: '#042f2e' },

  // YEAR 6
  { id: 'y6-negatives', name: 'Negative Numbers', emoji: '❄️', description: 'Negative numbers and number lines', yearGroup: 'year6', gameTypes: ['spell-casting', 'memory-crystal'], color: '#f97316' },
  { id: 'y6-algebra', name: 'Algebra Basics', emoji: '🔡', description: 'Simple equations, missing numbers, formulas', yearGroup: 'year6', gameTypes: ['spell-casting', 'number-bonds-potion'], color: '#ea580c' },
  { id: 'y6-ratio', name: 'Ratio & Proportion', emoji: '⚖️', description: 'Ratios, scaling and proportion problems', yearGroup: 'year6', gameTypes: ['spell-casting', 'trick-book'], color: '#dc2626' },
  { id: 'y6-fractions', name: 'Fractions, Decimals & %', emoji: '🍕', description: 'Convert between fractions, decimals, percentages', yearGroup: 'year6', gameTypes: ['fraction-feast', 'spell-casting', 'trick-book'], color: '#b91c1c' },
  { id: 'y6-geometry', name: 'Geometry', emoji: '📐', description: 'Circles, angles in polygons, coordinates', yearGroup: 'year6', gameTypes: ['spell-casting', 'memory-crystal'], color: '#991b1b' },
  { id: 'y6-statistics', name: 'Statistics & Probability', emoji: '📊', description: 'Mean, median, mode, probability', yearGroup: 'year6', gameTypes: ['spell-casting', 'memory-crystal'], color: '#7f1d1d' },
]

export function getTopicsForYear(yearGroup: YearGroup): Topic[] {
  return TOPICS.filter(t => t.yearGroup === yearGroup)
}

export function getYearData(id: YearGroup): YearData {
  return YEARS.find(y => y.id === id) ?? YEARS[0]
}
