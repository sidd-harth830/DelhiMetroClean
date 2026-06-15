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
          borderBottomWidth: 2,
          borderBottomColor: '#FFFFFF',
        }}
      >
        <Appbar.Content
          title="DELHI METRO"
          subtitle="PLAN YOUR JOURNEY"
          titleStyle={{ fontWeight: '900', letterSpacing: 1 }}
          subtitleStyle={{ fontWeight: '800', letterSpacing: 0.5 }}
        />
      </Appbar.Header>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing['4xl'] }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Journey Planner Card */}
        <View
          style={[
            styles.plannerSection,
            {
              backgroundColor: theme.colors.elevation.level2,
              borderColor: '#FFFFFF',
            },
          ]}
        >
          {/* Header accent bar */}
          <View style={[styles.plannerAccent, { backgroundColor: theme.colors.primary }]} />

          {/* Station inputs with connecting line */}
          <View style={styles.stationsBlock}>
            {/* Vertical connector on the left */}
            <View style={styles.connectorColumn}>
              <View style={[styles.connectorDot, { backgroundColor: semantic.success }]} />
              <View style={[styles.connectorLine, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.connectorDot, { backgroundColor: theme.colors.error }]} />
            </View>

            {/* Input fields */}
            <View style={styles.inputsColumn}>
              <Pressable
                style={[
                  styles.stationInput,
                  {
                    backgroundColor: fromPicker.station ? theme.colors.primary : theme.colors.secondary,
                    borderColor: '#FFFFFF',
                  },
                ]}
                onPress={fromPicker.open}
              >
                <Text
                  variant="bodyLarge"
                  style={{
                    flex: 1,
                    color: '#000000',
                    fontWeight: '800',
                    letterSpacing: 0.3,
                  }}
                  numberOfLines={1}
                >
                  {fromPicker.station?.name ?? 'Where from?'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#000000" />
              </Pressable>

              <Pressable
                style={[
                  styles.stationInput,
                  {
                    backgroundColor: toPicker.station ? theme.colors.primary : theme.colors.secondary,
                    borderColor: '#FFFFFF',
                  },
                ]}
                onPress={toPicker.open}
              >
                <Text
                  variant="bodyLarge"
                  style={{
                    flex: 1,
                    color: '#000000',
                    fontWeight: '800',
                    letterSpacing: 0.3,
                  }}
                  numberOfLines={1}
                >
                  {toPicker.station?.name ?? 'Where to?'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#000000" />
              </Pressable>
            </View>

            {/* Swap button on the right */}
            <Pressable
              style={[
                styles.swapBtn,
                {
                  backgroundColor: theme.colors.tertiary,
                  borderColor: '#FFFFFF',
                },
              ]}
              onPress={handleSwap}
            >
              <Ionicons name="swap-vertical" size={20} color="#000000" />
            </Pressable>
          </View>

          {/* Time chips row */}
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <TimeToggle value={departureOffsetMinutes} onChange={setDepartureOffsetMinutes} />
          </View>

          {/* Find Route button */}
          <Button
            mode="contained"
            onPress={handleFindRoute}
            disabled={!canSearch}
            icon="navigation"
            style={[
              styles.findButton,
              {
                backgroundColor: canSearch ? theme.colors.primary : theme.colors.elevation.level3,
              },
            ]}
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }}
            textColor="#000000"
          >
            FIND ROUTE
          </Button>
        </View>

        {/* Disruption banner */}
        {disruptedLines.length > 0 && (
          <Pressable
            style={[
              styles.disruptionBanner,
              { borderColor: '#FFB946' },
            ]}
            onPress={() => navigation.getParent()?.navigate('AlertsTab' as never)}
          >
            <View style={[styles.disruptionAccent, { backgroundColor: '#FFB946' }]} />
            <View style={styles.disruptionLeft}>
              <View style={[styles.disruptionIconWrap, { backgroundColor: '#FFB946' }]}>
                <Ionicons name="warning" size={18} color="#000000" />
              </View>
              <View style={styles.disruptionText}>
                <Text variant="labelLarge" style={{ color: '#FFB946', fontWeight: '900' }}>
                  DISRUPTIONS
                </Text>
                <View style={styles.disruptionChips}>
                  {disruptedLines.map((line) => (
                    <View
                      key={line.id}
                      style={[
                        styles.disruptionChip,
                        { backgroundColor: line.primary_color_code, borderColor: '#FFFFFF' },
                      ]}
                    >
                      <Text style={styles.disruptionChipText}>{line.line_code}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FFB946" />
          </Pressable>
        )}

        {/* Popular Routes */}
        {(popularRoutes.data?.length ?? 0) > 0 && (
          <>
            <SectionHeader title="POPULAR ROUTES" />
            <View style={styles.popularList}>
              {popularRoutes.data!.map((route, index) => (
                <Pressable
                  key={route.routeKey}
                  style={[
                    styles.popularCard,
                    {
                      backgroundColor: theme.colors.elevation.level2,
                      borderColor: '#FFFFFF',
                    },
                    index > 0 && { borderTopWidth: 0 },
                  ]}
                  onPress={() => handlePopularRoute(route.fromStationCode, route.toStationCode)}
                >
                  <Ionicons name="train" size={18} color={theme.colors.primary} />
                  <View style={styles.popularContent}>
                    <Text style={{ fontWeight: '800', color: theme.colors.onSurface }}>
                      {route.fromStationCode} → {route.toStationCode}
                    </Text>
                  </View>
                  <View style={[styles.hitsBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text
                      variant="labelSmall"
                      style={{ color: '#000000', fontWeight: '900' }}
                    >
                      {route.hitCount}x
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Recent Notifications */}
        {(notifications.data?.length ?? 0) > 0 && (
          <>
            <SectionHeader title="RECENT ALERTS" />
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
  // Planner
  plannerSection: {
    gap: spacing.md,
    borderWidth: 2,
    borderRadius: 0,
    overflow: 'hidden',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 8,
  },
  plannerAccent: {
    height: 6,
    width: '100%',
  },
  stationsBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  connectorColumn: {
    alignItems: 'center',
    gap: 0,
    paddingVertical: 4,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  connectorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connectorLine: {
    width: 3,
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
    borderRadius: 0,
    gap: spacing.sm,
    borderWidth: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 4,
  },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  findButton: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 6,
  },
  popularList: {
    gap: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 0,
    overflow: 'hidden',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 8,
  },
  popularCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderWidth: 2,
    borderTopWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  popularContent: {
    flex: 1,
  },
  hitsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifList: {
    gap: spacing.sm,
  },
  // Disruption banner
  disruptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 0,
    overflow: 'hidden',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 8,
  },
  disruptionAccent: {
    width: 6,
    alignSelf: 'stretch',
  },
  disruptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  disruptionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disruptionText: {
    gap: spacing.xs,
    flex: 1,
  },
  disruptionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  disruptionChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 2,
  },
  disruptionChipText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
});
