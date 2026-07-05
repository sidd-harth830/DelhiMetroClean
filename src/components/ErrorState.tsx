import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { spacing } from '../theme';

interface Props {
  message: string;
  error?: unknown;
  onRetry?: () => void;
}

export function ErrorState({ message, error, onRetry }: Props) {
  const theme = useTheme();

  const handleReportBug = () => {
    if (error) {
      // Send the raw error directly to Sentry in the background!
      Sentry.captureException(error);
    }
    // Open the Sentry feedback dialog for the user to type what happened
    Sentry.showFeedbackWidget();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.error}15` }]}>
        <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
      </View>
      
      <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
        Oops! Something went wrong.
      </Text>

      <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
        {message || "We encountered an unexpected issue connecting to our servers."}
      </Text>

      <View style={styles.buttonRow}>
        {onRetry && (
          <Button 
            mode="contained" 
            icon="refresh"
            onPress={onRetry} 
            buttonColor={theme.colors.primary} 
            textColor={theme.colors.onPrimary}
            style={styles.actionButton}
          >
            Try Again
          </Button>
        )}
        <Button 
          mode="contained-tonal" 
          icon="bug"
          onPress={handleReportBug} 
          buttonColor={theme.colors.errorContainer} 
          textColor={theme.colors.onErrorContainer}
          style={styles.actionButton}
        >
          Report Bug
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    minWidth: 140,
  }
});
