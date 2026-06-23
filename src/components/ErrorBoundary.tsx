import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary that catches unhandled JS errors in the
 * React component tree and shows a friendly recovery screen
 * instead of a white/blank crash screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleRestart = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="warning-outline" size={48} color="#E53935" />
            </View>

            <Text variant="headlineSmall" style={styles.title}>
              Something Went Wrong
            </Text>

            <Text variant="bodyMedium" style={styles.message}>
              The app encountered an unexpected error. This has been logged and
              we'll work to fix it.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.devError}>
                <Text variant="labelSmall" style={styles.devErrorTitle}>
                  DEV ERROR:
                </Text>
                <Text variant="bodySmall" style={styles.devErrorText}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <Pressable style={styles.button} onPress={this.handleRestart}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text variant="labelLarge" style={styles.buttonText}>
                Restart App
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: bentoRadius.heroCard,
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(229, 57, 53, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  devError: {
    width: '100%',
    backgroundColor: 'rgba(229, 57, 53, 0.08)',
    borderRadius: 12,
    padding: spacing.md,
  },
  devErrorTitle: {
    color: '#E53935',
    fontWeight: '700',
    marginBottom: 4,
  },
  devErrorText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#E53935',
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: bentoRadius.button,
    marginTop: spacing.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
