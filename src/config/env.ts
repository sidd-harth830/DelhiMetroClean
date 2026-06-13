export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://siddharth730-delhi-metro-api.hf.space/api/v1', // Replace YOUR_USERNAME with your actual Hugging Face username
  timeoutMs: 15000,
} as const;
