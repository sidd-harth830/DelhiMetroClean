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

function AppInner() {
  const { paperTheme, navTheme } = useAppTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="auto" />
        <AppNavigator />
        <AppUpdateDialog />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
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
  );
}
