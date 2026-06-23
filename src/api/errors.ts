/**
 * Base class for all API-related errors.
 */
export class ApiError extends Error {
  statusCode: number;
  detail?: string;

  constructor(message: string, statusCode: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

/**
 * Thrown when a network request times out (AbortController signal).
 */
export class TimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Thrown when the device appears to be offline or the server is unreachable.
 */
export class NetworkError extends Error {
  readonly cause?: unknown;

  constructor(message = 'Network request failed. Check your internet connection.', cause?: unknown) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

/**
 * Thrown when the server rejects the API key (HTTP 401 / 403).
 */
export class AuthenticationError extends ApiError {
  constructor(statusCode: number, detail?: string) {
    super(
      detail ?? 'Authentication failed. The API key may be invalid or expired.',
      statusCode,
      detail,
    );
    this.name = 'AuthenticationError';
  }
}

/**
 * Classifies an unknown thrown value into a user-friendly error category.
 */
export function classifyError(error: unknown): {
  type: 'timeout' | 'network' | 'auth' | 'server' | 'client' | 'unknown';
  message: string;
  retryable: boolean;
} {
  if (error instanceof TimeoutError) {
    return {
      type: 'timeout',
      message: 'The request timed out. Please check your connection and try again.',
      retryable: true,
    };
  }

  if (error instanceof NetworkError) {
    return {
      type: 'network',
      message: 'No internet connection. Please check your network and try again.',
      retryable: true,
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      type: 'auth',
      message: 'Authentication failed. Please restart the app or contact support.',
      retryable: false,
    };
  }

  if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      return {
        type: 'server',
        message: 'The server is temporarily unavailable. Please try again later.',
        retryable: true,
      };
    }
    return {
      type: 'client',
      message: error.detail ?? error.message,
      retryable: false,
    };
  }

  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    retryable: true,
  };
}
