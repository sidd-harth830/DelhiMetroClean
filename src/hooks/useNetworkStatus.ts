import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { onlineManager } from '@tanstack/react-query';

import { env } from '../config/env';

/**
 * Monitors network connectivity using React Query's `onlineManager`.
 *
 * On React Native, `onlineManager` defaults to online. We augment it
 * with AppState monitoring — when the app comes to the foreground we
 * do a lightweight connectivity probe.
 */
export function useNetworkStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    // Listen to React Query's online state changes
    const unsubscribe = onlineManager.subscribe((online) => {
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // When the app comes to the foreground, do a lightweight
    // connectivity check by trying to reach the API.
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        fetch(`${env.apiBaseUrl}/dmrc/lines`, {
          method: 'HEAD',
          cache: 'no-store',
        })
          .then(() => {
            onlineManager.setOnline(true);
          })
          .catch(() => {
            onlineManager.setOnline(false);
          });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, []);

  return { isOnline };
}
