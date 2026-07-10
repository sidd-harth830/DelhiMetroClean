import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class HostFunctionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public render() {
    if (this.state.hasError) {
      const isHostFunctionError = 
        this.state.errorMessage.includes('HostFunction') || 
        this.state.errorMessage.includes('Native module');

      if (isHostFunctionError) {
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Native Code Missing</Text>
            <Text style={styles.description}>
              The app crashed because it is trying to use new C++ native code (like Reanimated or Sentry) that doesn't exist in this binary.
            </Text>
            <Text style={styles.action}>
              {Constants.executionEnvironment === ExecutionEnvironment.StoreClient
                ? "You cannot run this app in Expo Go anymore because it requires custom native code."
                : "Please rebuild your Development Client using EAS Build (npx eas build) to include the latest native dependencies."}
            </Text>
            <Text style={styles.errorDetails}>Error: {this.state.errorMessage}</Text>
          </View>
        );
      }

      // If it's a different error, we can just throw it and let the main ErrorBoundary handle it
      throw new Error(this.state.errorMessage);
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  action: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 24,
  },
  errorDetails: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  }
});
