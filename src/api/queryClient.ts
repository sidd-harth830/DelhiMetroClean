import { QueryClient } from '@tanstack/react-query';
import {
  ApiError,
  AuthenticationError,
  NetworkError,
  TimeoutError,
} from './errors';

/**
 * Determines whether a failed query should be retried.
 *
 * - 4xx client errors (except 429) → never retry
 * - Auth errors → never retry
 * - Network / timeout / 5xx / 429 → retry up to `failureCount` times
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;

  // Never retry auth errors
  if (error instanceof AuthenticationError) return false;

  // Retry network / timeout
  if (error instanceof NetworkError || error instanceof TimeoutError) return true;

  // Retry 5xx and 429
  if (error instanceof ApiError) {
    return error.statusCode >= 500 || error.statusCode === 429;
  }

  // Unknown errors — retry once
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: shouldRetry,
    },
  },
});
