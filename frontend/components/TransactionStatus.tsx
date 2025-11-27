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

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`
        rounded-lg p-4 shadow-lg border
        ${error ? 'bg-red-900 border-red-700' : 
          isConfirmed ? 'bg-green-900 border-green-700' : 
          'bg-blue-900 border-blue-700'
        }
      `}>
        {error && (
          <div className="flex items-center space-x-2">
            <div className="text-red-400">⚠️</div>
            <div>
              <p className="font-semibold text-red-300">Transaction Failed</p>
              <p className="text-sm text-red-400">{error.message}</p>
            </div>
          </div>
        )}
        
        {isConfirming && (
          <div className="flex items-center space-x-2">
            <div className="text-blue-400 animate-spin">⏳</div>
            <div>
              <p className="font-semibold text-blue-300">Confirming Transaction</p>
              <p className="text-sm text-blue-400">{pendingMessage}</p>
            </div>
          </div>
        )}
        
        {isPending && !isConfirming && (
          <div className="flex items-center space-x-2">
            <div className="text-blue-400 animate-pulse">🔄</div>
            <div>
              <p className="font-semibold text-blue-300">Transaction Pending</p>
              <p className="text-sm text-blue-400">{pendingMessage}</p>
            </div>
          </div>
        )}
        
        {isConfirmed && !error && (
          <div className="flex items-center space-x-2">
            <div className="text-green-400">✅</div>
            <div>
              <p className="font-semibold text-green-300">Success!</p>
              <p className="text-sm text-green-400">{successMessage}</p>
              {hash && (
                <p className="text-xs text-green-500 mt-1">
                  Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}