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
      <View
        style={[
          styles.trainIcon,
          {
            backgroundColor: iconBg,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <Text
        variant="bodyMedium"
        style={{
          color: theme.colors.onSurface,
          flex: 1,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
      <Text
        variant="titleMedium"
        style={{
          color: theme.colors.primary,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
        }}
      >
        {time}
      </Text>
    </View>
  );
}

export function FirstLastTrainCard({ data }: Props) {
  const theme = useTheme();
  const { semantic, isDark } = useAppTheme();

  const firstTime = data.first_train?.endstation_from_first_train_estimated_time ?? '—';
  const lastTime = data.last_train?.endstation_from_last_train_estimated_time ?? '—';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Ionicons name="train-outline" size={18} color={theme.colors.primary} />
        <Text
          variant="titleSmall"
          style={{
            color: theme.colors.onSurface,
            fontWeight: '700',
          }}
        >
          Train Timings
        </Text>
      </View>
      <TrainRow
        label="First Train"
        time={firstTime}
        icon="sunny-outline"
        iconBg={semantic.yellow_line}
        theme={theme}
      />
      <View
        style={[
          styles.divider,
          {
            backgroundColor: theme.colors.surfaceVariant,
          },
        ]}
      />
      <TrainRow
        label="Last Train"
        time={lastTime}
        icon="moon-outline"
        iconBg={semantic.purple_line}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    padding: spacing.md,
    gap: spacing.md,
    marginHorizontal: spacing.base,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 48,
    opacity: 0.2,
  },
});
