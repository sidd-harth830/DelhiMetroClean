import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme';

interface Props {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text
        variant="titleMedium"
        style={{
          color: theme.colors.onSurface,
          fontWeight: '800',
          letterSpacing: 0.3,
        }}
      >
        {title}
      </Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text
            variant="labelLarge"
            style={{
              color: theme.colors.primary,
              fontWeight: '700',
              letterSpacing: 0.2,
            }}
          >
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
});
