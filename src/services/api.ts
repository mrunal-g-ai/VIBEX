/**
 * VIBEX Centralized API Service
 * Manages API endpoint URLs for both local development and distributed cross-platform builds
 * (Android, iOS, Windows, macOS, Linux).
 */

import { Capacitor } from '@capacitor/core';

// Centralized configuration value: VITE_API_BASE_URL
// If unset, defaults to empty string which produces relative URLs (e.g. '/api/...') in web dev mode.
// In mobile apps, VITE_API_BASE_URL can be set to the remote backend or falls back to host LAN IP on Wi-Fi.
const configuredBase = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export const API_BASE_URL: string =
  configuredBase ||
  (typeof window !== 'undefined' ? window.localStorage?.getItem('vibex_api_url') : '') ||
  (Capacitor.isNativePlatform() ? 'http://192.168.1.161:5000' : '');

/**
 * Returns a fully qualified or relative URL for a backend API endpoint.
 * Ensures compatibility whether running inside Tauri webview or standard browser.
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL}${cleanEndpoint}`;
  }
  return cleanEndpoint;
}
