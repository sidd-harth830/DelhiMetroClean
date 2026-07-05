export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://metro-routes-api.onrender.com/api/v2',
  apiKey: process.env.EXPO_PUBLIC_API_KEY ?? '',
  timeoutMs: 15_000,
  maxRetries: 2,
} as const;
