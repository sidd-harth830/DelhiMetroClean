import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { bentoRadius } from '../theme/colors';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  name: string;
  color: string;
  compact?: boolean;
}

export function LineBadge({ name, color, compact }: Props) {
  const { isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color, shadowOpacity: isDark ? 0 : 0.1 },
        compact && styles.compact,
      ]}
    >
      <Text
        variant={compact ? 'labelSmall' : 'labelMedium'}
        style={styles.text}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: bentoRadius.icon,
    alignSelf: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});
