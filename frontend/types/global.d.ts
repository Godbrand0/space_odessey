// Global type declarations for the application

declare global {
  interface Window {
    ethereum?: {
      isMiniPay?: boolean
      isMetaMask?: boolean
      request?: (args: { method: string; params?: Array<any> }) => Promise<any>
    }
  }
}

export {}