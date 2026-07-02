import { AppState, AppStateStatus } from 'react-native';
import { apiClient } from '../api/client';

/**
 * Pings the API every 14 minutes to prevent the Render free-tier from sleeping.
 * The Render free-tier sleeps after 15 minutes of inactivity.
 * This will only run while the app is in the foreground.
 */

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

let keepAliveInterval: NodeJS.Timeout | null = null;
let currentAppState = AppState.currentState;

const pingApi = async () => {
  try {
    if (__DEV__) {
      console.log('[keepAlive] Pinging API to prevent sleep...');
    }
    // Ping a lightweight endpoint. Pinging the lines endpoint is cheap enough as it's cached on the server.
    await apiClient.get('/dmrc/lines', {
      timeoutMs: 5000,
      maxRetries: 0,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[keepAlive] Ping failed:', error);
    }
  }
};

const startPinging = () => {
  if (!keepAliveInterval) {
    pingApi(); // Initial ping immediately when foregrounded
    keepAliveInterval = setInterval(pingApi, PING_INTERVAL_MS);
  }
};

const stopPinging = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
};

const handleAppStateChange = (nextAppState: AppStateStatus) => {
  if (
    currentAppState.match(/inactive|background/) &&
    nextAppState === 'active'
  ) {
    // App has come to the foreground!
    startPinging();
  } else if (nextAppState.match(/inactive|background/)) {
    // App has gone to the background!
    stopPinging();
  }
  currentAppState = nextAppState;
};

export const startKeepAlive = () => {
  if (currentAppState === 'active') {
    startPinging();
  }
  AppState.addEventListener('change', handleAppStateChange);
};
