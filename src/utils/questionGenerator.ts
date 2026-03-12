import type { TopicId, Difficulty } from '../data/curriculum'

export interface Question {
  id: string
  topicId: TopicId
  difficulty: Difficulty
  question: string
  options: string[]
  correctIndex: number
  hint?: string
  explanation?: string
  visualData?: unknown
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeOptions(correct: number, count = 4, range = 5, minValue = -Infinity): string[] {
  const opts = new Set<number>([correct])
  let attempts = 0
  while (opts.size < count && attempts < 50) {
    const offset = rand(-range, range)
    const candidate = correct + offset
    if (offset !== 0 && candidate >= minValue) opts.add(candidate)
    attempts++
  }
  while (opts.size < count) {
    let candidate = correct + opts.size * 2
    if (candidate < minValue) candidate = minValue + opts.size
    while (opts.has(candidate)) candidate += 1
    opts.add(candidate)
  }
  const arr = Array.from(opts).map(String)
  return shuffle(arr)
}

function makeOptionsStr(correct: string, distractors: string[]): string[] {
  return shuffle([correct, ...distractors.slice(0, 3)])
}

function makeQuestion(
  topicId: TopicId,
  difficulty: Difficulty,
  question: string,
  correct: string | number,
  options: string[],
  hint?: string,
  explanation?: string,
): Question {
  const correctStr = String(correct)
  const correctIndex = options.indexOf(correctStr)
  return {
    id: `${topicId}-${Date.now()}-${Math.random()}`,
    topicId,
    difficulty,
    question,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    hint,
    explanation,
  }
}

// ---- RECEPTION ----
function receptionCounting(difficulty: Difficulty): Question {
  const max = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 10
  const n = rand(1, max)
  const emojis = ['⭐', '🍎', '🦋', '🌸', '🎈', '🐸', '🌟', '🍭', '🐶', '🎁']
  const emoji = emojis[rand(0, emojis.length - 1)]
  const row = emoji.repeat(n)
  const opts = makeOptions(n, 4, 3)
  return makeQuestion(
    'rec-counting', difficulty,
    `How many ${emoji} are there?\n${row}`,
    n, opts,
    `Count each one carefully!`,
  )
}

function receptionOneMore(difficulty: Difficulty): Question {
  const max = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 9
  const n = rand(0, max)
  const oneMore = n + 1
  const opts = makeOptions(oneMore, 4, 2)
  return makeQuestion('rec-one-more', difficulty, `What is one more than ${n}?`, oneMore, opts, `Count up one more!`)
}

function receptionShapes(_difficulty: Difficulty): Question {
  const shapes = [
    { name: 'circle', emoji: '⭕', sides: '0 sides', distractors: ['triangle', 'square', 'rectangle'] },
    { name: 'square', emoji: '🟥', sides: '4 equal sides', distractors: ['circle', 'triangle', 'rectangle'] },
    { name: 'triangle', emoji: '🔺', sides: '3 sides', distractors: ['circle', 'square', 'rectangle'] },
    { name: 'rectangle', emoji: '▬', sides: '4 sides', distractors: ['circle', 'triangle', 'square'] },
  ]
  const shape = shapes[rand(0, shapes.length - 1)]
  const opts = makeOptionsStr(shape.name, shape.distractors)
  return makeQuestion('rec-shapes', 'easy', `What shape is this? ${shape.emoji}`, shape.name, opts, `Count the sides!`)
}

// ---- YEAR 1 ----
function year1AddSub(difficulty: Difficulty): Question {
  const max = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20
  const add = Math.random() > 0.5
  if (add) {
    const a = rand(1, max - 1)
    const b = rand(1, max - a)
    const ans = a + b
    const opts = makeOptions(ans, 4, 4)
    return makeQuestion('y1-add-sub', difficulty, `${a} + ${b} = ?`, ans, opts, `Count on from ${a}`, `${a} + ${b} = ${ans}`)
  } else {
    const a = rand(2, max)
    const b = rand(1, a)
    const ans = a - b
    const opts = makeOptions(ans, 4, 4)
    return makeQuestion('y1-add-sub', difficulty, `${a} - ${b} = ?`, ans, opts, `Count back from ${a}`, `${a} - ${b} = ${ans}`)
  }
}

// ---- YEAR 2 ----
function year2PlaceValue(difficulty: Difficulty): Question {
  const n = difficulty === 'easy' ? rand(11, 39) : difficulty === 'medium' ? rand(11, 79) : rand(11, 99)
  const tens = Math.floor(n / 10)
  const ones = n % 10
  const q = Math.random() > 0.5
    ? `What number is ${tens} tens and ${ones} ones?`
    : `How many tens are in ${n}?`
  const ans = q.includes('tens and') ? n : tens
  const opts = makeOptions(ans, 4, 5)
  return makeQuestion('y2-place-value', difficulty, q, ans, opts, 'Think about tens and units!', `${n} = ${tens} tens and ${ones} ones`)
}

function year2AddSub(difficulty: Difficulty): Question {
  const max = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 80 : 100
  const add = Math.random() > 0.4
  if (add) {
    const a = rand(1, max - 10)
    const b = rand(1, Math.min(20, max - a))
    const ans = a + b
    const opts = makeOptions(ans, 4, 5)
    return makeQuestion('y2-add-sub', difficulty, `${a} + ${b} = ?`, ans, opts, 'Try counting on!', `${a} + ${b} = ${ans}`)
  } else {
    const a = rand(10, max)
    const b = rand(1, Math.min(a - 1, 20))
    const ans = a - b
    const opts = makeOptions(ans, 4, 5)
    return makeQuestion('y2-add-sub', difficulty, `${a} - ${b} = ?`, ans, opts, 'Try counting back!', `${a} - ${b} = ${ans}`)
  }
}

function timesTable(table: number, difficulty: Difficulty, topicId: TopicId): Question {
  const maxFactor = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 12
  const factor = rand(1, maxFactor)
  const ans = table * factor
  const questionTypes = ['standard', 'missing', 'word']
  const type = questionTypes[rand(0, difficulty === 'easy' ? 0 : 2)]

  if (type === 'missing') {
    const opts = makeOptions(factor, 4, 3, 0)
    return makeQuestion(topicId, difficulty, `${table} × ? = ${ans}`, factor, opts, `Think about the ${table} times table`, `${table} × ${factor} = ${ans}`)
  }
  if (type === 'word') {
    const items = ['stars', 'sweets', 'coins', 'dragons', 'crystals']
    const item = items[rand(0, items.length - 1)]
    const opts = makeOptions(ans, 4, table, 0)
    return makeQuestion(topicId, difficulty, `There are ${factor} bags with ${table} ${item} in each. How many ${item} altogether?`, ans, opts, `${factor} groups of ${table}`)
  }
  const opts = makeOptions(ans, 4, table, 0)
  return makeQuestion(topicId, difficulty, `${table} × ${factor} = ?`, ans, opts, `Count in ${table}s`, `${table} × ${factor} = ${ans}`)
}

function year2Times(difficulty: Difficulty): Question {
  const tables = [2, 5, 10]
  const t = tables[rand(0, tables.length - 1)]
  return timesTable(t, difficulty, 'y2-times-2-5-10')
}

// ---- YEAR 3 ----
function year3PlaceValue(difficulty: Difficulty): Question {
  const n = difficulty === 'easy' ? rand(100, 399) : difficulty === 'medium' ? rand(100, 699) : rand(100, 999)
  const hundreds = Math.floor(n / 100)
  const tens = Math.floor((n % 100) / 10)
  const ones = n % 10
  const type = rand(0, 2)
  if (type === 0) {
    const opts = makeOptions(n, 4, 50)
    return makeQuestion('y3-place-value', difficulty, `What number is ${hundreds} hundreds, ${tens} tens and ${ones} ones?`, n, opts)
  }
  if (type === 1) {
    const opts = makeOptions(hundreds, 4, 2)
    return makeQuestion('y3-place-value', difficulty, `How many hundreds are in ${n}?`, hundreds, opts, 'Look at the first digit')
  }
  const rounded = Math.round(n / 10) * 10
  const opts = makeOptions(rounded, 4, 10)
  return makeQuestion('y3-place-value', difficulty, `Round ${n} to the nearest 10`, rounded, opts, 'Look at the units digit')
}

function year3Times(difficulty: Difficulty): Question {
  const tables = difficulty === 'easy' ? [3, 4] : [3, 4, 8]
  const t = tables[rand(0, tables.length - 1)]
  return timesTable(t, difficulty, t === 8 ? 'y3-times-8' : 'y3-times-3-4')
}

function year3Money(difficulty: Difficulty): Question {
  const prices = difficulty === 'easy'
    ? [{ item: '🍎 apple', p: rand(10, 50) }, { item: '🍭 sweet', p: rand(5, 20) }]
    : [{ item: '🎈 balloon', p: rand(50, 150) }, { item: '📚 book', p: rand(100, 300) }]
  const a = prices[rand(0, prices.length - 1)]
  const b = prices[rand(0, prices.length - 1)]
  const total = a.p + b.p
  const opts = makeOptions(total, 4, 10)
  const display = (p: number) => p >= 100 ? `£${(p / 100).toFixed(2)}` : `${p}p`
  return makeQuestion('y3-money', difficulty, `A ${a.item} costs ${display(a.p)} and a ${b.item} costs ${display(b.p)}. How much altogether?`, total, opts.map(o => display(Number(o))), 'Add the prices together')
}

// ---- YEAR 4 ----
function year4AllTables(difficulty: Difficulty): Question {
  const t = rand(2, 12)
  return timesTable(t, difficulty, 'y4-all-tables')
}

function year4Decimals(difficulty: Difficulty): Question {
  if (difficulty === 'easy') {
    const n = rand(1, 9)
    const opts = makeOptionsStr(`0.${n}`, [`0.${n + 1}`, `${n}.0`, `0.${Math.max(1, n - 1)}`])
    return makeQuestion('y4-decimals', difficulty, `What is ${n} tenths as a decimal?`, `0.${n}`, opts, 'Tenths go after the decimal point')
  }
  const whole = rand(0, 9)
  const tenths = rand(0, 9)
  const n = `${whole}.${tenths}`
  const opts = makeOptionsStr(n, [`${whole + 1}.${tenths}`, `${whole}.${tenths + 1}`, `0.${whole}${tenths}`])
  return makeQuestion('y4-decimals', difficulty, `What decimal is shown? ${whole} whole and ${tenths} tenths`, n, opts)
}

// ---- YEAR 5 ----
function year5Percentages(difficulty: Difficulty): Question {
  if (difficulty === 'easy') {
    const base = rand(1, 9) * 10
    const ans = base / 10
    const opts = makeOptions(ans, 4, 3)
    return makeQuestion('y5-percentages', difficulty, `What is 10% of ${base}?`, ans, opts, 'Divide by 10 to find 10%')
  }
  if (difficulty === 'medium') {
    const base = rand(2, 8) * 20
    const ans = base / 2
    const opts = makeOptions(ans, 4, 5)
    return makeQuestion('y5-percentages', difficulty, `What is 50% of ${base}?`, ans, opts, '50% means half')
  }
  const base = rand(1, 8) * 10
  const ans = base / 4
  const opts = makeOptions(ans, 4, 3)
  return makeQuestion('y5-percentages', difficulty, `What is 25% of ${base}?`, ans, opts, '25% = half of half')
}

function year5LongMult(difficulty: Difficulty): Question {
  const a = difficulty === 'easy' ? rand(11, 29) : difficulty === 'medium' ? rand(12, 49) : rand(21, 99)
  const b = difficulty === 'easy' ? rand(2, 5) : rand(2, 9)
  const ans = a * b
  const opts = makeOptions(ans, 4, Math.max(5, b * 2))
  return makeQuestion('y5-long-mult', difficulty, `${a} × ${b} = ?`, ans, opts, `Try the grid method: split ${a} into tens and units`, `${a} × ${b} = ${ans}`)
}

// ---- YEAR 6 ----
function year6Algebra(difficulty: Difficulty): Question {
  if (difficulty === 'easy') {
    const x = rand(1, 10)
    const b = rand(1, 10)
    const result = x + b
    const opts = makeOptions(x, 4, 3)
    return makeQuestion('y6-algebra', difficulty, `x + ${b} = ${result}\nWhat is x?`, x, opts, `What + ${b} = ${result}?`)
  }
  if (difficulty === 'medium') {
    const x = rand(2, 9)
    const m = rand(2, 5)
    const result = m * x
    const opts = makeOptions(x, 4, 3)
    return makeQuestion('y6-algebra', difficulty, `${m}x = ${result}\nWhat is x?`, x, opts, `${result} ÷ ${m} = ?`)
  }
  const x = rand(2, 8)
  const m = rand(2, 4)
  const b = rand(1, 10)
  const result = m * x + b
  const opts = makeOptions(x, 4, 3)
  return makeQuestion('y6-algebra', difficulty, `${m}x + ${b} = ${result}\nWhat is x?`, x, opts, `First subtract ${b}, then divide by ${m}`)
}

function year6Ratio(difficulty: Difficulty): Question {
  if (difficulty === 'easy') {
    const a = rand(1, 4)
    const b = rand(1, 4)
    const mult = rand(2, 5)
    const totalParts = a + b
    const total = totalParts * mult
    const opts = makeOptions(a * mult, 4, mult)
    return makeQuestion('y6-ratio', difficulty, `Split ${total} in the ratio ${a}:${b}\nWhat is the first share?`, a * mult, opts, `Total parts = ${a}+${b}=${totalParts}. Each part = ${total}÷${totalParts}`)
  }
  const a = rand(2, 5)
  const mult = rand(3, 8)
  const result = a * mult
  const opts = makeOptions(mult, 4, 2)
  return makeQuestion('y6-ratio', difficulty, `If 1 part = ${a}, what does ${result} represent in number of parts?`, mult, opts, `Divide ${result} by ${a}`)
}

function year6Negatives(difficulty: Difficulty): Question {
  if (difficulty === 'easy') {
    const n = rand(-5, 5)
    const add = rand(1, 5)
    const ans = n + add
    const opts = makeOptions(ans, 4, 3)
    return makeQuestion('y6-negatives', difficulty, `${n} + ${add} = ?`, ans, opts, 'Think of a number line')
  }
  const n = rand(-10, 0)
  const sub = rand(1, 10)
  const ans = n - sub
  const opts = makeOptions(ans, 4, 3)
  return makeQuestion('y6-negatives', difficulty, `${n} - ${sub} = ?`, ans, opts, 'Going further below zero')
}

// ---- FRACTIONS (shared) ----
function fractionQuestion(topicId: TopicId, difficulty: Difficulty): Question {
  const maxDenom = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 8 : 10
  const denom = rand(2, maxDenom)
  const numer = rand(1, denom - 1)
  const questionType = rand(0, 1)

  if (questionType === 0) {
    const total = denom * rand(1, 4)
    const ans = (total / denom) * numer
    const opts = makeOptions(ans, 4, 2)
    return makeQuestion(topicId, difficulty, `What is ${numer}/${denom} of ${total}?`, ans, opts, `Divide by ${denom}, then multiply by ${numer}`)
  }
  const equiv = rand(2, 5)
  const opts = makeOptions(numer * equiv, 4, 2)
  return makeQuestion(topicId, difficulty, `${numer}/${denom} = ?/${denom * equiv}`, numer * equiv, opts, 'Multiply top and bottom by the same number')
}

function numberBondsQuestion(topicId: TopicId, difficulty: Difficulty): Question {
  const targets = difficulty === 'easy' ? [5, 10] : difficulty === 'medium' ? [10, 20] : [20, 50, 100]
  const target = targets[rand(0, targets.length - 1)]
  const a = rand(1, target - 1)
  const ans = target - a
  const opts = makeOptions(ans, 4, 4)
  return makeQuestion(topicId, difficulty, `${a} + ? = ${target}`, ans, opts, `What do you add to ${a} to make ${target}?`)
}

// ---- MAIN GENERATOR ----
export function generateQuestion(topicId: TopicId, difficulty: Difficulty = 'easy'): Question {
  const generators: Partial<Record<TopicId, (d: Difficulty) => Question>> = {
    'rec-counting': receptionCounting,
    'rec-one-more': receptionOneMore,
    'rec-shapes': receptionShapes,
    'y1-add-sub': year1AddSub,
    'y1-halves': (d) => fractionQuestion('y1-halves', d),
    'y2-place-value': year2PlaceValue,
    'y2-add-sub': year2AddSub,
    'y2-times-2-5-10': year2Times,
    'y2-fractions': (d) => fractionQuestion('y2-fractions', d),
    'y3-place-value': year3PlaceValue,
    'y3-add-sub': (d) => {
      const a = rand(100, 900); const b = rand(10, 99); const add = Math.random() > 0.5
      const ans = add ? a + b : a - b; const opts = makeOptions(ans, 4, 10)
      return makeQuestion('y3-add-sub', d, `${add ? a + ' + ' + b : a + ' - ' + b} = ?`, ans, opts)
    },
    'y3-times-3-4': year3Times,
    'y3-times-8': (d) => timesTable(8, d, 'y3-times-8'),
    'y3-fractions': (d) => fractionQuestion('y3-fractions', d),
    'y3-money': year3Money,
    'y4-place-value': (d) => {
      const n = d === 'easy' ? rand(1000, 4999) : rand(1000, 9999)
      const opts = makeOptions(n, 4, 200); return makeQuestion('y4-place-value', d, `Write in digits: ${n.toLocaleString()}`, n, opts)
    },
    'y4-all-tables': year4AllTables,
    'y4-decimals': year4Decimals,
    'y4-fractions': (d) => fractionQuestion('y4-fractions', d),
    'y4-area': (d) => {
      const l = rand(2, d === 'easy' ? 8 : 15); const w = rand(2, d === 'easy' ? 6 : 10)
      const ans = l * w; const opts = makeOptions(ans, 4, 5)
      return makeQuestion('y4-area', d, `Find the area of a rectangle ${l}cm × ${w}cm`, ans, opts, 'Area = length × width')
    },
    'y5-percentages': year5Percentages,
    'y5-long-mult': year5LongMult,
    'y5-fractions': (d) => fractionQuestion('y5-fractions', d),
    'y5-division': (d) => {
      const divisor = rand(2, d === 'easy' ? 6 : 12); const quotient = rand(2, d === 'easy' ? 10 : 20)
      const dividend = divisor * quotient; const opts = makeOptions(quotient, 4, 3)
      return makeQuestion('y5-division', d, `${dividend} ÷ ${divisor} = ?`, quotient, opts, `Think: what × ${divisor} = ${dividend}?`)
    },
    'y6-algebra': year6Algebra,
    'y6-ratio': year6Ratio,
    'y6-negatives': year6Negatives,
    'y6-fractions': (d) => fractionQuestion('y6-fractions', d),
  }

  const gen = generators[topicId]
  if (gen) return gen(difficulty)

  // Fallback: number bonds
  return numberBondsQuestion(topicId, difficulty)
}

export function generateBatch(topicId: TopicId, difficulty: Difficulty, count: number): Question[] {
  return Array.from({ length: count }, () => generateQuestion(topicId, difficulty))
}

export function getDifficultyForMastery(mastery: number): Difficulty {
  if (mastery < 40) return 'easy'
  if (mastery < 65) return 'medium'
  if (mastery < 85) return 'hard'
  return 'challenge'
}
