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
        { backgroundColor: color, borderColor: '#000000' },
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
    alignSelf: 'flex-start',
    borderWidth: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 3,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
