/**
 * Centralized API key provider for secure API authentication.
 *
 * The key is read from EXPO_PUBLIC_API_KEY at build time.
 * Every outbound request should include the value via the
 * `X-API-Key` header — see `ApiClient` for the integration point.
 */

const API_KEY: string = process.env.EXPO_PUBLIC_API_KEY ?? '';

if (__DEV__ && !API_KEY) {
  console.warn(
    '[apiKeyProvider] EXPO_PUBLIC_API_KEY is not set. ' +
      'API requests will be sent without authentication. ' +
      'Set the key in your .env file.',
  );
}

/**
 * Returns the API key to attach to outbound requests.
 * Returns an empty string when the key is not configured.
 */
export function getApiKey(): string {
  return API_KEY;
}

/**
 * Returns the header name used for API key authentication.
 */
export const API_KEY_HEADER = 'X-API-Key';
