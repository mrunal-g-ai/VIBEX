/**
 * VIBEX Centralized API Service
 * Manages API endpoint URLs for both local development and distributed cross-platform builds
 * (Android, iOS, Windows, macOS, Linux).
 */

// Centralized configuration value: VITE_API_BASE_URL
// If unset, defaults to empty string which produces relative URLs (e.g. '/api/...') in web dev mode.
// In mobile/desktop apps, VITE_API_BASE_URL can be set to the remote backend (e.g. 'https://api.vibex.app' or 'http://192.168.1.X:5000').
export const API_BASE_URL: string =
  ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');

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
