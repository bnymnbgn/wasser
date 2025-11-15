/**
 * Capacitor Utilities for Native Features
 * Provides cross-platform access to native device capabilities
 */

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Check if running on native platform (Android/iOS)
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Get current platform
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Check if specific plugin is available
 */
export const isPluginAvailable = (pluginName: string): boolean => {
  return Capacitor.isPluginAvailable(pluginName);
};

// ===== Haptic Feedback =====

/**
 * Trigger light haptic feedback (for UI interactions like button taps)
 */
export const hapticLight = async (): Promise<void> => {
  if (!isPluginAvailable('Haptics')) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Trigger medium haptic feedback (for significant actions)
 */
export const hapticMedium = async (): Promise<void> => {
  if (!isPluginAvailable('Haptics')) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Trigger heavy haptic feedback (for important events)
 */
export const hapticHeavy = async (): Promise<void> => {
  if (!isPluginAvailable('Haptics')) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Trigger success haptic feedback
 */
export const hapticSuccess = async (): Promise<void> => {
  if (!isPluginAvailable('Haptics')) return;

  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Trigger warning haptic feedback
 */
export const hapticWarning = async (): Promise<void> => {
  if (!isPluginAvailable('Haptics')) return;

  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Trigger error haptic feedback
 */
export const hapticError = async (): Promise<void> => {
  if (!isPluginAvailable('Haptics')) return;

  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Web fallback for haptic feedback using Vibration API
 */
export const vibrateWeb = (pattern: number | number[] = 10): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

/**
 * Universal vibration that works on both native and web
 */
export const vibrate = async (pattern: number | number[] = 10): Promise<void> => {
  if (isNativePlatform()) {
    await hapticLight();
  } else {
    vibrateWeb(pattern);
  }
};

// ===== Status Bar =====

/**
 * Set status bar style
 */
export const setStatusBarStyle = async (isDark: boolean): Promise<void> => {
  if (!isPluginAvailable('StatusBar')) return;

  try {
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  } catch (error) {
    console.warn('Status bar style update failed:', error);
  }
};

/**
 * Set status bar background color
 */
export const setStatusBarColor = async (color: string): Promise<void> => {
  if (!isPluginAvailable('StatusBar')) return;

  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.warn('Status bar color update failed:', error);
  }
};

/**
 * Hide status bar
 */
export const hideStatusBar = async (): Promise<void> => {
  if (!isPluginAvailable('StatusBar')) return;

  try {
    await StatusBar.hide();
  } catch (error) {
    console.warn('Status bar hide failed:', error);
  }
};

/**
 * Show status bar
 */
export const showStatusBar = async (): Promise<void> => {
  if (!isPluginAvailable('StatusBar')) return;

  try {
    await StatusBar.show();
  } catch (error) {
    console.warn('Status bar show failed:', error);
  }
};

// ===== Splash Screen =====

/**
 * Hide splash screen
 */
export const hideSplashScreen = async (): Promise<void> => {
  if (!isPluginAvailable('SplashScreen')) return;

  try {
    await SplashScreen.hide();
  } catch (error) {
    console.warn('Splash screen hide failed:', error);
  }
};

/**
 * Show splash screen
 */
export const showSplashScreen = async (): Promise<void> => {
  if (!isPluginAvailable('SplashScreen')) return;

  try {
    await SplashScreen.show();
  } catch (error) {
    console.warn('Splash screen show failed:', error);
  }
};

// ===== Combined Utilities =====

/**
 * Initialize app-wide Capacitor features
 * Call this in your root layout or app initialization
 */
export const initializeCapacitor = async (isDarkMode: boolean): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    // Set initial status bar style
    await setStatusBarStyle(isDarkMode);
    await setStatusBarColor(isDarkMode ? '#0F172A' : '#FFFFFF');

    // Hide splash screen after initialization
    await hideSplashScreen();
  } catch (error) {
    console.error('Capacitor initialization failed:', error);
  }
};
