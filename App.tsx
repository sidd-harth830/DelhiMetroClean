import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { apiClient } from './src/api/client';
import { queryClient } from './src/api/queryClient';
import { DIProvider } from './src/di/DIContext';
import { createServiceContainer } from './src/di/container';
import { ThemeProvider, useAppTheme } from './src/theme';
import { RootTabs } from './src/navigation/RootTabs';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { AppUpdateDialog } from './src/components/AppUpdateDialog';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';
import { View, ActivityIndicator } from 'react-native';

const container = createServiceContainer(apiClient);

function AppNavigator() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If we have a user (including anonymous), show the main app
  if (user) {
    return <RootTabs />;
  }

  // Otherwise show login screen
  return <LoginScreen />;
}

import { startKeepAlive } from './src/utils/keepAlive';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://04e3db0423db831be6fe4d7377daa73b@o4510950049775616.ingest.us.sentry.io/4510950052855808',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

function AppInner() {
  const { paperTheme, navTheme } = useAppTheme();

  React.useEffect(() => {
    startKeepAlive();
  }, []);

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="auto" />
        <OfflineBanner />
        <AppNavigator />
        <AppUpdateDialog />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default Sentry.wrap(function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <DIProvider container={container}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <AppInner />
              </AuthProvider>
            </QueryClientProvider>
          </DIProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
});
