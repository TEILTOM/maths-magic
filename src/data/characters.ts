export type CharacterId = 'sparkle' | 'zephyr' | 'ember' | 'luna' | 'orion'

export interface Character {
  id: CharacterId
  name: string
  emoji: string
  color: string
  bgGradient: string
  borderColor: string
  personality: string
  greetings: string[]
  correctMessages: string[]
  incorrectMessages: string[]
  streakMessages: string[]
  hintMessages: string[]
  levelUpMessages: string[]
}

export const CHARACTERS: Character[] = [
  {
    id: 'sparkle',
    name: 'Sparkle',
    emoji: '🧚',
    color: '#ec4899',
    bgGradient: 'from-pink-400 to-purple-500',
    borderColor: 'border-pink-400',
    personality: 'Bubbly fairy who loves celebrating every win!',
    greetings: [
      "Hi there! I'm Sparkle your magical fairy! Let's do some maths magic! ✨",
      "Ooh you're back! I've been sprinkling maths dust waiting for you! 🌟",
      "Ready to cast some number spells? Let's go! 💫",
    ],
    correctMessages: [
      "Woohoo! Magical! ✨", "Yes yes yes! You're a star! 🌟", "Sparkle sparkle! So clever! 💫",
      "I knew you could do it! 🎉", "Amazing! My wings are glowing! 🧚", "Perfect! A fairy couldn't do better! 🌸",
    ],
    incorrectMessages: [
      "Oops! Fairy dust slipped! Try again! 🌸", "Nearly! Give it another go! ✨",
      "That's okay! Even fairies make mistakes! 💕", "Don't worry! Let's try a different way! 🌟",
    ],
    streakMessages: [
      "You're on fire! 🔥 Well... fairy fire!", "Amazing streak! My wings are sparkling extra hard! ✨",
    ],
    hintMessages: [
      "Psst! Try counting on your fingers! 🤫", "Here's a hint: think about number bonds! 💭",
      "What if you split it into smaller pieces? 🌸",
    ],
    levelUpMessages: [
      "You levelled up! I'm going to do a fairy dance! 💃✨", "Level up! You're becoming a real maths wizard! 🧙",
    ],
  },
  {
    id: 'zephyr',
    name: 'Zephyr',
    emoji: '🧙',
    color: '#3b82f6',
    bgGradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400',
    personality: 'Ancient wizard who knows all the maths tricks!',
    greetings: [
      "Ah, a new apprentice! I am Zephyr, keeper of all mathematical wisdom. Shall we begin? 🔮",
      "Welcome back, young one. The numbers await! 📚",
      "The ancient scrolls of mathematics call to us! Let us study together! ✨",
    ],
    correctMessages: [
      "Excellent! My spellbook is impressed! 📖", "Precisely! You have the mind of a true wizard! 🎩",
      "Magnificent! The ancient ones would be proud! ⚡", "Correct! Add that to your tome of knowledge! 📚",
      "Splendid! Your maths powers grow stronger! 🔮",
    ],
    incorrectMessages: [
      "Hmm, not quite. Even great wizards must practice! 🧙", "Incorrect, but wisdom comes from mistakes! Try again! 📖",
      "Not this time. Shall I show you a wizard's trick? 🔮",
    ],
    streakMessages: [
      "Your mathematical power is immense! The stars align! ⭐", "A streak worthy of the great spellbooks! 📚",
    ],
    hintMessages: [
      "A wise wizard once said: break big numbers into small ones! 🧙", "Think of it this way, apprentice... 💭",
      "The trick I always use is... doubling and halving! 🎩",
    ],
    levelUpMessages: [
      "You have advanced, young wizard! New spells await! 🧙✨", "Level up! Your magical abilities grow! 🔮",
    ],
  },
  {
    id: 'ember',
    name: 'Ember',
    emoji: '🐉',
    color: '#f97316',
    bgGradient: 'from-orange-400 to-red-500',
    borderColor: 'border-orange-400',
    personality: 'Energetic dragon who LOVES smashing maths problems!',
    greetings: [
      "ROAR! I'm Ember the dragon! Let's SMASH these maths problems! 🔥",
      "You're back! I've been breathing fire waiting for you! Let's GO! 🐉",
      "Ember is READY! Are YOU ready? Let's crush some numbers! 💪",
    ],
    correctMessages: [
      "BOOM! Destroyed it! 🔥", "ROAR! That's how we do it! 🐉", "YES! You're as fierce as a dragon! 💪",
      "INCREDIBLE! Ember is SO proud! 🎉", "SMASHED IT! High five! 🖐️", "FIRE! That's AMAZING! 🔥",
    ],
    incorrectMessages: [
      "Grr! Even dragons miss sometimes! Try again! 🐉", "Argh! Let's try harder! 💪",
      "That wasn't it but dragons NEVER give up! 🔥",
    ],
    streakMessages: [
      "YOU'RE ON FIRE! Just like me! 🔥🔥🔥", "UNSTOPPABLE! You're basically a dragon! 🐉",
    ],
    hintMessages: [
      "PSST! Dragons use their claws to count! 🐉", "Here's a secret weapon... 💥",
      "Want Ember's special trick? Try it this way! 🔥",
    ],
    levelUpMessages: [
      "LEVEL UP! You're basically breathing fire now! 🔥", "ROAR! New level! You're a maths DRAGON! 🐉",
    ],
  },
  {
    id: 'luna',
    name: 'Luna',
    emoji: '🦄',
    color: '#8b5cf6',
    bgGradient: 'from-purple-400 to-pink-500',
    borderColor: 'border-purple-400',
    personality: 'Playful unicorn who finds magical patterns everywhere!',
    greetings: [
      "Hello! I'm Luna the unicorn! Maths is SO magical — like rainbows! 🌈",
      "Oh yay you're here! I found the most amazing pattern to show you! 🦄",
      "Sparkles and numbers! My two favourite things! Let's play! 🌟",
    ],
    correctMessages: [
      "Rainbow magic! You got it! 🌈", "So beautiful! Like a rainbow answer! 🦄",
      "That's as magical as my horn! ✨", "Neigh! (That means brilliant!) 🌟",
      "You found the pattern! So clever! 🎨",
    ],
    incorrectMessages: [
      "Oopsie! Even unicorns trip! 🌈", "Nearly there! Look for the pattern! 🦄",
      "Don't worry! Magic takes practice! ✨",
    ],
    streakMessages: [
      "Your streak is like a rainbow — beautiful! 🌈", "So magical! Just like a unicorn! 🦄",
    ],
    hintMessages: [
      "Look for the pattern — numbers love patterns! 🌈", "Unicorns see the magic in numbers... 🦄",
      "What if you drew it out? 🎨",
    ],
    levelUpMessages: [
      "Level up! Your maths rainbow gets bigger! 🌈", "A new level! My horn is glowing for you! 🦄",
    ],
  },
  {
    id: 'orion',
    name: 'Orion',
    emoji: '🦉',
    color: '#64748b',
    bgGradient: 'from-slate-500 to-gray-700',
    borderColor: 'border-slate-400',
    personality: 'Calm, wise owl who explains maths clearly and patiently.',
    greetings: [
      "Hoot! I'm Orion the owl. I'll help you understand every step. Ready? 🦉",
      "Welcome back. Shall we explore some interesting mathematics together? 📐",
      "Hoot hoot! I've been thinking about some excellent maths problems for us! 🌙",
    ],
    correctMessages: [
      "Excellent reasoning! 🦉", "Well done. You understood that perfectly. 🌙",
      "Very good! I can see you're thinking it through! 📐", "Correct! Your logical thinking is superb! ⭐",
      "That's exactly right. Well deduced! 🔍",
    ],
    incorrectMessages: [
      "Not quite — but let me explain a different way. 🦉", "Hmm, that wasn't right. Let's think step by step. 📐",
      "Good try. Would you like a hint? 🌙",
    ],
    streakMessages: [
      "Your consistency is admirable! A fine streak! 🌙", "Excellent persistence! Orion is impressed! 🦉",
    ],
    hintMessages: [
      "Let me explain this step by step... 🦉", "Think about it methodically: first... then... 📐",
      "There's a useful trick for this one! 🌙",
    ],
    levelUpMessages: [
      "Level achieved. Your understanding deepens! 🦉", "A new level unlocked. Knowledge builds on knowledge! 📚",
    ],
  },
]

export function getCharacter(id: CharacterId): Character {
  return CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0]
}

export function randomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)]
}
