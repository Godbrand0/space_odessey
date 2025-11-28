'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import { celoSepolia } from 'wagmi/chains'
import { isInMiniApp } from '@/lib/farcaster'
import { useEffect, useState } from 'react'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false)

  useEffect(() => {
    // Check if we're in a MiniApp environment after mount
    setIsMiniApp(isInMiniApp())
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {isMiniApp ? (
          // In MiniApp mode, skip RainbowKit UI
          children
        ) : (
          // In standard mode, use RainbowKit
          <RainbowKitProvider initialChain={celoSepolia}>
            {children}
          </RainbowKitProvider>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  )
}