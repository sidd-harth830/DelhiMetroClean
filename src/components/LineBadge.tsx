import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  name: string;
  color: string;
  compact?: boolean;
}

export function LineBadge({ name, color, compact }: Props) {
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
    borderRadius: 14,
    alignSelf: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
