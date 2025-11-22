/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and Fingerprint authentication
 */

import { storage } from './storage';

// Biometric types
export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricResult {
  success: boolean;
  error?: string;
  errorCode?: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  biometricType: BiometricType;
  isEnrolled: boolean;
}

// Storage keys for biometric settings
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

// Biometric service - platform-independent interface
// Actual implementation would use expo-local-authentication
class BiometricService {
  private capabilities: BiometricCapabilities | null = null;

  // Check if biometrics are available on device
  async checkCapabilities(): Promise<BiometricCapabilities> {
    // This would use expo-local-authentication in real implementation
    // For now, return mock capabilities
    this.capabilities = {
      isAvailable: true,
      biometricType: 'facial', // or 'fingerprint' on Android
      isEnrolled: true,
    };

    return this.capabilities;
  }

  // Get friendly name for biometric type
  getBiometricName(type: BiometricType): string {
    switch (type) {
      case 'facial':
        return 'Face ID';
      case 'fingerprint':
        return 'Touch ID';
      case 'iris':
        return 'Iris Scan';
      default:
        return 'Biometrics';
    }
  }

  // Authenticate using biometrics
  async authenticate(options?: {
    promptMessage?: string;
    cancelLabel?: string;
    fallbackLabel?: string;
    disableDeviceFallback?: boolean;
  }): Promise<BiometricResult> {
    const capabilities = await this.checkCapabilities();

    if (!capabilities.isAvailable || !capabilities.isEnrolled) {
      return {
        success: false,
        error: 'Biometrics not available',
        errorCode: 'NOT_AVAILABLE',
      };
    }

    // This would use LocalAuthentication.authenticateAsync() in real implementation
    // Mock successful authentication for development
    try {
      // Simulated biometric check
      const result = {
        success: true,
        error: undefined,
        errorCode: undefined,
      };

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        errorCode: 'AUTH_FAILED',
      };
    }
  }

  // Check if biometric login is enabled
  async isBiometricLoginEnabled(): Promise<boolean> {
    const enabled = await storage.get<boolean>(BIOMETRIC_ENABLED_KEY);
    return enabled === true;
  }

  // Enable biometric login
  async enableBiometricLogin(credentials: { email: string; token: string }): Promise<boolean> {
    const capabilities = await this.checkCapabilities();

    if (!capabilities.isAvailable || !capabilities.isEnrolled) {
      return false;
    }

    // Verify user with biometrics before enabling
    const authResult = await this.authenticate({
      promptMessage: 'Verify to enable biometric login',
    });

    if (!authResult.success) {
      return false;
    }

    // Store encrypted credentials (in real app, use SecureStore)
    await storage.set(BIOMETRIC_CREDENTIALS_KEY, credentials);
    await storage.set(BIOMETRIC_ENABLED_KEY, true);

    return true;
  }

  // Disable biometric login
  async disableBiometricLogin(): Promise<void> {
    await storage.remove(BIOMETRIC_CREDENTIALS_KEY);
    await storage.set(BIOMETRIC_ENABLED_KEY, false);
  }

  // Get stored credentials after biometric auth
  async getStoredCredentials(): Promise<{ email: string; token: string } | null> {
    const isEnabled = await this.isBiometricLoginEnabled();

    if (!isEnabled) {
      return null;
    }

    // Authenticate before returning credentials
    const authResult = await this.authenticate({
      promptMessage: 'Authenticate to login',
    });

    if (!authResult.success) {
      return null;
    }

    return storage.get<{ email: string; token: string }>(BIOMETRIC_CREDENTIALS_KEY);
  }

  // Authenticate and perform action
  async authenticateAndRun<T>(
    action: () => Promise<T>,
    options?: {
      promptMessage?: string;
      fallbackToPassword?: boolean;
    }
  ): Promise<{ success: boolean; result?: T; error?: string }> {
    const authResult = await this.authenticate({
      promptMessage: options?.promptMessage || 'Authenticate to continue',
    });

    if (!authResult.success) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    try {
      const result = await action();
      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Action failed',
      };
    }
  }
}

export const biometricService = new BiometricService();

// React hook for biometric state (would be in hooks package)
export interface UseBiometricReturn {
  isAvailable: boolean;
  isEnabled: boolean;
  biometricType: BiometricType;
  biometricName: string;
  loading: boolean;
  authenticate: () => Promise<BiometricResult>;
  enable: (credentials: { email: string; token: string }) => Promise<boolean>;
  disable: () => Promise<void>;
}

// Helper to determine if biometrics should be shown
export async function shouldShowBiometricOption(): Promise<boolean> {
  const capabilities = await biometricService.checkCapabilities();
  return capabilities.isAvailable && capabilities.isEnrolled;
}

// Helper to get biometric prompt message based on platform/type
export function getBiometricPromptMessage(type: BiometricType, action: string): string {
  const biometricName = biometricService.getBiometricName(type);
  return `Use ${biometricName} to ${action}`;
}
