import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { RouteStrategy } from '../types';

interface Props {
  active: RouteStrategy;
  onChange: (strategy: RouteStrategy) => void;
}

const OPTIONS: { value: RouteStrategy; label: string }[] = [
  { value: 'least-distance', label: 'Shortest' },
  { value: 'minimum-interchange', label: 'Fewest Changes' },
];

export function StrategyToggle({ active, onChange }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      {OPTIONS.map((option) => {
        const isActive = active === option.value;
        return (
          <Pressable
            key={option.value}
            style={[
              styles.option,
              isActive && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              variant="labelLarge"
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              style={{
                color: isActive ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                fontWeight: isActive ? '700' : '500',
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 30,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 30,
  },
});
