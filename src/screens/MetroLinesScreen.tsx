import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useMetroLinesQuery } from '../hooks';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useAppTheme } from '../theme/ThemeContext';
import type { MetroLine } from '../types';
import type { LinesStackParamList } from '../navigation/types';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';
import { GlassCard } from '../components/GlassCard';
import { GradientBackground } from '../components/GradientBackground';

type Nav = NativeStackNavigationProp<LinesStackParamList, 'MetroLines'>;

function LineRow({ line }: { line: MetroLine }) {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { isDark, fonts } = useAppTheme();

  return (
    <GlassCard padding={0} borderRadius={bentoRadius.card} style={{ marginBottom: spacing.sm, marginHorizontal: spacing.base }}>
    <TouchableRipple
      onPress={() =>
        navigation.navigate('LineStations', {
          lineCode: line.line_code,
          lineName: line.name,
          lineColor: line.primary_color_code,
        })
      }
      rippleColor={theme.colors.surfaceVariant}
    >
      <View style={styles.row}>
        <View style={[styles.colorStrip, { backgroundColor: line.primary_color_code }]} />
        <View style={styles.rowContent}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: '600', fontFamily: fonts.heading }} numberOfLines={1}>
            {line.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }} numberOfLines={1}>
            {line.start_station} — {line.end_station}
          </Text>
        </View>
        <View style={[styles.codeBadge, { backgroundColor: isDark ? theme.colors.elevation.level3 : theme.colors.primaryContainer }]}>
          <Text variant="labelSmall" style={{ color: line.primary_color_code, fontWeight: '700' }}>
            {line.line_code}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.outline} />
      </View>
    </TouchableRipple>
    </GlassCard>
  );
}

export function MetroLinesScreen() {
  const { data, isLoading, isError, error, refetch } = useMetroLinesQuery();
  const theme = useTheme();

  if (isLoading) return <LoadingState message="Loading metro lines..." />;
  if (isError) return <ErrorState message="Could not load metro lines" error={error} onRetry={refetch} />;

  return (
    <GradientBackground>
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      style={{ flex: 1 }}
      renderItem={({ item }) => <LineRow line={item} />}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.tabBarClearance,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.base,
    gap: spacing.md,
    minHeight: 68,
  },
  colorStrip: {
    width: 5,
    alignSelf: 'stretch',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  rowContent: {
    flex: 1,
    paddingVertical: spacing.md,
    gap: 3,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
