'use client'

import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { useGameState } from '@/hooks/useGameState'
import { useStartGame, useCompleteLevel, useAbandonGame, useClaimRewards, useContractBalance } from '@/hooks/useSpaceInvadersContract'
import { WalletConnect } from './WalletConnect'
import { TransactionStatus } from './TransactionStatus'

export function GameUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { address, isConnected } = useAccount()
  const gameState = useGameState(canvasRef.current)
  
  const { startGame, isPending: isStartingGame, isConfirmed, receipt } = useStartGame()
  const { completeLevel, isPending: isCompletingLevel } = useCompleteLevel()
  const { abandonGame, isPending: isAbandoningGame } = useAbandonGame()
  const { claimRewards, isPending: isClaimingRewards } = useClaimRewards()
  const { balance: contractBalance } = useContractBalance()

  const handleStartGame = async () => {
    try {
      const hash = await startGame()
      
      // Note: The actual sessionId will be returned after transaction confirmation
      // We'll need to wait for the transaction to be mined and then get the session info
    } catch (error) {
      console.error('Failed to start game:', error)
    }
  }

  // Handle transaction confirmation and extract sessionId
  useEffect(() => {
    if (isConfirmed && receipt) {
      // Extract sessionId from transaction logs
      // The GameStarted event should contain the sessionId as the first parameter
      if (receipt.logs && receipt.logs.length > 0) {
        // Try to find the GameStarted event
        if (receipt.logs && receipt.logs.length > 0) {
          for (const log of receipt.logs) {
            // Try different ways to access the event data
            if ((log as any).eventName === 'GameStarted') {
              if ((log as any).args && (log as any).args.length > 0) {
                const sessionId = (log as any).args[0]
                gameState.startNewGame(sessionId)
                return
              }
            }
            
            // Alternative: Check if log has topics that match GameStarted event
            if (log.topics && log.topics.length > 0) {
              // The first topic should be the GameStarted event signature
              // The second topic (if exists) should contain the sessionId
              if (log.topics.length > 1) {
                // Convert the topic to a bigint (sessionId)
                const sessionId = BigInt(log.topics[1] as string)
                gameState.startNewGame(sessionId)
                return
              }
            }
          }
        }
      }
    }
  }, [isConfirmed, receipt, gameState.startNewGame])

  const handleCompleteLevel = async () => {
    if (!gameState.sessionId) return
    
    try {
      console.log('🎯 Completing level:', gameState.currentLevel)
      console.log('📊 Current game state before completion:', {
        sessionId: gameState.sessionId.toString(),
        currentLevel: gameState.currentLevel,
        levelsCompleted: gameState.levelsCompleted,
        totalRewardsEarned: gameState.totalRewardsEarned,
        isActive: gameState.isActive,
        isCompleted: gameState.isCompleted
      })
      
      // Generate proof (simplified - in production this would be more sophisticated)
      const proof = '0x' + '0'.repeat(64) // Placeholder proof
      
      const hash = await completeLevel(
        gameState.sessionId,
        gameState.currentLevel,
        100 * gameState.currentLevel, // Score based on level
        11 * gameState.currentLevel, // Aliens destroyed based on level
        proof as `0x${string}`
      )
      
      console.log('✅ Complete level transaction hash:', hash)
      gameState.refetchAll()
    } catch (error) {
      console.error('❌ Failed to complete level:', error)
    }
  }

  const handleAbandonGame = async () => {
    if (!gameState.sessionId) return
    
    try {
      await abandonGame(gameState.sessionId)
      gameState.stopGame()
      gameState.refetchAll()
    } catch (error) {
      console.error('Failed to abandon game:', error)
    }
  }

  const handleClaimRewards = async () => {
    if (!gameState.sessionId) return
    
    try {
      console.log('🎯 Claiming rewards for sessionId:', gameState.sessionId.toString())
      console.log('📊 Current game state:', {
        levelsCompleted: gameState.levelsCompleted,
        totalRewardsEarned: gameState.totalRewardsEarned,
        isActive: gameState.isActive,
        isCompleted: gameState.isCompleted,
        gameStatus: gameState.gameStatus
      })
      
      gameState.setClaimingStatus()
      const hash = await claimRewards(gameState.sessionId)
      console.log('✅ Claim rewards transaction hash:', hash)
      
      gameState.resetGame()
      gameState.refetchAll()
    } catch (error) {
      console.error('❌ Failed to claim rewards:', error)
      gameState.setClaimingStatus()
    }
  }

  const handleNextLevel = () => {
    gameState.nextLevel()
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-8">🎮 Space Invaders GameFi</h1>
        <p className="text-xl mb-8">Connect your wallet to start playing and earning CELO!</p>
        <WalletConnect />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold">🎮 Space Invaders</h1>
          <div className="text-sm">
            <span className="text-gray-400">Wallet:</span> {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-gray-400">Level:</span> {gameState.currentLevel}/5
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Time:</span> {gameState.timeRemaining}s
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Rewards:</span> {gameState.totalRewardsEarned} CELO
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Contract:</span> {parseFloat(contractBalance).toFixed(2)} CELO
          </div>
          <WalletConnect />
        </div>
      </div>

      {/* Game Canvas */}
      <div className="flex justify-center items-center py-8">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-700 bg-gray-900"
        />
      </div>

      {/* Game Controls */}
      <div className="flex justify-center space-x-4 pb-8">
        {!gameState.game && gameState.gameStatus === 'idle' && (
          <button
            onClick={handleStartGame}
            disabled={isStartingGame}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            {isStartingGame ? 'Starting...' : 'Start Game'}
          </button>
        )}

        {gameState.gameStatus === 'levelComplete' && (
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-3xl font-bold text-green-400 mb-2">🎉 Level {gameState.currentLevel - 1} Complete! 🎉</h2>
            <p className="text-xl text-white mb-4">Great job! You've destroyed all aliens and earned 2 CELO!</p>
            <div className="flex space-x-4">
              <button
                onClick={handleCompleteLevel}
                disabled={isCompletingLevel}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                {isCompletingLevel ? '⏳ Completing...' : '💰 Complete Level & Earn 2 CELO'}
              </button>
              <button
                onClick={handleNextLevel}
                disabled={isCompletingLevel}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105 opacity-50 cursor-not-allowed"
                style={{ display: isCompletingLevel ? 'none' : 'block' }}
              >
                {isCompletingLevel ? '⏭ Next Level' : '🚀 Next Level'}
              </button>
            </div>
          </div>
        )}

        {gameState.gameStatus === 'gameOver' && (
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-3xl font-bold text-red-400 mb-2">💀 Game Over! 💀</h2>
            <p className="text-xl text-white mb-2">You fought bravely and completed {gameState.levelsCompleted} levels!</p>
            <p className="text-lg text-yellow-400 mb-4">Earned: {gameState.totalRewardsEarned} CELO</p>
            <div className="flex space-x-4">
              <button
                onClick={handleClaimRewards}
                disabled={isClaimingRewards || gameState.totalRewardsEarned === 0}
                className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                {isClaimingRewards ? '⏳ Claiming...' : `💰 Claim ${gameState.totalRewardsEarned} CELO`}
              </button>
              <button
                onClick={gameState.resetGame}
                className="px-8 py-4 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        )}

        {gameState.gameStatus === 'victory' && (
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-4xl font-bold text-yellow-400 mb-2">🏆 CHAMPION! 🏆</h2>
            <p className="text-2xl text-white mb-2">Incredible! You've conquered all 5 levels!</p>
            <p className="text-xl text-green-400 mb-4">Total earned: {gameState.totalRewardsEarned} CELO</p>
            <button
              onClick={handleClaimRewards}
              disabled={isClaimingRewards}
              className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              {isClaimingRewards ? '⏳ Claiming...' : '🏆 Claim Your 10 CELO Prize!'}
            </button>
          </div>
        )}

        {gameState.isActive && (
          <button
            onClick={handleAbandonGame}
            disabled={isAbandoningGame}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            {isAbandoningGame ? 'Abandoning...' : 'Abandon Game'}
          </button>
        )}
      </div>

      {/* Instructions */}
      {gameState.gameStatus === 'idle' && (
        <div className="max-w-2xl mx-auto px-8 pb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">How to Play</h3>
            <div className="space-y-2 text-gray-300">
              <p>🎮 Use <span className="text-white font-semibold">Arrow Keys</span> to move your ship</p>
              <p>🔫 Press <span className="text-white font-semibold">Spacebar</span> to shoot</p>
              <p>👾 Destroy all aliens before time runs out</p>
              <p>💰 Earn <span className="text-green-400 font-semibold">2 CELO</span> per level completed</p>
              <p>⏱️ You have <span className="text-yellow-400 font-semibold">60 seconds</span> per level</p>
              <p>🏆 Complete all 5 levels to earn <span className="text-yellow-400 font-semibold">10 CELO</span> total!</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Status Notifications */}
      <TransactionStatus
        isPending={isStartingGame}
        isConfirming={false}
        isConfirmed={false}
        error={null}
        hash={null}
        pendingMessage="Starting game..."
      />
      
      <TransactionStatus
        isPending={isCompletingLevel}
        isConfirming={false}
        isConfirmed={false}
        error={null}
        hash={null}
        pendingMessage="Completing level..."
      />
      
      <TransactionStatus
        isPending={isAbandoningGame}
        isConfirming={false}
        isConfirmed={false}
        error={null}
        hash={null}
        pendingMessage="Abandoning game..."
      />
      
      <TransactionStatus
        isPending={isClaimingRewards}
        isConfirming={false}
        isConfirmed={false}
        error={null}
        hash={null}
        pendingMessage="Claiming rewards..."
      />
    </div>
  )
}
