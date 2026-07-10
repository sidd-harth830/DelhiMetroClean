import { useMemo, useRef, useState, useEffect } from 'react';
import { Animated, PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Surface, Text, useTheme } from 'react-native-paper';
import { useJourneyPlanCachedQuery, useMetroLinesQuery, useStationSearchQuery, useNmrcJourneyPlanQuery, useNmrcStationsQuery } from '../hooks';
import { StrategyToggle } from '../components/StrategyToggle';
import { JourneyFareSummary } from '../components/JourneyFareSummary';
import { RouteSegmentView } from '../components/RouteSegmentView';
import { FirstLastTrainCard } from '../components/FirstLastTrainCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { GlassCard } from '../components/GlassCard';
import { GradientBackground } from '../components/GradientBackground';
import { useAppTheme } from '../theme/ThemeContext';
import type { RouteStrategy, JourneyRouteSegment } from '../types';
import type { HomeStackParamList } from '../navigation/types';
import { spacing, fontFamily } from '../theme';
import { bentoRadius, lightPalette, darkPalette } from '../theme/colors';
import { FavoritesStorage } from '../storage/favorites';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'JourneyResults'>;
type Route = RouteProp<HomeStackParamList, 'JourneyResults'>;

function normalizeLineKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function JourneyResultsScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { network = 'dmrc', fromCode, toCode, fromName, toName, journeyTime } = route.params;
  const theme = useTheme();
  const { semantic, isDark, fonts, shadows } = useAppTheme();
  const [strategy, setStrategy] = useState<RouteStrategy>('least-distance');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    FavoritesStorage.isSavedRoute(fromCode, toCode).then(setIsSaved).catch(() => setIsSaved(false));
  }, [fromCode, toCode]);

  const toggleSaveRoute = async () => {
    try {
      if (isSaved) {
        await FavoritesStorage.removeSavedRoute(fromCode, toCode);
        setIsSaved(false);
      } else {
        await FavoritesStorage.addSavedRoute({ fromCode, fromName, toCode, toName });
        setIsSaved(true);
      }
    } catch (error) {
      console.warn('[JourneyResults] Failed to toggle saved route:', error);
    }
  };

  const isNmrc = network === 'nmrc';

  const dmrcQuery = useJourneyPlanCachedQuery(fromCode, toCode, journeyTime);
  const nmrcQuery = useNmrcJourneyPlanQuery(fromCode, toCode);

  const isLoading = isNmrc ? nmrcQuery.isLoading : dmrcQuery.isLoading;
  const isError = isNmrc ? nmrcQuery.isError : dmrcQuery.isError;
  const refetch = isNmrc ? nmrcQuery.refetch : dmrcQuery.refetch;

  const { data: lines } = useMetroLinesQuery();
  const { data: allStations } = useStationSearchQuery('');
  const { data: nmrcStations } = useNmrcStationsQuery();
  const swipeHint = useRef(new Animated.Value(0)).current;
  const strategyRef = useRef(strategy);
  strategyRef.current = strategy;

  const strategies: RouteStrategy[] = ['least-distance', 'minimum-interchange'];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        !isNmrc && Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderRelease: (_, gs) => {
        if (isNmrc) return;
        const current = strategyRef.current;
        if (gs.dx < -50 && current !== 'minimum-interchange') {
          setStrategy('minimum-interchange');
          Animated.sequence([
            Animated.timing(swipeHint, { toValue: -8, duration: 120, useNativeDriver: true }),
            Animated.spring(swipeHint, { toValue: 0, useNativeDriver: true }),
          ]).start();
        } else if (gs.dx > 50 && current !== 'least-distance') {
          setStrategy('least-distance');
          Animated.sequence([
            Animated.timing(swipeHint, { toValue: 8, duration: 120, useNativeDriver: true }),
            Animated.spring(swipeHint, { toValue: 0, useNativeDriver: true }),
          ]).start();
        }
      },
    }),
  ).current;

  const selectedTimeLabel = useMemo(() => {
    if (!journeyTime) return 'Now';
    const parsed = new Date(journeyTime);
    if (Number.isNaN(parsed.getTime())) return 'Custom time';
    return parsed.toLocaleString();
  }, [journeyTime]);

  const stationCodeMap = useMemo(() => {
    const map = new Map<string, string>();
    if (allStations) {
      for (const s of allStations) {
        map.set(s.station_name.trim().toLowerCase(), s.station_code);
      }
    }
    if (nmrcStations) {
      for (const s of nmrcStations) {
        map.set(s.name.trim().toLowerCase(), s.id);
      }
    }
    return map;
  }, [allStations, nmrcStations]);

  const lineColorMap = useMemo(() => {
    const map = new Map<string, string>();
    if (lines) {
      for (const line of lines) {
        map.set(normalizeLineKey(line.name), line.primary_color_code);
        map.set(normalizeLineKey(line.line_color), line.primary_color_code);
        map.set(normalizeLineKey(line.line_code), line.primary_color_code);
      }
    }
    return map;
  }, [lines]);

  const nmrcRouteSegment = useMemo(() => {
    if (!isNmrc || !nmrcStations || !nmrcQuery.data) return null;
    
    const startIndex = nmrcStations.findIndex((s) => s.id === fromCode);
    const endIndex = nmrcStations.findIndex((s) => s.id === toCode);
    
    if (startIndex === -1 || endIndex === -1) return null;
    
    let pathStations = [];
    if (startIndex <= endIndex) {
      pathStations = nmrcStations.slice(startIndex, endIndex + 1);
    } else {
      pathStations = nmrcStations.slice(endIndex, startIndex + 1).reverse();
    }
    
    const segment: JourneyRouteSegment = {
      line: 'Aqua Line',
      line_no: null,
      path: pathStations.map(s => ({ name: s.name, status: null })),
      path_time: nmrcQuery.data.time,
      'map-path': [],
      station_interchange_time: 0,
      start: nmrcQuery.data.source,
      end: nmrcQuery.data.destination,
    };
    return segment;
  }, [isNmrc, nmrcStations, nmrcQuery.data, fromCode, toCode]);

  if (isLoading) return <LoadingState message="Planning your journey..." />;
  if (isError) return <ErrorState message="Could not plan this journey" error={dmrcQuery.error || nmrcQuery.error} onRetry={refetch} />;
  
  // Safe access to data — no more non-null assertions
  const dmrcData = dmrcQuery.data;
  const nmrcData = nmrcQuery.data;

  if (!isNmrc && !dmrcData) return <ErrorState message="No DMRC route data available" error={dmrcQuery.error} onRetry={refetch} />;
  if (isNmrc && !nmrcData) return <ErrorState message="No NMRC route data available" error={nmrcQuery.error} onRetry={refetch} />;

  // Get the active fare data based on strategy (with safe fallbacks)
  const activeDmrcFare = dmrcData
    ? strategy === 'least-distance'
      ? dmrcData.least_distance_fare
      : dmrcData.minimum_interchange_fare
    : null;

  const activeDmrcTrain = dmrcData
    ? strategy === 'least-distance'
      ? dmrcData.least_distance_train
      : dmrcData.minimum_interchange_train
    : null;

  const themeColor = theme.colors.primary;

  return (
    <GradientBackground>
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.content}
    >
      <GlassCard borderRadius={bentoRadius.heroCard} padding={spacing.lg}>
        <View style={styles.heroStations}>
          <View style={[styles.heroStationRow, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md }}>
              <View style={[styles.heroDot, { backgroundColor: semantic.success }]} />
              <Text
                variant="titleMedium"
                style={{
                  flex: 1,
                  color: theme.colors.onSurface,
                  fontWeight: '900',
                  letterSpacing: 0.3,
                  fontFamily: fonts.heading,
                }}
                numberOfLines={1}
              >
                {fromName}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <Pressable
                onPress={() => navigation.navigate('StationDetail', { stationCode: fromCode, stationName: fromName })}
                hitSlop={8}
                style={[styles.heroInfoBtn, { backgroundColor: theme.colors.surfaceVariant }]}
              >
                <Ionicons name="information-circle-outline" size={20} color={theme.colors.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroConnector}>
            <View style={[styles.heroLine, { backgroundColor: theme.colors.outlineVariant }]} />
            <View style={[styles.heroArrowCircle, { backgroundColor: isDark ? `${themeColor}20` : `${themeColor}15` }]}>
              <Ionicons name="arrow-down" size={18} color={themeColor} />
            </View>
            <View style={[styles.heroLine, { backgroundColor: theme.colors.outlineVariant }]} />
          </View>

          <View style={styles.heroStationRow}>
            <View style={[styles.heroDot, { backgroundColor: theme.colors.error }]} />
            <Text
              variant="titleMedium"
              style={{
                flex: 1,
                color: theme.colors.onSurface,
                fontWeight: '900',
                letterSpacing: 0.3,
                fontFamily: fonts.heading,
              }}
              numberOfLines={1}
            >
              {toName}
            </Text>
            <Pressable
              onPress={() => navigation.navigate('StationDetail', { stationCode: toCode, stationName: toName })}
              hitSlop={8}
              style={[styles.heroInfoBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          </View>
        </View>

        <View style={styles.heroStats}>
          <View style={[styles.heroStat, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="git-commit-outline" size={18} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '800' }}>
              {isNmrc ? (nmrcData?.stations ?? '—') : (activeDmrcFare?.stations ?? '—')} stops
            </Text>
          </View>
          <View style={[styles.heroStat, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="time-outline" size={18} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '800' }}>
              {isNmrc ? (nmrcData?.time ?? '—') : (activeDmrcFare?.total_time ?? '—')}
            </Text>
          </View>
          <Pressable onPress={toggleSaveRoute} style={[styles.heroStat, { backgroundColor: isSaved ? `${themeColor}20` : theme.colors.surfaceVariant, flex: 0, paddingHorizontal: 16 }]}>
            <Ionicons name={isSaved ? "star" : "star-outline"} size={18} color={isSaved ? themeColor : theme.colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </GlassCard>

      {!isNmrc && (
        <Animated.View style={{ transform: [{ translateX: swipeHint }] }}>
          <StrategyToggle active={strategy} onChange={setStrategy} />
          <View style={styles.swipeDots}>
            {strategies.map((s) => (
              <View
                key={s}
                style={[
                  styles.swipeDot,
                  {
                    backgroundColor: strategy === s ? themeColor : theme.colors.outlineVariant,
                    width: strategy === s ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      )}

      <View
        style={[
          styles.timePill,
          {
            backgroundColor: theme.colors.surfaceVariant,
          },
        ]}
      >
        <Ionicons name="time-outline" size={18} color={themeColor} />
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1, fontWeight: '600' }}>
          Departure
        </Text>
        <View style={[styles.timeValue, { backgroundColor: themeColor }]}>
          <Text variant="labelLarge" style={{ color: '#000000', fontWeight: '700' }}>
            {selectedTimeLabel}
          </Text>
        </View>
      </View>

      {/* Fare section */}
      <GlassCard borderRadius={bentoRadius.card} padding={spacing.base}>
         <View style={styles.fareRow}>
           <Text style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600', fontFamily: fonts.bodyMedium }}>Total Fare</Text>
           <Text style={{ fontSize: 24, fontWeight: '800', color: themeColor, fontFamily: fonts.heading }}>
             ₹{isNmrc ? (nmrcData?.fare ?? '—') : (activeDmrcFare?.weekday_fare ?? '—')}
           </Text>
         </View>
         {isNmrc && nmrcData?.concessionalFare && nmrcData.concessionalFare !== "0" && (
           <View style={[styles.fareRow, { marginTop: spacing.sm }]}>
             <Text style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>Concessional Fare <Text style={{ fontSize: 12 }}>(Sunday & Holiday)</Text></Text>
             <Text style={{ fontSize: 18, fontWeight: '700', color: themeColor }}>
               ₹{nmrcData.concessionalFare}
             </Text>
           </View>
         )}
      </GlassCard>

      <GlassCard borderRadius={bentoRadius.card} padding={spacing.base}>
        <View style={styles.routeHeader}>
          <Ionicons name="navigate-outline" size={18} color={themeColor} />
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            Route
          </Text>
          <Text variant="labelSmall" style={{ color: themeColor, marginLeft: 'auto', fontWeight: '600' }}>
            {isNmrc ? '1 line' : ((activeDmrcFare?.route?.length ?? 0) + ' lines')}
          </Text>
        </View>
        <View style={styles.routeSegments}>
          {isNmrc ? (
            nmrcRouteSegment && (
              <RouteSegmentView
                segment={nmrcRouteSegment}
                lineColor={isDark ? darkPalette.aqua_line : lightPalette.aqua_line}
                isLast={true}
                stationCodeMap={stationCodeMap}
                onStationPress={(code, name) =>
                  navigation.navigate('StationDetail', { stationCode: code, stationName: name })
                }
              />
            )
          ) : (
            (activeDmrcFare?.route ?? []).map((segment, index, arr) => (
              <RouteSegmentView
                key={`${segment.line}-${index}`}
                segment={segment}
                lineColor={lineColorMap.get(normalizeLineKey(segment.line)) ?? themeColor}
                isLast={index === arr.length - 1}
                stationCodeMap={stationCodeMap}
                onStationPress={(code, name) =>
                  navigation.navigate('StationDetail', { stationCode: code, stationName: name })
                }
              />
            ))
          )}
        </View>
      </GlassCard>

      {!isNmrc && activeDmrcTrain && (
        <FirstLastTrainCard data={activeDmrcTrain} />
      )}
    </ScrollView>
    </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.md,
    paddingBottom: spacing.tabBarClearance,
  },
  heroCard: {
    borderRadius: bentoRadius.heroCard,
    padding: spacing.lg,
    gap: spacing.base,
    borderWidth: 0,
  },
  heroStations: {
    gap: 0,
  },
  heroStationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  heroInfoBtn: {
    width: 36,
    height: 36,
    borderRadius: bentoRadius.small,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    gap: 0,
    paddingVertical: 8,
  },
  heroLine: {
    flex: 1,
    height: 2,
  },
  heroArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: bentoRadius.small,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 12,
    borderRadius: bentoRadius.icon,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: bentoRadius.card,
    borderWidth: 0,
    paddingLeft: spacing.base,
    paddingRight: spacing.xs,
    paddingVertical: spacing.sm,
  },
  timeValue: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: bentoRadius.small,
  },
  fareCard: {
    borderRadius: bentoRadius.card,
    padding: spacing.base,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeCard: {
    borderRadius: bentoRadius.card,
    borderWidth: 0,
    padding: spacing.base,
    gap: spacing.md,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routeSegments: {
    gap: spacing.sm,
  },
  swipeDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
  },
  swipeDot: {
    height: 6,
    borderRadius: 3,
  },
});
