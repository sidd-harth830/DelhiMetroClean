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
        { backgroundColor: color },
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
