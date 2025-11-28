/**
 * Local game state cache utility
 * Stores game state in localStorage to reduce blockchain queries
 */

export interface CachedGameState {
  sessionId: string
  currentLevel: number
  levelsCompleted: number
  totalRewardsEarned: number
  isActive: boolean
  isCompleted: boolean
  playerAddress: string
  lastUpdated: number
  levelStartTime: number
  timeRemaining: number
}

const CACHE_KEY_PREFIX = 'space_invaders_game_'
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Get cached game state for a session
 */
export function getCachedGameState(sessionId: string): CachedGameState | null {
  try {
    const key = `${CACHE_KEY_PREFIX}${sessionId}`
    const cached = localStorage.getItem(key)
    
    if (!cached) {
      return null
    }

    const state: CachedGameState = JSON.parse(cached)
    
    // Check if cache is expired
    if (Date.now() - state.lastUpdated > CACHE_EXPIRY_MS) {
      localStorage.removeItem(key)
      return null
    }

    return state
  } catch (error) {
    console.error('Error reading game state cache:', error)
    return null
  }
}

/**
 * Save game state to cache
 */
export function setCachedGameState(state: CachedGameState): void {
  try {
    const key = `${CACHE_KEY_PREFIX}${state.sessionId}`
    const stateWithTimestamp = {
      ...state,
      lastUpdated: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(stateWithTimestamp))
  } catch (error) {
    console.error('Error saving game state cache:', error)
  }
}

/**
 * Update specific fields in cached game state
 */
export function updateCachedGameState(
  sessionId: string,
  updates: Partial<CachedGameState>
): void {
  const existing = getCachedGameState(sessionId)
  if (existing) {
    setCachedGameState({
      ...existing,
      ...updates,
      sessionId, // Ensure sessionId doesn't get overwritten
    })
  }
}

/**
 * Clear cached game state for a session
 */
export function clearCachedGameState(sessionId: string): void {
  try {
    const key = `${CACHE_KEY_PREFIX}${sessionId}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing game state cache:', error)
  }
}

/**
 * Clear all expired game state caches
 */
export function clearExpiredCaches(): void {
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()

    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        const cached = localStorage.getItem(key)
        if (cached) {
          try {
            const state: CachedGameState = JSON.parse(cached)
            if (now - state.lastUpdated > CACHE_EXPIRY_MS) {
              localStorage.removeItem(key)
            }
          } catch {
            // Invalid cache entry, remove it
            localStorage.removeItem(key)
          }
        }
      }
    })
  } catch (error) {
    console.error('Error clearing expired caches:', error)
  }
}

/**
 * Calculate current time remaining based on cached level start time
 */
export function calculateTimeRemaining(
  levelStartTime: number,
  levelTimeLimit: number = 60
): number {
  const elapsed = Math.floor((Date.now() - levelStartTime) / 1000)
  return Math.max(0, levelTimeLimit - elapsed)
}
