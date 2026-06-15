import { StyleSheet, View } from 'react-native';
import { Text, useTheme, type MD3Theme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { FirstLastTrainResponse } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

interface Props {
  data: FirstLastTrainResponse;
}

function TrainRow({
  label,
  time,
  icon,
  iconBg,
  theme,
}: {
  label: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  theme: MD3Theme;
}) {
  return (
    <View style={styles.trainRow}>
      <View style={[styles.trainIcon, { backgroundColor: iconBg, borderColor: '#FFFFFF' }]}>
        <Ionicons name={icon} size={18} color="#000000" />
      </View>
      <Text
        variant="bodyMedium"
        style={{
          color: theme.colors.onSurface,
          flex: 1,
          fontWeight: '700',
        }}
      >
        {label}
      </Text>
      <Text
        variant="titleMedium"
        style={{
          color: theme.colors.primary,
          fontWeight: '900',
          fontVariant: ['tabular-nums'],
          letterSpacing: 0.3,
        }}
      >
        {time}
      </Text>
    </View>
  );
}

export function FirstLastTrainCard({ data }: Props) {
  const theme = useTheme();
  const { isDark } = useAppTheme();

  const firstTime = data.first_train?.endstation_from_first_train_estimated_time ?? '—';
  const lastTime = data.last_train?.endstation_from_last_train_estimated_time ?? '—';
  const iconBg = theme.colors.secondary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.elevation.level2,
          borderColor: '#FFFFFF',
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Ionicons name="train-outline" size={18} color={theme.colors.primary} />
        <Text
          variant="titleSmall"
          style={{
            color: theme.colors.onSurface,
            fontWeight: '900',
            letterSpacing: 0.3,
          }}
        >
          TRAIN TIMINGS
        </Text>
      </View>
      <TrainRow label="First Train" time={firstTime} icon="sunny-outline" iconBg={iconBg} theme={theme} />
      <View
        style={[
          styles.divider,
          {
            backgroundColor: theme.colors.outlineVariant,
          },
        ]}
      />
      <TrainRow label="Last Train" time={lastTime} icon="moon-outline" iconBg={iconBg} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    borderWidth: 2,
    padding: spacing.base,
    gap: spacing.md,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  trainIcon: {
    width: 36,
    height: 36,
    borderRadius: 0,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 2,
    marginLeft: 48,
    opacity: 0.5,
  },
});
