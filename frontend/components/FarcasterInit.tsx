'use client'

import { useEffect } from 'react'
import { initializeFarcasterSDK } from '@/lib/farcaster'

/**
 * Client component that initializes the Farcaster SDK
 * Must be called after the app is fully loaded
 */
export function FarcasterInit() {
  useEffect(() => {
    // Initialize Farcaster SDK after mount
    initializeFarcasterSDK()
  }, [])

  return null
}
