'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function WalletConnect() {
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
                    {account.displayName}
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