import { env } from '../config/env';
import { getApiKey, API_KEY_HEADER } from '../config/apiKeyProvider';
import {
  ApiError,
  AuthenticationError,
  NetworkError,
  TimeoutError,
} from './errors';

interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>;
  /** Override the default timeout for this request. */
  timeoutMs?: number;
  /** Override the default max-retry count for this request. */
  maxRetries?: number;
}

/** Milliseconds between retries: 1s, 2s, 4s, … */
function retryDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 8000);
}

function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 429;
}

export class ApiClient {
  private readonly _baseUrl: string;

  constructor(baseUrl = env.apiBaseUrl) {
    this._baseUrl = baseUrl;
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  private createUrl(path: string, query?: RequestOptions['query']): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this._baseUrl}${normalizedPath}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Build the default headers for every outbound request.
   * Includes the API key if one is configured.
   */
  private buildHeaders(extra?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    const apiKey = getApiKey();
    if (apiKey) {
      headers[API_KEY_HEADER] = apiKey;
    }

    // Merge any extra headers the caller passed.
    if (extra) {
      const entries =
        extra instanceof Headers
          ? Array.from(extra.entries())
          : Array.isArray(extra)
            ? extra
            : Object.entries(extra);
      for (const [k, v] of entries) {
        headers[k] = v;
      }
    }

    return headers;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = this.createUrl(path, options?.query);
    const timeoutMs = options?.timeoutMs ?? env.timeoutMs;
    const maxRetries = options?.maxRetries ?? 0;

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Abort controller for request timeout
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        if (__DEV__ && attempt === 0) {
          console.debug(`[ApiClient] GET ${path}`);
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: this.buildHeaders(options?.headers),
          signal: controller.signal,
          ...options,
          // Ensure our signal isn't overridden
        });

        clearTimeout(timer);

        // === Authentication errors — never retry ===
        if (response.status === 401 || response.status === 403) {
          let detail: string | undefined;
          try {
            const payload = (await response.json()) as any;
            if (payload?.error?.message) {
              detail = payload.error.description ? `${payload.error.message}: ${payload.error.description}` : payload.error.message;
            } else {
              detail = payload?.detail;
            }
          } catch {
            detail = undefined;
          }
          throw new AuthenticationError(response.status, detail);
        }

        // === Retryable server errors ===
        if (!response.ok) {
          let detail: string | undefined;
          try {
            const payload = (await response.json()) as any;
            if (payload?.error?.message) {
              detail = payload.error.description ? `${payload.error.message}: ${payload.error.description}` : payload.error.message;
            } else {
              detail = payload?.detail;
            }
          } catch {
            detail = undefined;
          }

          const error = new ApiError(
            detail ?? `Request failed with status ${response.status}`,
            response.status,
            detail,
          );

          // Only retry on 5xx / 429
          if (isRetryableStatus(response.status) && attempt < maxRetries) {
            lastError = error;
            if (__DEV__) {
              console.warn(
                `[ApiClient] Retryable ${response.status} on ${path}, attempt ${attempt + 1}/${maxRetries}`,
              );
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt)));
            continue;
          }

          throw error;
        }

        // === Success ===
        return (await response.json()) as T;
      } catch (error) {
        clearTimeout(timer);

        // Already classified — re-throw directly
        if (error instanceof AuthenticationError) {
          throw error;
        }
        if (error instanceof ApiError) {
          throw error;
        }

        // AbortController timeout
        if (error instanceof DOMException && error.name === 'AbortError') {
          const timeoutErr = new TimeoutError(timeoutMs);
          if (attempt < maxRetries) {
            lastError = timeoutErr;
            if (__DEV__) {
              console.warn(
                `[ApiClient] Timeout on ${path}, attempt ${attempt + 1}/${maxRetries}`,
              );
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt)));
            continue;
          }
          throw timeoutErr;
        }

        // Network errors (offline, DNS, etc.)
        if (error instanceof TypeError && /network|fetch/i.test(error.message)) {
          const networkErr = new NetworkError(undefined, error);
          if (attempt < maxRetries) {
            lastError = networkErr;
            if (__DEV__) {
              console.warn(
                `[ApiClient] Network error on ${path}, attempt ${attempt + 1}/${maxRetries}`,
              );
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt)));
            continue;
          }
          throw networkErr;
        }

        // Unknown error — wrap and throw
        if (attempt < maxRetries) {
          lastError = error;
          await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt)));
          continue;
        }

        throw error;
      }
    }

    // Should not reach here, but safety net
    throw lastError ?? new NetworkError('Request failed after all retries.');
  }
}

export const apiClient = new ApiClient();
