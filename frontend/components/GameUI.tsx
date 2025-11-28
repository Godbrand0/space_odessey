'use client'

import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
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
    } catch (error) {
      console.error('Failed to start game:', error)
    }
  }

  useEffect(() => {
    if (isConfirmed && receipt) {
      if (receipt.logs && receipt.logs.length > 0) {
        if (receipt.logs && receipt.logs.length > 0) {
          for (const log of receipt.logs) {
            if ((log as any).eventName === 'GameStarted') {
              if ((log as any).args && (log as any).args.length > 0) {
                const sessionId = (log as any).args[0]
                gameState.startNewGame(sessionId)
                return
              }
            }

            if (log.topics && log.topics.length > 0) {
              if (log.topics.length > 1) {
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
      // currentLevel has already been incremented by the game loop,
      // so we need to complete the previous level (currentLevel - 1)
      const completedLevel = gameState.currentLevel - 1
      const aliensDestroyed = 11 * completedLevel
      
      console.log('🎯 === LEVEL COMPLETION DEBUG ===')
      console.log('📊 Session ID:', gameState.sessionId.toString())
      console.log('📊 Completed Level:', completedLevel)
      console.log('📊 Current Level (in state):', gameState.currentLevel)
      console.log('📊 Levels Completed:', gameState.levelsCompleted)
      console.log('📊 Aliens Destroyed:', aliensDestroyed)
      console.log('📊 Score:', 100 * completedLevel)
      console.log('📊 Time Remaining:', gameState.timeRemaining, 'seconds')
      console.log('🎯 ============================')

      const proof = '0x' + '0'.repeat(64)

      await completeLevel(
        gameState.sessionId,
        completedLevel,
        100 * completedLevel,
        aliensDestroyed,
        proof as `0x${string}`
      )

      console.log('✅ Transaction submitted successfully')
      // Note: hash will be available in the hook's state, not returned directly
      gameState.refetchAll()
    } catch (error: any) {
      console.error('❌ Failed to complete level:', error)
      console.error('❌ Error message:', error?.message || 'Unknown error')
      
      // Show user-friendly error
      if (error?.message?.includes('User rejected')) {
        alert('Transaction cancelled')
      } else if (error?.message?.includes('insufficient funds')) {
        alert('Insufficient funds for gas')
      } else {
        alert(`Transaction failed: ${error?.message || 'Unknown error'}. Check console for details.`)
      }
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl neon-text arcade-font" style={{ color: 'var(--neon-cyan)' }}>
              SPACE
            </h1>
            <h1 className="text-6xl md:text-8xl neon-text arcade-font" style={{ color: 'var(--neon-pink)' }}>
              INVADERS
            </h1>
          </div>

          <div className="inline-block px-8 py-4 border-4 rainbow-border" style={{ borderColor: 'var(--neon-green)' }}>
            <p className="text-xl arcade-font" style={{ color: 'var(--neon-yellow)' }}>
              GAMEFI EDITION
            </p>
          </div>

          <div className="space-y-6 mt-12">
            <p className="text-lg arcade-font" style={{ color: 'var(--neon-green)', fontSize: '12px' }}>
              CONNECT WALLET TO START
            </p>
            <p className="text-lg arcade-font" style={{ color: 'var(--neon-green)', fontSize: '12px' }}>
              EARN CELO REWARDS
            </p>
          </div>

          <div className="mt-8">
            <WalletConnect />
          </div>

          <div className="mt-12 flex justify-center gap-4">
            <div className="text-center">
              <div className="text-4xl mb-2">👾</div>
              <p className="arcade-font text-xs" style={{ color: 'var(--neon-cyan)' }}>DESTROY</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <p className="arcade-font text-xs" style={{ color: 'var(--neon-pink)' }}>AIM</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <p className="arcade-font text-xs" style={{ color: 'var(--neon-yellow)' }}>EARN</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {/* Arcade Header */}
      <div className="mb-4 p-6 relative" style={{
        background: 'linear-gradient(180deg, rgba(26, 11, 46, 0.8) 0%, rgba(10, 10, 10, 0.8) 100%)',
        border: '3px solid var(--neon-cyan)',
        boxShadow: '0 0 20px var(--neon-cyan), inset 0 0 20px rgba(0, 240, 255, 0.1)'
      }}>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl neon-text arcade-font" style={{ color: 'var(--neon-cyan)', fontSize: '16px' }}>
              SPACE INVADERS
            </h1>
            <div className="arcade-font text-xs" style={{ color: 'var(--neon-green)' }}>
              <span style={{ color: 'var(--arcade-cyan)' }}>PLAYER:</span> {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="score-display" style={{ fontSize: '12px' }}>
              <span style={{ color: 'var(--arcade-cyan)' }}>LVL:</span> {gameState.currentLevel}/5
            </div>
            <div className="score-display" style={{ fontSize: '12px' }}>
              <span style={{ color: 'var(--arcade-cyan)' }}>TIME:</span> {gameState.timeRemaining}s
            </div>
            <div className="score-display" style={{ fontSize: '12px' }}>
              <span style={{ color: 'var(--arcade-yellow)' }}>REWARDS:</span> {formatEther(BigInt(gameState.totalRewardsEarned))}
            </div>
            <div className="score-display" style={{ fontSize: '12px' }}>
              <span style={{ color: 'var(--arcade-green)' }}>POOL:</span> {parseFloat(contractBalance).toFixed(2)}
            </div>
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Arcade Cabinet */}
      <div className="flex justify-center mb-6">
        <div className="relative cabinet-shadow" style={{
          background: 'linear-gradient(180deg, #1a0b2e 0%, #0a0a0a 100%)',
          padding: '20px',
          borderRadius: '20px',
          border: '8px solid var(--arcade-purple)',
          boxShadow: '0 0 40px var(--arcade-purple), inset 0 0 40px rgba(127, 44, 203, 0.2)'
        }}>
          {/* Screen Bezel */}
          <div className="relative" style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
            borderRadius: '12px',
            border: '4px solid var(--arcade-cyan)',
            boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.8)'
          }}>
            {/* CRT Screen */}
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="crt-screen"
              style={{
                borderRadius: '8px',
                display: 'block'
              }}
            />
          </div>

          {/* Control Panel Decoration */}
          <div className="mt-6 flex justify-center gap-4">
            <div className="w-16 h-16 rounded-full pulse-glow" style={{
              background: 'var(--arcade-red)',
              border: '4px solid #8b0000',
              boxShadow: '0 0 20px var(--arcade-red)'
            }}></div>
            <div className="w-16 h-16 rounded-full pulse-glow" style={{
              background: 'var(--arcade-green)',
              border: '4px solid #006400',
              boxShadow: '0 0 20px var(--arcade-green)'
            }}></div>
            <div className="w-16 h-16 rounded-full pulse-glow" style={{
              background: 'var(--arcade-yellow)',
              border: '4px solid #8b8b00',
              boxShadow: '0 0 20px var(--arcade-yellow)'
            }}></div>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex justify-center pb-8">
        {!gameState.game && gameState.gameStatus === 'idle' && (
          <button
            onClick={handleStartGame}
            disabled={isStartingGame}
            className="arcade-button"
            style={{
              color: 'var(--neon-green)',
              fontSize: '12px',
              opacity: isStartingGame ? 0.5 : 1
            }}
          >
            {isStartingGame ? 'STARTING...' : 'INSERT COIN'}
          </button>
        )}

        {gameState.isActive && (
          <button
            onClick={handleAbandonGame}
            disabled={isAbandoningGame}
            className="arcade-button"
            style={{
              color: 'var(--neon-red)',
              fontSize: '10px',
              opacity: isAbandoningGame ? 0.5 : 1,
              marginTop: '20px'
            }}
          >
            {isAbandoningGame ? 'ABORTING...' : 'ABORT MISSION'}
          </button>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex justify-between px-4 pb-8 md:hidden gap-4">
        <button
          className="flex-1 py-6 rounded-xl arcade-font text-xl active:scale-95 transition-transform select-none touch-none"
          style={{
            background: 'rgba(255, 0, 55, 0.2)',
            border: '2px solid var(--neon-pink)',
            color: 'var(--neon-pink)',
            boxShadow: '0 0 15px rgba(255, 0, 55, 0.3)'
          }}
          onPointerDown={() => {
            if (gameState.game) {
              gameState.game.setKey('ArrowLeft', true);
              gameState.game.setAutoShoot(true);
            }
          }}
          onPointerUp={() => {
            if (gameState.game) {
              gameState.game.setKey('ArrowLeft', false);
            }
          }}
          onPointerLeave={() => {
            if (gameState.game) {
              gameState.game.setKey('ArrowLeft', false);
            }
          }}
        >
          ⬅️ LEFT
        </button>
        
        <button
          className="flex-1 py-6 rounded-xl arcade-font text-xl active:scale-95 transition-transform select-none touch-none"
          style={{
            background: 'rgba(255, 0, 55, 0.2)',
            border: '2px solid var(--neon-pink)',
            color: 'var(--neon-pink)',
            boxShadow: '0 0 15px rgba(255, 0, 55, 0.3)'
          }}
          onPointerDown={() => {
            if (gameState.game) {
              gameState.game.setKey('ArrowRight', true);
              gameState.game.setAutoShoot(true);
            }
          }}
          onPointerUp={() => {
            if (gameState.game) {
              gameState.game.setKey('ArrowRight', false);
            }
          }}
          onPointerLeave={() => {
            if (gameState.game) {
              gameState.game.setKey('ArrowRight', false);
            }
          }}
        >
          RIGHT ➡️
        </button>
      </div>

      {/* Instructions Panel */}
      {gameState.gameStatus === 'idle' && (
        <div className="max-w-3xl mx-auto px-4 pb-8">
          <div className="relative p-6" style={{
            background: 'linear-gradient(180deg, rgba(26, 11, 46, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)',
            border: '3px solid var(--neon-pink)',
            borderRadius: '12px',
            boxShadow: '0 0 30px var(--neon-pink), inset 0 0 20px rgba(255, 0, 128, 0.1)'
          }}>
            <h3 className="text-2xl arcade-font neon-text mb-6 text-center" style={{ color: 'var(--neon-pink)', fontSize: '16px' }}>
              HOW TO PLAY
            </h3>
            <div className="space-y-4 arcade-font" style={{ fontSize: '10px' }}>
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--neon-cyan)' }}>◄►</span>
                <span style={{ color: 'var(--neon-green)' }}>ARROW KEYS TO MOVE</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--neon-cyan)' }}>▬</span>
                <span style={{ color: 'var(--neon-green)' }}>SPACEBAR TO FIRE</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--neon-yellow)' }}>👾</span>
                <span style={{ color: 'var(--neon-green)' }}>DESTROY ALL ALIENS</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--neon-yellow)' }}>💰</span>
                <span style={{ color: 'var(--neon-green)' }}>EARN 2 CELO PER LEVEL</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--neon-yellow)' }}>⏱</span>
                <span style={{ color: 'var(--neon-green)' }}>60 SECONDS PER LEVEL</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--neon-yellow)' }}>🏆</span>
                <span style={{ color: 'var(--neon-green)' }}>COMPLETE ALL 5 LEVELS = 10 CELO!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState.gameStatus === 'gameOver' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-2xl border-4 border-red-500 max-w-md w-full text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10"></div>
            <h2 className="text-4xl arcade-font text-red-500 mb-6 relative z-10 glitch-text">GAME OVER</h2>
            <p className="text-xl text-white mb-4 arcade-font relative z-10">
              LEVELS CLEARED: {gameState.levelsCompleted}
            </p>
            <p className="arcade-font" style={{ color: 'var(--neon-yellow)', fontSize: '14px' }}>
              EARNED: {formatEther(BigInt(gameState.totalRewardsEarned))} CELO
            </p>
            <div className="flex gap-4 justify-center mt-8 relative z-10">
              <button
                onClick={handleClaimRewards}
                disabled={isClaimingRewards || gameState.totalRewardsEarned === 0}
                className="px-6 py-3 bg-yellow-500/20 border-2 border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500/40 transition-colors arcade-font disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClaimingRewards ? 'CLAIMING...' : `CLAIM ${formatEther(BigInt(gameState.totalRewardsEarned))} CELO`}
              </button>
              <button
                onClick={gameState.resetGame}
                className="px-6 py-3 bg-red-500/20 border-2 border-red-500 text-red-500 rounded hover:bg-red-500/40 transition-colors arcade-font"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameState.gameStatus === 'victory' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-2xl border-4 border-green-500 max-w-md w-full text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10"></div>
            <h2 className="text-4xl arcade-font text-green-500 mb-6 relative z-10 glitch-text">VICTORY!</h2>
            <p className="text-xl text-white mb-4 arcade-font relative z-10">
              ALL LEVELS CONQUERED!
            </p>
            <p className="arcade-font score-display" style={{ fontSize: '16px', color: 'var(--neon-green)' }}>
              TOTAL: {formatEther(BigInt(gameState.totalRewardsEarned))} CELO
            </p>
            <button
              onClick={handleClaimRewards}
              disabled={isClaimingRewards || gameState.totalRewardsEarned === 0}
              className="mt-8 px-8 py-4 bg-green-500/20 border-2 border-green-500 text-green-500 rounded hover:bg-green-500/40 transition-colors arcade-font w-full relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaimingRewards ? 'CLAIMING...' : 'CLAIM ALL REWARDS'}
            </button>
          </div>
        </div>
      )}

      {/* Level Complete Modal */}
      {gameState.gameStatus === 'levelComplete' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-2xl border-4 border-blue-500 max-w-md w-full text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10"></div>
            <h2 className="text-3xl arcade-font text-blue-500 mb-6 relative z-10">LEVEL COMPLETE!</h2>
            <p className="text-lg text-white mb-2 arcade-font relative z-10">
              ALIENS DESTROYED! +2 CELO EARNED
            </p>
            <p className="arcade-font" style={{ color: 'var(--neon-cyan)', fontSize: '10px' }}>
              TOTAL EARNED: {Number(formatEther(BigInt(gameState.totalRewardsEarned))) + 2} CELO
            </p>
            <div className="flex gap-4 justify-center mt-8 relative z-10">
              <button
                onClick={handleCompleteLevel}
                disabled={isCompletingLevel}
                className="px-8 py-4 bg-blue-500/20 border-2 border-blue-500 text-blue-500 rounded hover:bg-blue-500/40 transition-colors arcade-font disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCompletingLevel ? (
                  <>
                    <span className="animate-spin">⏳</span> RECORDING...
                  </>
                ) : (
                  <>
                    <span>💾</span> RECORD LEVEL
                  </>
                )}
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-400 arcade-font">
              CLAIM ALL REWARDS AFTER GAME ENDS
            </p>
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
    </div>
  )
}
