export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  category: 'streak' | 'accuracy' | 'speed' | 'explorer' | 'mastery' | 'special'
  xpReward: number
  secret?: boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  // First steps
  { id: 'first-spell', name: 'First Spell!', description: 'Complete your very first game', emoji: '✨', category: 'special', xpReward: 50 },
  { id: 'apprentice', name: 'Apprentice Wizard', description: 'Complete 5 games', emoji: '🧙', category: 'explorer', xpReward: 75 },
  { id: 'wizard', name: 'Mighty Wizard', description: 'Complete 25 games', emoji: '🔮', category: 'explorer', xpReward: 150 },
  { id: 'archmage', name: 'Archmage!', description: 'Complete 100 games', emoji: '👑', category: 'explorer', xpReward: 500 },

  // Streaks
  { id: 'streak-2', name: 'Spark of Magic', description: 'Get a 2-day streak', emoji: '🔥', category: 'streak', xpReward: 30 },
  { id: 'streak-5', name: 'Fire Starter', description: 'Get a 5-day streak', emoji: '🔥', category: 'streak', xpReward: 75 },
  { id: 'streak-10', name: 'Blaze of Glory', description: 'Get a 10-day streak', emoji: '🔥', category: 'streak', xpReward: 150 },
  { id: 'streak-30', name: 'Eternal Flame', description: 'Get a 30-day streak!', emoji: '🔥', category: 'streak', xpReward: 500 },
  { id: 'streak-100', name: 'Legend!', description: '100 days in a row — unbelievable!', emoji: '🏆', category: 'streak', xpReward: 2000, secret: true },

  // Accuracy
  { id: 'perfect-game', name: 'Flawless!', description: 'Get 100% in a game', emoji: '⭐', category: 'accuracy', xpReward: 100 },
  { id: 'three-perfect', name: 'Perfectionist', description: 'Get 100% three times', emoji: '🌟', category: 'accuracy', xpReward: 200 },
  { id: 'ten-perfect', name: 'The Perfect Wizard', description: 'Get 100% ten times', emoji: '💎', category: 'accuracy', xpReward: 500 },

  // Speed
  { id: 'speed-star', name: 'Speed Star', description: 'Answer 10 questions in under 2 seconds each', emoji: '⚡', category: 'speed', xpReward: 100 },
  { id: 'lightning', name: 'Lightning Bolt', description: 'Complete Spell Casting with full time remaining', emoji: '⚡', category: 'speed', xpReward: 150 },

  // Times tables
  { id: 'table-2', name: 'Double Trouble', description: 'Master the 2 times table', emoji: '2️⃣', category: 'mastery', xpReward: 50 },
  { id: 'table-5', name: 'High Five!', description: 'Master the 5 times table', emoji: '5️⃣', category: 'mastery', xpReward: 50 },
  { id: 'table-10', name: 'Perfect Ten', description: 'Master the 10 times table', emoji: '🔟', category: 'mastery', xpReward: 50 },
  { id: 'table-3', name: 'Triple Threat', description: 'Master the 3 times table', emoji: '3️⃣', category: 'mastery', xpReward: 75 },
  { id: 'table-4', name: 'Four Power', description: 'Master the 4 times table', emoji: '4️⃣', category: 'mastery', xpReward: 75 },
  { id: 'all-tables', name: 'Times Table Master!', description: 'Master all 12 times tables!', emoji: '🏆', category: 'mastery', xpReward: 1000 },

  // Year mastery
  { id: 'reception-master', name: 'Reception Graduate', description: 'Master all Reception topics', emoji: '🌱', category: 'mastery', xpReward: 300 },
  { id: 'year1-master', name: 'Year 1 Champion', description: 'Master all Year 1 topics', emoji: '⭐', category: 'mastery', xpReward: 400 },
  { id: 'year2-master', name: 'Year 2 Champion', description: 'Master all Year 2 topics', emoji: '🌟', category: 'mastery', xpReward: 500 },
  { id: 'year3-master', name: 'Year 3 Champion', description: 'Master all Year 3 topics', emoji: '🔮', category: 'mastery', xpReward: 600 },
  { id: 'year4-master', name: 'Year 4 Champion', description: 'Master all Year 4 topics', emoji: '⚡', category: 'mastery', xpReward: 700 },
  { id: 'year5-master', name: 'Year 5 Champion', description: 'Master all Year 5 topics', emoji: '🌙', category: 'mastery', xpReward: 800 },
  { id: 'year6-master', name: 'Year 6 Grand Wizard!', description: 'Master all Year 6 topics — you\'re incredible!', emoji: '🏆', category: 'mastery', xpReward: 2000 },

  // Explorer
  { id: 'year-jumper', name: 'Year Jumper', description: 'Play a game from 3 different year groups', emoji: '🚀', category: 'explorer', xpReward: 100 },
  { id: 'game-variety', name: 'Magical Explorer', description: 'Play all 7 types of game', emoji: '🗺️', category: 'explorer', xpReward: 200 },
  { id: 'trick-learner', name: 'Trick Collector', description: 'View 5 maths tricks in the Trick Book', emoji: '📚', category: 'explorer', xpReward: 75 },
  { id: 'all-tricks', name: 'Master of Tricks', description: 'View all maths tricks', emoji: '🎩', category: 'mastery', xpReward: 300 },

  // Special / Secret
  { id: 'night-owl', name: 'Night Owl', description: 'Play after 8pm', emoji: '🦉', category: 'special', xpReward: 50, secret: true },
  { id: 'early-bird', name: 'Early Bird', description: 'Play before 7am', emoji: '🐦', category: 'special', xpReward: 50, secret: true },
  { id: 'comeback', name: 'Comeback Kid', description: 'Return after 7+ days away', emoji: '🎉', category: 'special', xpReward: 100, secret: true },
  { id: 'hundred-percent-streak', name: 'Triple Crown', description: 'Get 3 perfect scores in a row', emoji: '👑', category: 'accuracy', xpReward: 250 },
]

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}
