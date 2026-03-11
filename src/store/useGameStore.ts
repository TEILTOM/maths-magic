import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CharacterId } from '../data/characters'
import type { YearGroup, TopicId, Difficulty } from '../data/curriculum'
import { TOPICS, YEARS } from '../data/curriculum'

export interface TopicProgress {
  topicId: TopicId
  questionsAnswered: number
  correctAnswers: number
  mastery: number // 0-100
  lastPlayed: string // ISO date
  stars: number // 0-3
}

export interface GameSession {
  topicId: TopicId
  gameType: string
  score: number
  totalQuestions: number
  timeMs: number
  completedAt: string
}

export interface PlayerProfile {
  name: string
  characterId: CharacterId
  currentYear: YearGroup
  totalXP: number
  level: number
  streak: number
  lastPlayedDate: string
  streakShields: number
  topicProgress: Record<TopicId, TopicProgress>
  unlockedAchievements: string[]
  sessionHistory: GameSession[]
  gamesPlayedTotal: number
  unlockedCosmetics: string[]
  viewedTricks: string[]
  yearsPlayed: YearGroup[]
  gameTypesPlayed: string[]
}

// Tracks a game in progress so partial credit is awarded if the app is killed mid-game
export interface ActiveGame {
  topicId: TopicId
  gameType: string
  correctSoFar: number
  totalSoFar: number
  startedAt: string
}

export interface GameStoreState {
  profile: PlayerProfile | null
  currentTopicId: TopicId | null
  currentGameType: string | null
  currentDifficulty: Difficulty
  lastUnlockedAchievement: string | null
  showLevelUp: boolean
  newLevel: number
  // Persisted in-progress game — survived if app is killed mid-session
  activeGame: ActiveGame | null

  // Actions
  createProfile: (name: string, characterId: CharacterId, startYear: YearGroup) => void
  updateProfile: (updates: Partial<PlayerProfile>) => void
  setCurrentTopic: (topicId: TopicId | null, gameType: string | null) => void
  setDifficulty: (d: Difficulty) => void
  startActiveGame: (topicId: TopicId, gameType: string) => void
  recordActiveAnswer: (correct: boolean) => void
  completeGame: (session: Omit<GameSession, 'completedAt'>) => void
  recoverInterruptedGame: () => void
  unlockAchievement: (achievementId: string) => void
  addXP: (amount: number) => void
  checkAndUpdateStreak: () => void
  clearLastAchievement: () => void
  clearLevelUp: () => void
  markTrickViewed: (trickId: string) => void
  getTopicMastery: (topicId: TopicId) => number
  getYearMastery: (yearGroup: YearGroup) => number
  isYearUnlocked: (yearGroup: YearGroup) => boolean
}

const XP_PER_LEVEL = 500

function calcLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

const defaultProfile = (name: string, characterId: CharacterId, startYear: YearGroup): PlayerProfile => ({
  name,
  characterId,
  currentYear: startYear,
  totalXP: 0,
  level: 1,
  streak: 0,
  lastPlayedDate: '',
  streakShields: 1,
  topicProgress: {},
  unlockedAchievements: [],
  sessionHistory: [],
  gamesPlayedTotal: 0,
  unlockedCosmetics: [],
  viewedTricks: [],
  yearsPlayed: [startYear],
  gameTypesPlayed: [],
})

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      profile: null,
      currentTopicId: null,
      currentGameType: null,
      currentDifficulty: 'easy',
      lastUnlockedAchievement: null,
      showLevelUp: false,
      newLevel: 1,
      activeGame: null,

      createProfile: (name, characterId, startYear) => {
        set({ profile: defaultProfile(name, characterId, startYear) })
      },

      updateProfile: (updates) => {
        set(s => s.profile ? { profile: { ...s.profile, ...updates } } : s)
      },

      setCurrentTopic: (topicId, gameType) => {
        set({ currentTopicId: topicId, currentGameType: gameType })
      },

      setDifficulty: (d) => set({ currentDifficulty: d }),

      // Called when a game screen mounts — registers the session as "in progress"
      startActiveGame: (topicId, gameType) => {
        set({
          activeGame: {
            topicId,
            gameType,
            correctSoFar: 0,
            totalSoFar: 0,
            startedAt: new Date().toISOString(),
          },
        })
      },

      // Called on every answer — keeps localStorage always up to date
      recordActiveAnswer: (correct) => {
        set(s => s.activeGame ? {
          activeGame: {
            ...s.activeGame,
            correctSoFar: s.activeGame.correctSoFar + (correct ? 1 : 0),
            totalSoFar: s.activeGame.totalSoFar + 1,
          },
        } : s)
      },

      // Called on app boot — if activeGame exists the previous session was interrupted;
      // award partial credit so progress is never silently lost
      recoverInterruptedGame: () => {
        const { activeGame, completeGame } = get()
        if (!activeGame || activeGame.totalSoFar === 0) {
          set({ activeGame: null })
          return
        }
        // Award the partial score (no time bonus — we don't know elapsed time)
        completeGame({
          topicId: activeGame.topicId,
          gameType: activeGame.gameType,
          score: activeGame.correctSoFar,
          totalQuestions: activeGame.totalSoFar,
          timeMs: 999999, // no speed bonus for interrupted games
        })
        set({ activeGame: null })
      },

      addXP: (amount) => {
        const { profile } = get()
        if (!profile) return
        const oldLevel = profile.level
        const newXP = profile.totalXP + amount
        const newLevel = calcLevel(newXP)
        set(s => ({
          profile: s.profile ? { ...s.profile, totalXP: newXP, level: newLevel } : null,
          showLevelUp: newLevel > oldLevel,
          newLevel,
        }))
      },

      checkAndUpdateStreak: () => {
        const { profile } = get()
        if (!profile) return
        const today = getTodayString()
        const yesterday = getYesterdayString()

        if (profile.lastPlayedDate === today) return // already counted today

        let newStreak = profile.streak
        let newShields = profile.streakShields

        if (profile.lastPlayedDate === yesterday) {
          newStreak += 1
        } else if (profile.lastPlayedDate === '') {
          newStreak = 1
        } else {
          // Missed a day - use shield if available
          if (profile.streakShields > 0) {
            newShields -= 1
            newStreak += 1
          } else {
            newStreak = 1
          }
        }

        set(s => ({
          profile: s.profile ? {
            ...s.profile,
            streak: newStreak,
            lastPlayedDate: today,
            streakShields: newShields,
          } : null,
        }))
      },

      completeGame: (session) => {
        const { profile, addXP, checkAndUpdateStreak } = get()
        if (!profile) return

        const completedSession: GameSession = { ...session, completedAt: new Date().toISOString() }
        const accuracy = session.score / session.totalQuestions
        const xpEarned = Math.round(
          session.score * 10 +
          (accuracy === 1 ? 50 : 0) + // perfect bonus
          (session.timeMs < 60000 ? 20 : 0) // speed bonus
        )

        // Update topic progress
        const existing = profile.topicProgress[session.topicId] ?? {
          topicId: session.topicId, questionsAnswered: 0, correctAnswers: 0, mastery: 0, lastPlayed: '', stars: 0,
        }
        const newCorrect = existing.correctAnswers + session.score
        const newTotal = existing.questionsAnswered + session.totalQuestions
        const newMastery = Math.min(100, Math.round((newCorrect / Math.max(newTotal, 1)) * 100))
        const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.5 ? 1 : 0

        const newProgress: TopicProgress = {
          ...existing,
          questionsAnswered: newTotal,
          correctAnswers: newCorrect,
          mastery: newMastery,
          lastPlayed: new Date().toISOString(),
          stars: Math.max(existing.stars, stars),
        }

        const newGameTypes = profile.gameTypesPlayed.includes(session.gameType)
          ? profile.gameTypesPlayed
          : [...profile.gameTypesPlayed, session.gameType]

        set(s => ({
          profile: s.profile ? {
            ...s.profile,
            topicProgress: { ...s.profile.topicProgress, [session.topicId]: newProgress },
            sessionHistory: [...s.profile.sessionHistory.slice(-50), completedSession],
            gamesPlayedTotal: s.profile.gamesPlayedTotal + 1,
            gameTypesPlayed: newGameTypes,
          } : null,
          activeGame: null, // clear — game finished cleanly, no recovery needed
        }))

        addXP(xpEarned)
        checkAndUpdateStreak()
      },

      unlockAchievement: (achievementId) => {
        const { profile } = get()
        if (!profile || profile.unlockedAchievements.includes(achievementId)) return
        set(s => ({
          profile: s.profile ? {
            ...s.profile,
            unlockedAchievements: [...s.profile.unlockedAchievements, achievementId],
          } : null,
          lastUnlockedAchievement: achievementId,
        }))
      },

      clearLastAchievement: () => set({ lastUnlockedAchievement: null }),
      clearLevelUp: () => set({ showLevelUp: false }),

      markTrickViewed: (trickId) => {
        const { profile } = get()
        if (!profile || profile.viewedTricks.includes(trickId)) return
        set(s => ({
          profile: s.profile ? {
            ...s.profile,
            viewedTricks: [...s.profile.viewedTricks, trickId],
          } : null,
        }))
      },

      getTopicMastery: (topicId) => {
        const { profile } = get()
        return profile?.topicProgress[topicId]?.mastery ?? 0
      },

      getYearMastery: (yearGroup) => {
        const { profile } = get()
        if (!profile) return 0
        const yearTopics = TOPICS.filter(t => t.yearGroup === yearGroup)
        if (yearTopics.length === 0) return 0
        const total = yearTopics.reduce((sum, t) => sum + (profile.topicProgress[t.id]?.mastery ?? 0), 0)
        return Math.round(total / yearTopics.length)
      },

      isYearUnlocked: (yearGroup) => {
        const year = YEARS.find(y => y.id === yearGroup)
        if (!year?.unlockRequirement) return true
        const { yearGroup: reqYear, minMastery } = year.unlockRequirement
        return get().getYearMastery(reqYear) >= minMastery
      },
    }),
    {
      name: 'maths-magic-save',
      version: 1,
    }
  )
)
