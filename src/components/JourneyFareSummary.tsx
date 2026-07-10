import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { JourneyFareWithRoute } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';
import { GlassCard } from './GlassCard';

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

  return (
    <GlassCard
      padding={spacing.md}
      borderRadius={bentoRadius.card}
      style={[
        styles.fareCard,
        { overflow: 'hidden' }
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: color },
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
          fontWeight: '800',
          marginTop: spacing.xs,
        }}
      >
        {value}
      </Text>
      <Ionicons
        name={icon}
        size={80}
        color={color}
        style={{
          position: 'absolute',
          right: -10,
          bottom: -10,
          opacity: 0.1,
          transform: [{ rotate: '-15deg' }],
        }}
      />
    </GlassCard>
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
    gap: spacing.bentoGap,
    paddingHorizontal: spacing.base,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.bentoGap,
  },
  fareCard: {
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: bentoRadius.badge,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
