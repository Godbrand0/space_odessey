'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAccount } from 'wagmi'
import { useSessionInfo, usePlayerTotalRewards, useLevelTimeRemaining } from './useSpaceInvadersContract'
import { Game } from '@/lib/game/Game'
import {
  getCachedGameState,
  setCachedGameState,
  updateCachedGameState,
  calculateTimeRemaining,
  clearExpiredCaches,
} from '@/lib/gameStateCache'

interface GameState {
  game: Game | null
  sessionId: bigint | null
  currentLevel: number
  levelsCompleted: number
  totalRewardsEarned: number
  isActive: boolean
  isCompleted: boolean
  timeRemaining: number
  playerTotalRewards: string
  gameStatus: 'idle' | 'playing' | 'levelComplete' | 'gameOver' | 'victory' | 'claiming'
}

export function useGameState(canvas: HTMLCanvasElement | null) {
  const { address } = useAccount()
  const [gameState, setGameState] = useState<GameState>({
    game: null,
    sessionId: null,
    currentLevel: 1,
    levelsCompleted: 0,
    totalRewardsEarned: 0,
    isActive: false,
    isCompleted: false,
    timeRemaining: 60,
    playerTotalRewards: '0',
    gameStatus: 'idle',
  })

  // Client-side timer for time tracking (no blockchain polling)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Only fetch from blockchain when explicitly needed (not on interval)
  const { sessionInfo, isLoading: isSessionLoading, refetch: refetchSession } = useSessionInfo(gameState.sessionId)
  const { totalRewards, refetch: refetchRewards } = usePlayerTotalRewards(address || null)
  const { refetch: refetchTime } = useLevelTimeRemaining(gameState.sessionId)

  // Clear expired caches on mount
  useEffect(() => {
    clearExpiredCaches()
  }, [])

  // Update game state from contract data (only when explicitly fetched)
  useEffect(() => {
    if (sessionInfo && !isSessionLoading && Array.isArray(sessionInfo) && gameState.sessionId) {
      const updates = {
        currentLevel: Number(sessionInfo[1]),
        levelsCompleted: Number(sessionInfo[2]),
        totalRewardsEarned: Number(sessionInfo[3]),
        isActive: Boolean(sessionInfo[5]),
        isCompleted: Boolean(sessionInfo[6]),
      }
      
      setGameState(prev => ({
        ...prev,
        ...updates,
      }))

      // Update cache with blockchain data
      if (address) {
        updateCachedGameState(gameState.sessionId.toString(), {
          ...updates,
          playerAddress: address,
          levelStartTime: Date.now(), // Reset timer when syncing from blockchain
        })
      }
    }
  }, [sessionInfo, isSessionLoading, gameState.sessionId, address])

  // Update player total rewards
  useEffect(() => {
    if (totalRewards) {
      setGameState(prev => ({
        ...prev,
        playerTotalRewards: totalRewards,
      }))
    }
  }, [totalRewards])

  // Client-side timer for time tracking (replaces blockchain polling)
  useEffect(() => {
    if (gameState.isActive && gameState.gameStatus === 'playing') {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Start new timer
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (!prev.sessionId) return prev
          
          const cached = getCachedGameState(prev.sessionId.toString())
          if (cached) {
            const newTimeRemaining = calculateTimeRemaining(cached.levelStartTime)
            return {
              ...prev,
              timeRemaining: newTimeRemaining,
            }
          }
          return prev
        })
      }, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [gameState.isActive, gameState.gameStatus])

  // Initialize game
  const initializeGame = useCallback((sessionId: bigint, startLevel: number = 1) => {
    console.log('🎯 Initializing game with sessionId:', sessionId.toString(), 'and level:', startLevel)
    console.log('📱 Canvas available:', !!canvas)
    
    if (!canvas) {
      console.error('❌ Canvas not available for game initialization')
      return
    }

    // Try to load from cache first
    const cached = getCachedGameState(sessionId.toString())
    if (cached && address && cached.playerAddress === address) {
      console.log('📦 Loaded game state from cache')
      setGameState(prev => ({
        ...prev,
        sessionId,
        currentLevel: cached.currentLevel,
        levelsCompleted: cached.levelsCompleted,
        totalRewardsEarned: cached.totalRewardsEarned,
        isActive: cached.isActive,
        isCompleted: cached.isCompleted,
        timeRemaining: calculateTimeRemaining(cached.levelStartTime),
      }))
    }

    console.log('🎮 Creating new Game instance...')
    const game = new Game(
      canvas,
      {
        onLevelComplete: (level) => {
          console.log('🎉 Level completed:', level)
          setGameState(prev => ({
            ...prev,
            gameStatus: 'levelComplete',
            currentLevel: level + 1,
          }))
          // Only refetch from blockchain after level complete transaction
          // Don't call refetchSession() here - it will be called after transaction confirms
        },
        onGameOver: (levelsCompleted) => {
          console.log('💀 Game over with levels completed:', levelsCompleted)
          setGameState(prev => ({
            ...prev,
            gameStatus: 'gameOver',
            isActive: false,
          }))
          // Update cache
          if (address) {
            updateCachedGameState(sessionId.toString(), {
              isActive: false,
              playerAddress: address,
            })
          }
        },
        onTimeUpdate: (timeRemaining) => {
          // Update local state and cache
          setGameState(prev => ({
            ...prev,
            timeRemaining,
          }))
        },
      },
      startLevel
    )

    console.log('✅ Game instance created, updating state...')
    const newState = {
      game,
      sessionId,
      gameStatus: 'playing' as const,
      isActive: true,
    }
    
    setGameState(prev => ({
      ...prev,
      ...newState,
    }))

    // Initialize cache
    if (address) {
      setCachedGameState({
        sessionId: sessionId.toString(),
        currentLevel: startLevel,
        levelsCompleted: 0,
        totalRewardsEarned: 0,
        isActive: true,
        isCompleted: false,
        playerAddress: address,
        lastUpdated: Date.now(),
        levelStartTime: Date.now(),
        timeRemaining: 60,
      })
    }

    console.log('🚀 Starting game loop...')
    game.start()
  }, [canvas, address])

  // Start new game session
  const startNewGame = useCallback((sessionId: bigint) => {
    console.log('🎮 Starting new game with sessionId:', sessionId.toString())
    setGameState(prev => ({
      ...prev,
      sessionId,
      currentLevel: 1,
      levelsCompleted: 0,
      totalRewardsEarned: 0,
      isActive: true,
      isCompleted: false,
      gameStatus: 'playing',
    }))
    console.log('🚀 Initializing game...')
    initializeGame(sessionId, 1)
  }, [initializeGame])

  // Continue to next level
  const nextLevel = useCallback(() => {
    if (!gameState.game || !gameState.sessionId) return

    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
    }))

    // Update cache with new level
    if (address) {
      updateCachedGameState(gameState.sessionId.toString(), {
        currentLevel: gameState.currentLevel,
        levelStartTime: Date.now(), // Reset timer for new level
        playerAddress: address,
      })
    }

    gameState.game.nextLevel()
    // Refetch from blockchain after level complete transaction confirms
    refetchSession()
  }, [gameState.game, gameState.sessionId, gameState.currentLevel, address, refetchSession])

  // Stop game
  const stopGame = useCallback(() => {
    if (gameState.game) {
      gameState.game.stop()
    }
    setGameState(prev => ({
      ...prev,
      game: null,
      gameStatus: 'idle',
      isActive: false,
    }))
  }, [gameState.game])

  // Reset game state
  const resetGame = useCallback(() => {
    stopGame()
    setGameState(prev => ({
      ...prev,
      sessionId: null,
      currentLevel: 1,
      levelsCompleted: 0,
      totalRewardsEarned: 0,
      isActive: false,
      isCompleted: false,
      timeRemaining: 60,
      gameStatus: 'idle',
    }))
  }, [stopGame])

  // Set claiming status
  const setClaimingStatus = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'claiming',
    }))
  }, [])

  // Refetch all contract data (only call this after transactions confirm)
  const refetchAll = useCallback(() => {
    console.log('🔄 Manually refetching blockchain data...')
    refetchSession()
    refetchRewards()
    // Note: We don't refetch time since we use client-side timer
  }, [refetchSession, refetchRewards])

  return {
    ...gameState,
    initializeGame,
    startNewGame,
    nextLevel,
    stopGame,
    resetGame,
    setClaimingStatus,
    refetchAll,
    isSessionLoading,
  }
}