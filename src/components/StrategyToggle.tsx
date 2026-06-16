import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { bentoRadius } from '../theme/colors';

interface Props {
  active: 'least-distance' | 'minimum-interchange';
  onChange: (strategy: 'least-distance' | 'minimum-interchange') => void;
}

type RouteStrategy = 'least-distance' | 'minimum-interchange';

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
              {
                backgroundColor: isActive ? theme.colors.primary : 'transparent',
              },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              variant="labelLarge"
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              style={{
                color: isActive ? '#000000' : theme.colors.onSurface,
                fontWeight: '700',
                letterSpacing: 0.2,
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
    borderRadius: bentoRadius.card,
    overflow: 'hidden',
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: bentoRadius.button,
  },
});
