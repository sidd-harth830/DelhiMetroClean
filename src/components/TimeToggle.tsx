import { StyleSheet, View } from 'react-native';
import { SegmentedButtons, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function TimeToggle({ value, onChange }: Props) {
  const theme = useTheme();
  const { isDark } = useAppTheme();

  return (
    <View style={styles.timeRow}>
      <Ionicons name="time-outline" size={16} color={theme.colors.onSurfaceVariant} />
      <View style={{ flex: 1 }}>
        <SegmentedButtons
          value={String(value)}
          onValueChange={(val) => onChange(Number(val))}
          // Custom outline color for dark mode
          theme={isDark ? { colors: { outline: 'rgba(255,255,255,0.15)' } } : undefined}
          buttons={[
            { label: 'Now', value: '0' },
            { label: '+15m', value: '15' },
            { label: '+30m', value: '30' },
            { label: '+1h', value: '60' },
          ].map((btn) => ({
            ...btn,
            showSelectedCheck: false,
          }))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});