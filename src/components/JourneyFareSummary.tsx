import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { JourneyFareWithRoute } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

interface Props {
  fare: JourneyFareWithRoute;
}

function FareCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent?: boolean;
}) {
  const theme = useTheme();

  const bg = accent ? theme.colors.primary : theme.colors.secondary;
  const fg = accent ? '#000000' : '#000000';

  return (
    <View
      style={[
        styles.fareCard,
        {
          backgroundColor: bg,
          borderColor: '#FFFFFF',
        },
      ]}
    >
      <Ionicons name={icon} size={24} color={fg} style={styles.fareIcon} />
      <Text
        variant="labelSmall"
        style={{ color: fg, opacity: 0.8, fontWeight: '600' }}
      >
        {label}
      </Text>
      <Text
        variant="headlineSmall"
        style={{ color: fg, fontWeight: '900', letterSpacing: 0.5 }}
      >
        {value}
      </Text>
    </View>
  );
}

export function JourneyFareSummary({ fare }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <FareCard
          icon="card-outline"
          label="Weekday"
          value={`₹${fare.weekday_fare}`}
          accent
        />
        <FareCard icon="card-outline" label="Weekend" value={`₹${fare.weekend_fare}`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fareCard: {
    flex: 1,
    borderRadius: 0,
    padding: spacing.base,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 8,
  },
  fareIcon: {
    marginBottom: spacing.xs,
  },
});
