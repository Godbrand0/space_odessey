'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useSessionInfo, usePlayerTotalRewards, useLevelTimeRemaining } from './useSpaceInvadersContract'
import { Game } from '@/lib/game/Game'

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

  const { sessionInfo, isLoading: isSessionLoading, refetch: refetchSession } = useSessionInfo(gameState.sessionId)
  const { totalRewards, refetch: refetchRewards } = usePlayerTotalRewards(address || null)
  const { timeRemaining: contractTimeRemaining, refetch: refetchTime } = useLevelTimeRemaining(gameState.sessionId)

  // Update game state from contract data
  useEffect(() => {
    if (sessionInfo && !isSessionLoading && Array.isArray(sessionInfo)) {
      setGameState(prev => ({
        ...prev,
        currentLevel: Number(sessionInfo[1]),
        levelsCompleted: Number(sessionInfo[2]),
        totalRewardsEarned: Number(sessionInfo[3]),
        isActive: Boolean(sessionInfo[5]),
        isCompleted: Boolean(sessionInfo[6]),
      }))
    }
  }, [sessionInfo, isSessionLoading])

  // Update player total rewards
  useEffect(() => {
    if (totalRewards) {
      setGameState(prev => ({
        ...prev,
        playerTotalRewards: totalRewards,
      }))
    }
  }, [totalRewards])

  // Update time remaining from contract
  useEffect(() => {
    if (contractTimeRemaining !== undefined) {
      setGameState(prev => ({
        ...prev,
        timeRemaining: contractTimeRemaining,
      }))
    }
  }, [contractTimeRemaining])

  // Initialize game
  const initializeGame = useCallback((sessionId: bigint, startLevel: number = 1) => {
    console.log('🎯 Initializing game with sessionId:', sessionId.toString(), 'and level:', startLevel)
    console.log('📱 Canvas available:', !!canvas)
    
    if (!canvas) {
      console.error('❌ Canvas not available for game initialization')
      return
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
          refetchSession()
        },
        onGameOver: (levelsCompleted) => {
          console.log('💀 Game over with levels completed:', levelsCompleted)
          setGameState(prev => ({
            ...prev,
            gameStatus: 'gameOver',
            isActive: false,
          }))
          refetchSession()
        },
        onTimeUpdate: (timeRemaining) => {
          // Don't log every time update to avoid spam
          setGameState(prev => ({
            ...prev,
            timeRemaining,
          }))
        },
      },
      startLevel
    )

    console.log('✅ Game instance created, updating state...')
    setGameState(prev => ({
      ...prev,
      game,
      sessionId,
      gameStatus: 'playing',
      isActive: true,
    }))

    console.log('🚀 Starting game loop...')
    game.start()
  }, [canvas, refetchSession])

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

    gameState.game.nextLevel()
    refetchSession()
  }, [gameState.game, gameState.sessionId, refetchSession])

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

  // Refetch all contract data
  const refetchAll = useCallback(() => {
    refetchSession()
    refetchRewards()
    refetchTime()
  }, [refetchSession, refetchRewards, refetchTime])

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