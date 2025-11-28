'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { isInMiniApp } from '@/lib/farcaster'

/**
 * MiniApp-specific wallet connection component
 * Shows a simple connect button that uses the Farcaster connector
 */
export function MiniAppConnect() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Only show this component in MiniApp environment
  if (!isInMiniApp()) {
    return null
  }

  // Find the Farcaster MiniApp connector
  const miniAppConnector = connectors.find(
    (connector) => connector.id === 'farcasterMiniApp'
  )

  if (!miniAppConnector) {
    console.error('Farcaster MiniApp connector not found')
    return null
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg border border-cyan-500/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">Connected</span>
        </div>
        <div className="font-mono text-sm text-cyan-400">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-500/30 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg border border-cyan-500/30">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-cyan-400 mb-1">Connect Wallet</h3>
        <p className="text-sm text-gray-400">Connect to start playing</p>
      </div>
      <button
        onClick={() => connect({ connector: miniAppConnector })}
        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/50 transition-all transform hover:scale-105"
      >
        Connect Wallet
      </button>
    </div>
  )
}
