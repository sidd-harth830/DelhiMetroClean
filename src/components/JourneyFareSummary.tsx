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
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  const theme = useTheme();
  const { isDark } = useAppTheme();

  const cardBgColor = isDark ? `${color}15` : `${color}10`;

  return (
    <View
      style={[
        styles.fareCard,
        {
          backgroundColor: cardBgColor,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: color,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <Text
        variant="labelSmall"
        style={{
          color: theme.colors.onSurfaceVariant,
          fontWeight: '500',
          marginTop: spacing.xs,
        }}
      >
        {label}
      </Text>
      <Text
        variant="headlineSmall"
        style={{
          color: theme.colors.onSurface,
          fontWeight: '700',
          marginTop: spacing.xs,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function JourneyFareSummary({ fare }: Props) {
  const theme = useTheme();
  const { semantic } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <FareCard
          icon="card-outline"
          label="Weekday"
          value={`₹${fare.weekday_fare}`}
          color={semantic.blue_line}
        />
        <FareCard
          icon="card-outline"
          label="Weekend"
          value={`₹${fare.weekend_fare}`}
          color={semantic.orange_line}
        />
      </View>
      <View style={styles.row}>
        <FareCard
          icon="git-commit-outline"
          label="Stations"
          value={`${fare.stations}`}
          color={semantic.green_line}
        />
        <FareCard
          icon="time-outline"
          label="Time"
          value={fare.total_time}
          color={semantic.purple_line}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingHorizontal: spacing.base,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fareCard: {
    flex: 1,
    borderRadius: 20,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
