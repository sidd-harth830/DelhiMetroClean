import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Appbar, Button, Text, useTheme } from 'react-native-paper';
import { usePopularRoutesQuery, useNotificationsQuery, useStationPicker, useMetroLinesQuery } from '../hooks';
import type { SelectedStation } from '../hooks/useStationPicker';
import { StationPicker } from '../components/StationPicker';
import { SectionHeader } from '../components/SectionHeader';
import { TimeToggle } from '../components/TimeToggle';
import { NotificationCard } from '../components/NotificationCard';
import { useAppTheme } from '../theme/ThemeContext';
import type { HomeStackParamList } from '../navigation/types';
import { spacing } from '../theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { semantic, isDark } = useAppTheme();
  const fromPicker = useStationPicker();
  const toPicker = useStationPicker();
  const popularRoutes = usePopularRoutesQuery(5);
  const notifications = useNotificationsQuery();
  const linesQuery = useMetroLinesQuery();
  const disruptedLines = (linesQuery.data ?? []).filter(
    (l) => l.status.trim().toLowerCase() !== 'normal service',
  );
  const [departureOffsetMinutes, setDepartureOffsetMinutes] = useState(0);

  const canSearch = fromPicker.station && toPicker.station;

  const departureTime = useMemo(() => {
    if (departureOffsetMinutes === 0) return undefined;

    const future = new Date(Date.now() + departureOffsetMinutes * 60_000);
    const pad = (value: number) => String(value).padStart(2, '0');
    const ms = String(future.getMilliseconds()).padStart(3, '0');
    return `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}T${pad(future.getHours())}:${pad(future.getMinutes())}:${pad(future.getSeconds())}.${ms}`;
  }, [departureOffsetMinutes]);

  const handleFindRoute = () => {
    if (!fromPicker.station || !toPicker.station) return;
    navigation.navigate('JourneyResults', {
      fromCode: fromPicker.station.code,
      toCode: toPicker.station.code,
      fromName: fromPicker.station.name,
      toName: toPicker.station.name,
      journeyTime: departureTime,
    });
  };

  const handleSwap = useCallback(() => {
    const temp = fromPicker.station;
    fromPicker.setStation(toPicker.station);
    toPicker.setStation(temp);
  }, [fromPicker, toPicker]);

  const handlePopularRoute = (fromCode: string, toCode: string) => {
    navigation.navigate('JourneyResults', {
      fromCode,
      toCode,
      fromName: fromCode,
      toName: toCode,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header
        elevated={false}
        style={{
          backgroundColor: theme.colors.background,
          borderBottomWidth: 0,
        }}
      >
        <Appbar.Content
          title="Delhi Metro"
          subtitle="Plan your journey"
          titleStyle={{ fontWeight: '700', fontSize: 20 }}
          subtitleStyle={{ fontWeight: '500', fontSize: 13 }}
        />
      </Appbar.Header>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing['4xl'] }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Journey Planner Card - Premium Bento Box */}
        <View
          style={[
            styles.plannerCard,
            {
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          {/* Station inputs with connecting line */}
          <View style={styles.stationsBlock}>
            {/* Vertical connector on the left */}
            <View style={styles.connectorColumn}>
              <View style={[styles.connectorDot, { backgroundColor: semantic.success }]} />
              <View
                style={[
                  styles.connectorLine,
                  { backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.3 },
                ]}
              />
              <View style={[styles.connectorDot, { backgroundColor: semantic.error }]} />
            </View>

            {/* Input fields */}
            <View style={styles.inputsColumn}>
              <Pressable
                style={[
                  styles.stationInput,
                  {
                    backgroundColor: isDark
                      ? `${semantic.blue_line}15`
                      : `${semantic.blue_line}10`,
                  },
                ]}
                onPress={fromPicker.open}
              >
                <Text
                  variant="bodyLarge"
                  style={{
                    flex: 1,
                    color: fromPicker.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    fontWeight: fromPicker.station ? '600' : '500',
                  }}
                  numberOfLines={1}
                >
                  {fromPicker.station?.name ?? 'Where from?'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              </Pressable>

              <Pressable
                style={[
                  styles.stationInput,
                  {
                    backgroundColor: isDark
                      ? `${semantic.green_line}15`
                      : `${semantic.green_line}10`,
                  },
                ]}
                onPress={toPicker.open}
              >
                <Text
                  variant="bodyLarge"
                  style={{
                    flex: 1,
                    color: toPicker.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    fontWeight: toPicker.station ? '600' : '500',
                  }}
                  numberOfLines={1}
                >
                  {toPicker.station?.name ?? 'Where to?'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              </Pressable>
            </View>

            {/* Swap button */}
            <Pressable
              style={[
                styles.swapBtn,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={handleSwap}
            >
              <Ionicons name="swap-vertical" size={18} color="#000000" />
            </Pressable>
          </View>

          {/* Time toggle */}
          <View style={styles.timeSection}>
            <TimeToggle value={departureOffsetMinutes} onChange={setDepartureOffsetMinutes} />
          </View>

          {/* Find Route button */}
          <Button
            mode="contained"
            onPress={handleFindRoute}
            disabled={!canSearch}
            icon="navigation"
            style={styles.findButton}
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
          >
            Find Route
          </Button>
        </View>

        {/* Disruption Alert Banner */}
        {disruptedLines.length > 0 && (
          <Pressable
            style={[
              styles.disruptionBanner,
              {
                backgroundColor: isDark
                  ? `${semantic.warning}15`
                  : `${semantic.warning}10`,
              },
            ]}
            onPress={() => navigation.getParent()?.navigate('AlertsTab' as never)}
          >
            <View
              style={[
                styles.disruptionIcon,
                { backgroundColor: semantic.warning },
              ]}
            >
              <Ionicons name="warning" size={16} color="#000000" />
            </View>
            <View style={styles.disruptionContent}>
              <Text
                variant="labelLarge"
                style={{
                  color: semantic.warning,
                  fontWeight: '700',
                }}
              >
                Service Disruptions
              </Text>
              <View style={styles.disruptionChips}>
                {disruptedLines.slice(0, 4).map((line) => (
                  <View
                    key={line.id}
                    style={[
                      styles.disruptionChip,
                      { backgroundColor: line.primary_color_code },
                    ]}
                  >
                    <Text style={styles.disruptionChipText}>{line.line_code}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={semantic.warning} />
          </Pressable>
        )}

        {/* Popular Routes Section */}
        {(popularRoutes.data?.length ?? 0) > 0 && (
          <>
            <SectionHeader title="Popular Routes" />
            <View style={styles.popularList}>
              {popularRoutes.data!.map((route, index) => (
                <Pressable
                  key={route.routeKey}
                  style={[
                    styles.popularCard,
                    {
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  onPress={() => handlePopularRoute(route.fromStationCode, route.toStationCode)}
                >
                  <View
                    style={[
                      styles.popularIcon,
                      { backgroundColor: semantic.blue_line },
                    ]}
                  >
                    <Ionicons name="train" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.popularContent}>
                    <Text
                      style={{
                        fontWeight: '600',
                        color: theme.colors.onSurface,
                      }}
                    >
                      {route.fromStationCode} → {route.toStationCode}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.hitsBadge,
                      { backgroundColor: semantic.success },
                    ]}
                  >
                    <Text
                      variant="labelSmall"
                      style={{
                        color: '#000000',
                        fontWeight: '700',
                      }}
                    >
                      {route.hitCount}x
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Recent Notifications Section */}
        {(notifications.data?.length ?? 0) > 0 && (
          <>
            <SectionHeader title="Recent Alerts" />
            <View style={styles.notifList}>
              {notifications.data!.slice(0, 3).map((notif) => (
                <NotificationCard key={notif.id} notification={notif} />
              ))}
            </View>
          </>
        )}

        <StationPicker
          visible={fromPicker.visible}
          onSelect={fromPicker.select as (s: { code: string; name: string }) => void}
          onClose={fromPicker.close}
          title="Departure Station"
        />
        <StationPicker
          visible={toPicker.visible}
          onSelect={toPicker.select as (s: { code: string; name: string }) => void}
          onClose={toPicker.close}
          title="Destination Station"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  plannerCard: {
    borderRadius: 28,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  stationsBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  connectorColumn: {
    alignItems: 'center',
    gap: 0,
    paddingVertical: 8,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  connectorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
  },
  inputsColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  stationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    borderRadius: 18,
    gap: spacing.sm,
  },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSection: {
    marginTop: spacing.sm,
  },
  findButton: {
    borderRadius: 16,
    marginTop: spacing.md,
  },
  disruptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  disruptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disruptionContent: {
    flex: 1,
    gap: spacing.xs,
  },
  disruptionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  disruptionChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  disruptionChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  popularList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  popularCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 18,
    gap: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  popularIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularContent: {
    flex: 1,
  },
  hitsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  notifList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
});
