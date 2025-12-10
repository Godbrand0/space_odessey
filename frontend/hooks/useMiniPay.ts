'use client'

import { useEffect, useState } from 'react'
import { useConnect, useAccount } from 'wagmi'


/**
 * Hook to detect and auto-connect MiniPay wallet
 * MiniPay is Opera's built-in Celo wallet for mobile
 *
 * @returns Object containing isMiniPay status and auto-connect state
 */
export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false)
  const [isAutoConnecting, setIsAutoConnecting] = useState(false)
  const { connect, connectors } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if MiniPay wallet is available
    if (window.ethereum?.isMiniPay) {
      console.log('🔍 MiniPay wallet detected!')
      setIsMiniPay(true)
      setIsAutoConnecting(true)

      // Find the injected connector
      const injectedConnector = connectors.find(c => c.id === 'injected')

      if (!injectedConnector) {
        console.error('❌ Injected connector not found')
        setIsAutoConnecting(false)
        return
      }

      // Auto-connect to MiniPay
      // MiniPay requires implicit connection when the dapp loads
      try {
        connect(
          { connector: injectedConnector },
          {
            onSuccess: () => {
              console.log('✅ MiniPay connected successfully')
              setIsAutoConnecting(false)
            },
            onError: (error) => {
              console.error('❌ Failed to auto-connect MiniPay:', error)
              setIsAutoConnecting(false)
            }
          }
        )
        console.log('✅ MiniPay auto-connection initiated')
      } catch (error) {
        console.error('❌ Failed to auto-connect MiniPay:', error)
        setIsAutoConnecting(false)
      }
    }
  }, [connect, connectors])

  // Stop auto-connecting state when connection succeeds
  useEffect(() => {
    if (isConnected && isAutoConnecting) {
      setIsAutoConnecting(false)
    }
  }, [isConnected, isAutoConnecting])

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
