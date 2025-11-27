'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function WalletConnect() {
  return (
    <div className="flex justify-center p-4">
      <ConnectButton 
        showBalance={false}
        chainStatus="icon"
        accountStatus="address"
      />
    </div>
  )
}