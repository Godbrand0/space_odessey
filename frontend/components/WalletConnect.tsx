'use client'

import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'


export function WalletConnect() {
  const [isMiniPay, setIsMiniPay] = useState(false)
  const { connect } = useConnect()

  useEffect(() => {
    // Check if MiniPay is available
    if (typeof window !== 'undefined' && window.ethereum?.isMiniPay) {
      console.log('🔍 MiniPay detected! Auto-connecting...')
      setIsMiniPay(true)

      // Auto-connect to MiniPay
      try {
        connect({
          connector: injected({
            target: 'metaMask' // MiniPay uses MetaMask-compatible interface
          })
        })
        console.log('✅ MiniPay auto-connection initiated')
      } catch (error) {
        console.error('❌ Failed to auto-connect MiniPay:', error)
      }
    }
  }, [connect])

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
              // Hide connect button if MiniPay is detected and not connected yet
              if (!connected && isMiniPay) {
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