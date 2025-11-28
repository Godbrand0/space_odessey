'use client'

import { useEffect, useState } from 'react'

interface TransactionStatusProps {
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  error: Error | null
  hash: string | null
  successMessage?: string
  pendingMessage?: string
}

export function TransactionStatus({
  isPending,
  isConfirming,
  isConfirmed,
  error,
  hash,
  successMessage = 'Transaction completed successfully!',
  pendingMessage = 'Transaction in progress...',
}: TransactionStatusProps) {
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    if (isPending || isConfirming || error || isConfirmed) {
      setShowStatus(true)
    }
  }, [isPending, isConfirming, error, isConfirmed])

  useEffect(() => {
    if (isConfirmed && !error) {
      const timer = setTimeout(() => {
        setShowStatus(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isConfirmed, error])

  if (!showStatus) return null

  const getStatusColor = () => {
    if (error) return 'var(--neon-red)'
    if (isConfirmed) return 'var(--neon-green)'
    return 'var(--neon-cyan)'
  }

  const statusColor = getStatusColor()

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div
        className="arcade-font pulse-glow"
        style={{
          padding: '16px',
          background: 'linear-gradient(180deg, rgba(26, 11, 46, 0.95) 0%, rgba(10, 10, 10, 0.95) 100%)',
          border: `3px solid ${statusColor}`,
          borderRadius: '8px',
          boxShadow: `0 0 20px ${statusColor}, inset 0 0 20px rgba(0, 0, 0, 0.5)`,
          fontSize: '10px'
        }}
      >
        {error && (
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="neon-text" style={{ color: 'var(--neon-red)', marginBottom: '4px' }}>
                TRANSACTION FAILED
              </p>
              <p style={{ color: 'var(--arcade-pink)', fontSize: '8px' }}>
                {error.message}
              </p>
            </div>
          </div>
        )}

        {isConfirming && (
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-spin">⏳</div>
            <div>
              <p className="neon-text" style={{ color: 'var(--neon-cyan)', marginBottom: '4px' }}>
                CONFIRMING
              </p>
              <p style={{ color: 'var(--arcade-cyan)', fontSize: '8px' }}>
                {pendingMessage}
              </p>
            </div>
          </div>
        )}

        {isPending && !isConfirming && (
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-pulse">🔄</div>
            <div>
              <p className="neon-text" style={{ color: 'var(--neon-cyan)', marginBottom: '4px' }}>
                PROCESSING
              </p>
              <p style={{ color: 'var(--arcade-cyan)', fontSize: '8px' }}>
                {pendingMessage}
              </p>
            </div>
          </div>
        )}

        {isConfirmed && !error && (
          <div className="flex items-center gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <p className="neon-text" style={{ color: 'var(--neon-green)', marginBottom: '4px' }}>
                SUCCESS!
              </p>
              <p style={{ color: 'var(--arcade-green)', fontSize: '8px' }}>
                {successMessage}
              </p>
              {hash && (
                <p style={{ color: 'var(--arcade-cyan)', fontSize: '7px', marginTop: '4px' }}>
                  TX: {hash.slice(0, 10)}...{hash.slice(-8)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}