'use client'

import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useConnect, useAccount } from 'wagmi'


export function WalletConnect() {
  const [isMiniPay, setIsMiniPay] = useState(false)
  const [isAutoConnecting, setIsAutoConnecting] = useState(false)
  const { connect, connectors } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    // Check if MiniPay is available
    if (typeof window !== 'undefined' && window.ethereum?.isMiniPay) {
      console.log('🔍 MiniPay detected! Auto-connecting...')
      setIsMiniPay(true)
      setIsAutoConnecting(true)

      // Set a timeout to stop showing "CONNECTING..." after 5 seconds
      const timeoutId = setTimeout(() => {
        console.log('⏱️ MiniPay connection timeout - stopping auto-connect state')
        setIsAutoConnecting(false)
      }, 5000)

      // Find the injected connector from the config
      const injectedConnector = connectors.find(c => c.id === 'injected')

      if (!injectedConnector) {
        console.error('❌ Injected connector not found')
        clearTimeout(timeoutId)
        setIsAutoConnecting(false)
        return
      }

      // Auto-connect to MiniPay using the injected connector
      try {
        console.log('🔗 Connecting with injected connector...')
        connect(
          { connector: injectedConnector },
          {
            onSuccess: () => {
              console.log('✅ MiniPay connected successfully')
              clearTimeout(timeoutId)
              setIsAutoConnecting(false)
            },
            onError: (error) => {
              console.error('❌ Failed to auto-connect MiniPay:', error)
              clearTimeout(timeoutId)
              setIsAutoConnecting(false)
            }
          }
        )
        console.log('✅ MiniPay auto-connection initiated')
      } catch (error) {
        console.error('❌ Failed to auto-connect MiniPay:', error)
        clearTimeout(timeoutId)
        setIsAutoConnecting(false)
      }

      // Cleanup timeout on unmount
      return () => clearTimeout(timeoutId)
    }
  }, [connect, connectors])

  // Stop showing "CONNECTING..." if connection succeeds
  useEffect(() => {
    if (isConnected && isAutoConnecting) {
      setIsAutoConnecting(false)
    }
  }, [isConnected, isAutoConnecting])

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              // Show connecting state only while actively trying to connect
              if (isAutoConnecting) {
                return (
                  <div className="arcade-font" style={{
                    color: 'var(--neon-green)',
                    fontSize: '8px',
                    padding: '8px 16px'
                  }}>
                    CONNECTING...
                  </div>
                )
              }

              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="arcade-button pulse-glow"
                    style={{
                      color: 'var(--neon-green)',
                      fontSize: '12px',
                    }}
                  >
                    CONNECT WALLET
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="arcade-button"
                    style={{
                      color: 'var(--neon-red)',
                      fontSize: '10px',
                    }}
                  >
                    WRONG NETWORK
                  </button>
                )
              }

              return (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="arcade-button"
                    style={{
                      color: 'var(--neon-cyan)',
                      fontSize: '8px',
                      padding: '8px 16px',
                    }}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                          display: 'inline-block',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="arcade-button"
                    style={{
                      color: 'var(--neon-pink)',
                      fontSize: '8px',
                      padding: '8px 16px',
                    }}
                  >
                    {isMiniPay ? '📱 ' : ''}{account.displayName}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}