import { useGameStore } from '../store/useGameStore'
import { DRILL_LEVELS, isDrillPassed } from '../data/drillLevels'

export type TableChoice = number | 'mix'

export const TABLE_ORDER = [10, 2, 5, 4, 3, 6, 7, 8, 9]

export interface Fact {
  key: string // same format as drill sheets so mistakes feed "My Tricky Facts"
  label: string
  answer: number
  options: number[] // 4, sorted ascending
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function resolveTable(choice: TableChoice): number {
  return choice === 'mix' ? rand(TABLE_ORDER) : choice
}

export function makeFact(table: number, allowDivide: boolean, n = 1 + Math.floor(Math.random() * 10)): Fact {
  const divide = allowDivide && Math.random() < 0.4
  const answer = divide ? n : n * table
  const near = divide
    ? [n - 2, n - 1, n + 1, n + 2, n + 3].filter(v => v >= 1 && v <= 12)
    : [answer - 2 * table, answer - table, answer + table, answer + 2 * table, answer - 1, answer + 1].filter(v => v > 0)
  const distractors = shuffle([...new Set(near)].filter(v => v !== answer)).slice(0, 3)
  return {
    key: divide ? `d:${table}:${n * table}` : `t:${table}:${n}`,
    label: divide ? `${n * table} ÷ ${table}` : `${n} × ${table}`,
    answer,
    options: [answer, ...distractors].sort((a, b) => a - b),
  }
}

// count facts with no two identical facts in a row
export function makeFactSet(choice: TableChoice, count: number, allowDivide: boolean): Fact[] {
  const facts: Fact[] = []
  const ns = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  for (let i = 0; i < count; i++) {
    let f = makeFact(resolveTable(choice), allowDivide, ns[i % 10])
    while (facts.length && f.key === facts[facts.length - 1].key) f = makeFact(resolveTable(choice), allowDivide)
    facts.push(f)
  }
  return facts
}

// Defaults the picker to whatever table Iris is currently working on in drill sheets
export function useSuggestedTable(): TableChoice {
  const profile = useGameStore(s => s.profile)
  const level = DRILL_LEVELS.find(l => !isDrillPassed(profile?.drillRecords?.[l.id], profile?.topicProgress[l.id]?.mastery ?? 0))
  if (!level || level.table === 'squares') return 'mix'
  return level.table
}
