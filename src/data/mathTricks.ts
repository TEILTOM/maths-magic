export interface MathTrick {
  id: string
  title: string
  emoji: string
  tagline: string
  yearFrom: string
  category: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions' | 'general'
  steps: string[]
  example: {
    problem: string
    workingOut: string[]
    answer: string
  }
  tryItQuestion: string
  tryItAnswer: number
  tip: string
  color: string
}

export const MATH_TRICKS: MathTrick[] = [
  {
    id: 'making-ten',
    title: 'Making 10',
    emoji: '🔟',
    tagline: 'Turn tricky adds into easy ones!',
    yearFrom: 'Year 1',
    category: 'addition',
    color: '#3b82f6',
    steps: [
      'Look at the two numbers you are adding',
      'Ask: what do I need to make the bigger number into a 10?',
      'Take that amount from the other number',
      'Now add the leftover to 10!',
    ],
    example: {
      problem: '8 + 6 = ?',
      workingOut: [
        '8 needs 2 to make 10',
        'Take 2 from 6 → leaves 4',
        '10 + 4 = 14',
      ],
      answer: '14',
    },
    tryItQuestion: '7 + 5 = ?',
    tryItAnswer: 12,
    tip: 'This works any time one number is close to 10, 20, 30... Try it for 18 + 7!',
  },
  {
    id: 'nine-fingers',
    title: '9× Finger Trick',
    emoji: '🤙',
    tagline: 'Your hands are a times table calculator!',
    yearFrom: 'Year 2',
    category: 'multiplication',
    color: '#8b5cf6',
    steps: [
      'Hold both hands out with fingers spread',
      'Number your fingers 1 to 10 from left to right',
      'For 9 × a number, fold DOWN that finger',
      'Fingers to the LEFT = tens digit',
      'Fingers to the RIGHT = units digit',
    ],
    example: {
      problem: '9 × 4 = ?',
      workingOut: [
        'Fold down finger number 4',
        '3 fingers on the left = 30',
        '6 fingers on the right = 6',
        '30 + 6 = 36',
      ],
      answer: '36',
    },
    tryItQuestion: '9 × 7 = ?',
    tryItAnswer: 63,
    tip: 'The digits in any 9× answer always add up to 9! (9, 18, 27, 36, 45...)',
  },
  {
    id: 'double-halve',
    title: 'Double & Halve',
    emoji: '🔄',
    tagline: 'Make multiplication easier by swapping!',
    yearFrom: 'Year 3',
    category: 'multiplication',
    color: '#f97316',
    steps: [
      'When multiplying two numbers, try halving one number',
      'Then double the other number',
      'The answer stays the same!',
      'This works best when you can halve one number easily',
    ],
    example: {
      problem: '14 × 5 = ?',
      workingOut: [
        'Halve 14 → 7',
        'Double 5 → 10',
        '7 × 10 = 70 ✓',
      ],
      answer: '70',
    },
    tryItQuestion: '16 × 5 = ?',
    tryItAnswer: 80,
    tip: 'Great for × 5! Halve the number, then × 10. For example: 18 × 5 → 9 × 10 = 90',
  },
  {
    id: 'grid-method',
    title: 'Grid Multiplication',
    emoji: '🔲',
    tagline: 'Split big numbers into easy pieces!',
    yearFrom: 'Year 3',
    category: 'multiplication',
    color: '#14b8a6',
    steps: [
      'Split each number into tens and units (or hundreds, tens, units)',
      'Draw a grid with the parts',
      'Multiply each pair of parts',
      'Add all the answers together!',
    ],
    example: {
      problem: '23 × 4 = ?',
      workingOut: [
        '23 = 20 + 3',
        '20 × 4 = 80',
        '3 × 4 = 12',
        '80 + 12 = 92',
      ],
      answer: '92',
    },
    tryItQuestion: '31 × 3 = ?',
    tryItAnswer: 93,
    tip: 'This is called "partitioning" — maths teachers love it! It works for any size number.',
  },
  {
    id: 'chunking',
    title: 'Chunking Division',
    emoji: '✂️',
    tagline: 'Cut big divisions into bite-size chunks!',
    yearFrom: 'Year 4',
    category: 'division',
    color: '#ec4899',
    steps: [
      'Ask: how many whole times can the divisor fit?',
      'Start with easy multiples (×10, ×5, ×2)',
      'Subtract each chunk from the total',
      'Keep going until nothing is left (or a small remainder)',
      'Add up all your chunks!',
    ],
    example: {
      problem: '72 ÷ 6 = ?',
      workingOut: [
        '6 × 10 = 60 → 72 - 60 = 12 remaining',
        '6 × 2 = 12 → 12 - 12 = 0',
        '10 + 2 = 12',
      ],
      answer: '12',
    },
    tryItQuestion: '84 ÷ 7 = ?',
    tryItAnswer: 12,
    tip: 'Always start with the biggest chunk you know (usually × 10) to save time!',
  },
  {
    id: 'number-bonds',
    title: 'Number Bonds',
    emoji: '🤝',
    tagline: 'Know your pairs that make 10 (and 20)!',
    yearFrom: 'Year 1',
    category: 'addition',
    color: '#22c55e',
    steps: [
      'Number bonds are pairs of numbers that add to make a target',
      'Learn the pairs for 10: 1+9, 2+8, 3+7, 4+6, 5+5',
      'Then use them for 20, 30, 100...',
      'They make adding and subtracting SO much faster!',
    ],
    example: {
      problem: '17 + 6 = ?',
      workingOut: [
        'Know that 7 + 3 = 10 (number bond!)',
        'Take 3 from 6 to make 17 into 20',
        '20 + 3 = 23',
      ],
      answer: '23',
    },
    tryItQuestion: '18 + 5 = ?',
    tryItAnswer: 23,
    tip: 'Number bonds to 100 are really useful: 35 + 65 = 100, 47 + 53 = 100...',
  },
  {
    id: 'bridging-ten',
    title: 'Bridging Through 10',
    emoji: '🌉',
    tagline: 'Use 10 as a stepping stone!',
    yearFrom: 'Year 1',
    category: 'addition',
    color: '#a78bfa',
    steps: [
      'Find how much you need to reach the next 10',
      'Add that amount first',
      'Then add the rest',
    ],
    example: {
      problem: '8 + 7 = ?',
      workingOut: [
        '8 needs 2 to reach 10',
        'Split 7 into 2 + 5',
        '8 + 2 = 10',
        '10 + 5 = 15',
      ],
      answer: '15',
    },
    tryItQuestion: '9 + 8 = ?',
    tryItAnswer: 17,
    tip: 'Also works for subtraction! 23 - 7: go back to 20 first (−3), then subtract 4 more.',
  },
  {
    id: 'times-11',
    title: '11× Shortcut',
    emoji: '1️⃣1️⃣',
    tagline: 'Two-digit × 11 is magic!',
    yearFrom: 'Year 4',
    category: 'multiplication',
    color: '#f59e0b',
    steps: [
      'For any two-digit number × 11:',
      'Write the first digit',
      'Write the SUM of both digits in the middle',
      'Write the last digit',
      '(If the middle sum is 10+, carry the 1!)',
    ],
    example: {
      problem: '23 × 11 = ?',
      workingOut: [
        'First digit: 2',
        'Middle: 2 + 3 = 5',
        'Last digit: 3',
        'Answer: 253',
      ],
      answer: '253',
    },
    tryItQuestion: '34 × 11 = ?',
    tryItAnswer: 374,
    tip: 'Check: 45 × 11 → 4, (4+5=9), 5 → 495. Works every time!',
  },
  {
    id: 'percent-easy',
    title: 'Easy Percentages',
    emoji: '%',
    tagline: 'Break percentages into chunks you know!',
    yearFrom: 'Year 5',
    category: 'general',
    color: '#6366f1',
    steps: [
      '10% = divide by 10 (move decimal left)',
      '5% = find 10%, then halve it',
      '1% = divide by 100',
      'Build any % from these building blocks!',
      '15% = 10% + 5%, 25% = half of 50%...',
    ],
    example: {
      problem: '15% of 80 = ?',
      workingOut: [
        '10% of 80 = 8',
        '5% of 80 = 4 (half of 8)',
        '15% = 8 + 4 = 12',
      ],
      answer: '12',
    },
    tryItQuestion: '15% of 60 = ?',
    tryItAnswer: 9,
    tip: '50% = half, 25% = quarter. Always useful to know these without calculating!',
  },
  {
    id: 'bar-model',
    title: 'Bar Model',
    emoji: '📊',
    tagline: 'Draw a picture to solve word problems!',
    yearFrom: 'Year 2',
    category: 'general',
    color: '#10b981',
    steps: [
      'Draw a rectangle for the whole amount',
      'Split it into parts you know',
      'The missing part is what you need to find',
      'Great for word problems and fractions!',
    ],
    example: {
      problem: 'Sam has 12 sweets. He gives 4 away. How many left?',
      workingOut: [
        'Draw a bar showing 12 total',
        'Mark one section as 4 (given away)',
        'The other section = 12 - 4 = 8',
      ],
      answer: '8',
    },
    tryItQuestion: 'A bar of 20 is split: one part is 13. What is the other part?',
    tryItAnswer: 7,
    tip: 'Maths teachers in Singapore use this for ALL problems — it works brilliantly!',
  },
]
