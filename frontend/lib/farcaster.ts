import { sdk } from "@farcaster/miniapp-sdk";

/**
 * Check if the app is running inside a Farcaster MiniApp environment
 */
export function isInMiniApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check if we're in an iframe (MiniApps run in iframes)
    const inIframe = window.self !== window.top;
    
    // Check for Farcaster-specific context
    const hasFarcasterContext = sdk.context !== null;
    
    return inIframe && hasFarcasterContext;
  } catch (e) {
    return false;
  }
}

/**
 * Initialize the Farcaster SDK and notify that the app is ready
 * Call this after your app has fully loaded
 */
export async function initializeFarcasterSDK(): Promise<void> {
  if (!isInMiniApp()) {
    console.log('Not in MiniApp environment, skipping SDK initialization');
    return;
  }

  try {
    await sdk.actions.ready();
    console.log('Farcaster SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Farcaster SDK:', error);
  }
}

/**
 * Get an authentication token using Quick Auth
 * Returns a JWT that can be used for authenticated API calls
 */
export async function getAuthToken() {
  if (!isInMiniApp()) {
    console.warn('Quick Auth is only available in MiniApp environment');
    return null;
  }

  try {
    const token = await sdk.quickAuth.getToken();
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Trigger haptic feedback
 * @param type - Type of haptic feedback: 'light', 'medium', 'heavy', 'success', 'warning', 'error'
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'): void {
  if (!isInMiniApp()) return;

  try {
    switch (type) {
      case 'light':
        sdk.haptics.impactOccurred('light');
        break;
      case 'medium':
        sdk.haptics.impactOccurred('medium');
        break;
      case 'heavy':
        sdk.haptics.impactOccurred('heavy');
        break;
      case 'success':
        sdk.haptics.notificationOccurred('success');
        break;
      case 'warning':
        sdk.haptics.notificationOccurred('warning');
        break;
      case 'error':
        sdk.haptics.notificationOccurred('error');
        break;
      default:
        sdk.haptics.selectionChanged();
    }
  } catch (error) {
    console.error('Failed to trigger haptic feedback:', error);
  }
}

/**
 * Navigate back in the MiniApp
 */
export function navigateBack(): void {
  // Note: The Farcaster SDK doesn't currently expose a back() method
  // Fall back to standard browser history
  try {
    window.history.back();
  } catch (error) {
    console.error('Failed to navigate back:', error);
  }
}

/**
 * Sign in with Farcaster and get authentication credential
 */
export async function signInWithFarcaster() {
  if (!isInMiniApp()) {
    console.warn('Sign in with Farcaster is only available in MiniApp environment');
    return null;
  }

  try {
    // Generate a random nonce for the sign-in request
    const nonce = Math.random().toString(36).substring(2, 15);
    const credential = await sdk.actions.signIn({ nonce });
    return credential;
  } catch (error) {
    console.error('Failed to sign in with Farcaster:', error);
    return null;
  }
}

// Export the SDK instance for advanced usage
export { sdk };
