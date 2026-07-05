import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme';

interface Props {
  message: string;
  error?: unknown;
  onRetry?: () => void;
}

export function ErrorState({ message, error, onRetry }: Props) {
  const theme = useTheme();

  // Extract technical details if it's an API Error
  const apiError = error as any;
  const isDetailedError = apiError && apiError.message && (apiError.statusCode || apiError.detail);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Ionicons name="alert-circle-outline" size={56} color={theme.colors.error} />
      
      <Text variant="titleLarge" style={{ color: theme.colors.onSurface, textAlign: 'center', marginTop: spacing.md, fontWeight: 'bold' }}>
        {message}
      </Text>

      {isDetailedError && (
        <Surface style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error }]} elevation={0}>
           {apiError.statusCode && (
             <Text variant="labelMedium" style={[styles.errorCode, { color: theme.colors.error }]}>
               ERROR {apiError.statusCode}
             </Text>
           )}
           <Text variant="titleMedium" style={{ color: theme.colors.onErrorContainer, fontWeight: '700', marginBottom: 6 }}>
             {apiError.message}
           </Text>
           {apiError.detail ? (
             <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer, opacity: 0.9, lineHeight: 22 }}>
               {apiError.detail}
             </Text>
           ) : null}
        </Surface>
      )}

      {!isDetailedError && typeof error === 'object' && error !== null && (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', opacity: 0.8, marginTop: spacing.sm }}>
          {(error as Error).message || 'An unexpected error occurred.'}
        </Text>
      )}

      {onRetry ? (
        <Button 
          mode="contained-tonal" 
          icon="refresh"
          onPress={onRetry} 
          buttonColor={theme.colors.secondaryContainer} 
          textColor={theme.colors.onSecondaryContainer}
          style={styles.retryButton}
        >
          Try Again
        </Button>
      ) : null}
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
  errorCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
    maxWidth: 400,
  },
  errorCode: {
    marginBottom: 6,
    letterSpacing: 1,
    fontWeight: '800',
  },
  retryButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  }
});
