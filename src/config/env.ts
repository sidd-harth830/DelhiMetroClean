export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://siddharth7307-delhi-metro-api.hf.space/api/v1',
  timeoutMs: 15000,
} as const;
