'use client'

import { useEffect, useState } from 'react'
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'


/**
 * Hook to detect and auto-connect MiniPay wallet
 * MiniPay is Opera's built-in Celo wallet for mobile
 *
 * @returns Object containing isMiniPay status and auto-connect state
 */
export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false)
  const [isAutoConnecting, setIsAutoConnecting] = useState(false)
  const { connect } = useConnect()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if MiniPay wallet is available
    if (window.ethereum?.isMiniPay) {
      console.log('🔍 MiniPay wallet detected!')
      setIsMiniPay(true)
      setIsAutoConnecting(true)

      // Auto-connect to MiniPay
      // MiniPay requires implicit connection when the dapp loads
      try {
        connect({
          connector: injected({
            target: 'metaMask' // MiniPay uses MetaMask-compatible interface
          })
        })
        console.log('✅ MiniPay auto-connection initiated')

        // Reset auto-connecting state after a delay
        setTimeout(() => {
          setIsAutoConnecting(false)
        }, 2000)
      } catch (error) {
        console.error('❌ Failed to auto-connect MiniPay:', error)
        setIsAutoConnecting(false)
      }
    }
  }, [connect])

  return {
    isMiniPay,
    isAutoConnecting,
  }
}

/**
 * Check if the current environment is MiniPay
 * This is a synchronous check for use in non-hook contexts
 */
export function checkIsMiniPay(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.ethereum?.isMiniPay)
}
