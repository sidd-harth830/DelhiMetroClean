import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

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
    <View style={styles.container}>
      {OPTIONS.map((option, index) => {
        const isActive = active === option.value;
        return (
          <Pressable
            key={option.value}
            style={[
              styles.option,
              {
                backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
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
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 0,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
});
