import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Appbar, Button, Text, useTheme, Chip } from 'react-native-paper';
import { usePopularRoutesQuery, useStationPicker } from '../hooks';
import type { SelectedStation } from '../hooks/useStationPicker';
import { StationPicker } from '../components/StationPicker';
import { NmrcStationPicker } from '../components/NmrcStationPicker';
import { SectionHeader } from '../components/SectionHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../theme/ThemeContext';
import type { HomeStackParamList } from '../navigation/types';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';
import { FavoritesStorage, FavoriteStation, SavedRoute } from '../storage/favorites';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

/* ─── Time-based greeting ─── */
function getGreeting(): { text: string; icon: keyof typeof Ionicons.glyphMap } {
  const hour = new Date().getHours();
  if (hour < 5) return { text: 'Good Night', icon: 'moon' };
  if (hour < 12) return { text: 'Good Morning', icon: 'sunny' };
  if (hour < 17) return { text: 'Good Afternoon', icon: 'partly-sunny' };
  if (hour < 21) return { text: 'Good Evening', icon: 'cloudy-night' };
  return { text: 'Good Night', icon: 'moon' };
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { semantic, isDark, themeMode, setThemeMode } = useAppTheme();

  const greeting = useMemo(() => getGreeting(), []);

  // ─── Animated header entrance ───
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, useNativeDriver: true, friction: 8 }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, useNativeDriver: true, friction: 8 }),
      ]),
    ]).start();
  }, []);

  const handleCycleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('system');
    }
  };

  const getThemeIcon = () => {
    if (themeMode === 'system') return 'theme-light-dark';
    if (themeMode === 'light') return 'weather-sunny';
    return 'weather-night';
  };

  // DMRC State
  const fromPickerDmrc = useStationPicker();
  const toPickerDmrc = useStationPicker();
  
  // NMRC State
  const fromPickerNmrc = useStationPicker();
  const toPickerNmrc = useStationPicker();
  
  const [favoriteStations, setFavoriteStations] = useState<FavoriteStation[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [selectedChip, setSelectedChip] = useState<string>('now');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDepartureDate(selectedDate);
      setSelectedChip('custom');
    }
  };

  useFocusEffect(
    useCallback(() => {
      FavoritesStorage.getFavoriteStations()
        .then(setFavoriteStations)
        .catch(() => setFavoriteStations([]));
      FavoritesStorage.getSavedRoutes()
        .then(setSavedRoutes)
        .catch(() => setSavedRoutes([]));
    }, [])
  );

  const canSearchDmrc = fromPickerDmrc.station && toPickerDmrc.station;
  const canSearchNmrc = fromPickerNmrc.station && toPickerNmrc.station;

  const departureTime = useMemo(() => {
    if (!departureDate) return undefined;
    const pad = (value: number) => String(value).padStart(2, '0');
    const ms = String(departureDate.getMilliseconds()).padStart(3, '0');
    return `${departureDate.getFullYear()}-${pad(departureDate.getMonth() + 1)}-${pad(departureDate.getDate())}T${pad(departureDate.getHours())}:${pad(departureDate.getMinutes())}:${pad(departureDate.getSeconds())}.${ms}`;
  }, [departureDate]);

  const chipBgActive = theme.colors.primary;
  const chipTextActive = theme.colors.onPrimary;

  const handleFindRouteDmrc = () => {
    if (!fromPickerDmrc.station || !toPickerDmrc.station) return;
    navigation.navigate('JourneyResults', {
      network: 'dmrc',
      fromCode: fromPickerDmrc.station.code,
      toCode: toPickerDmrc.station.code,
      fromName: fromPickerDmrc.station.name,
      toName: toPickerDmrc.station.name,
      journeyTime: departureTime,
    });
  };

  const handleFindRouteNmrc = () => {
    if (!fromPickerNmrc.station || !toPickerNmrc.station) return;
    navigation.navigate('JourneyResults', {
      network: 'nmrc',
      fromCode: fromPickerNmrc.station.code,
      toCode: toPickerNmrc.station.code,
      fromName: fromPickerNmrc.station.name,
      toName: toPickerNmrc.station.name,
      journeyTime: departureTime,
    });
  };

  const handleSwapDmrc = useCallback(() => {
    const temp = fromPickerDmrc.station;
    fromPickerDmrc.setStation(toPickerDmrc.station);
    toPickerDmrc.setStation(temp);
  }, [fromPickerDmrc, toPickerDmrc]);

  const handleSwapNmrc = useCallback(() => {
    const temp = fromPickerNmrc.station;
    fromPickerNmrc.setStation(toPickerNmrc.station);
    toPickerNmrc.setStation(temp);
  }, [fromPickerNmrc, toPickerNmrc]);

  const handleSavedRoute = (fromCode: string, toCode: string, fromName: string, toName: string) => {
    navigation.navigate('JourneyResults', {
      network: 'dmrc', // Assume saved routes are currently DMRC only
      fromCode,
      toCode,
      fromName,
      toName,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* ─── Premium Header ─── */}
      <Animated.View style={{ opacity: headerFade, transform: [{ translateY: headerSlide }] }}>
        <Appbar.Header
          elevated={false}
          style={{
            backgroundColor: theme.colors.background,
            borderBottomWidth: 0,
          }}
        >
          <Appbar.Content
            title="Metro Planner"
            subtitle=""
            titleStyle={{ fontWeight: '800', fontSize: 22, letterSpacing: -0.3 }}
          />
          <Appbar.Action
            icon={getThemeIcon()}
            onPress={handleCycleTheme}
            color={theme.colors.primary}
          />
        </Appbar.Header>

        {/* Greeting banner */}
        <View style={[styles.greetingBanner, { backgroundColor: isDark ? `${theme.colors.primary}10` : `${theme.colors.primary}08` }]}>
          <Ionicons name={greeting.icon as any} size={18} color={theme.colors.primary} />
          <Text style={[styles.greetingText, { color: theme.colors.primary }]}>
            {greeting.text}
          </Text>
          <Text style={[styles.greetingSubtext, { color: theme.colors.onSurfaceVariant }]}>
            Delhi & Noida Metro
          </Text>
        </View>
      </Animated.View>
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Time Chips ─── */}
        <View style={styles.timeSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: 2 }}>
            <Chip
              selected={selectedChip === 'now'}
              showSelectedCheck={false}
              onPress={() => { setDepartureDate(undefined); setSelectedChip('now'); }}
              mode="outlined"
              style={{ borderRadius: bentoRadius.pill, backgroundColor: selectedChip === 'now' ? chipBgActive : 'transparent', borderColor: selectedChip === 'now' ? chipBgActive : theme.colors.outline }}
              textStyle={{ fontSize: 13, color: selectedChip === 'now' ? chipTextActive : theme.colors.onSurfaceVariant, fontWeight: selectedChip === 'now' ? '700' : '500' }}
            >
              Now
            </Chip>
            <Chip
              selected={selectedChip === '15m'}
              showSelectedCheck={false}
              onPress={() => { setDepartureDate(new Date(Date.now() + 15 * 60000)); setSelectedChip('15m'); }}
              mode="outlined"
              style={{ borderRadius: bentoRadius.pill, backgroundColor: selectedChip === '15m' ? chipBgActive : 'transparent', borderColor: selectedChip === '15m' ? chipBgActive : theme.colors.outline }}
              textStyle={{ fontSize: 13, color: selectedChip === '15m' ? chipTextActive : theme.colors.onSurfaceVariant, fontWeight: selectedChip === '15m' ? '700' : '500' }}
            >
              +15m
            </Chip>
            <Chip
              selected={selectedChip === '30m'}
              showSelectedCheck={false}
              onPress={() => { setDepartureDate(new Date(Date.now() + 30 * 60000)); setSelectedChip('30m'); }}
              mode="outlined"
              style={{ borderRadius: bentoRadius.pill, backgroundColor: selectedChip === '30m' ? chipBgActive : 'transparent', borderColor: selectedChip === '30m' ? chipBgActive : theme.colors.outline }}
              textStyle={{ fontSize: 13, color: selectedChip === '30m' ? chipTextActive : theme.colors.onSurfaceVariant, fontWeight: selectedChip === '30m' ? '700' : '500' }}
            >
              +30m
            </Chip>
            <Chip
              icon="calendar"
              onPress={() => { setPickerMode('date'); setShowPicker(true); }}
              mode="outlined"
              style={{ borderRadius: bentoRadius.pill, backgroundColor: selectedChip === 'custom' && pickerMode === 'date' ? theme.colors.primaryContainer : 'transparent' }}
            >
              {departureDate && selectedChip === 'custom' ? departureDate.toLocaleDateString() : 'Date'}
            </Chip>
            <Chip
              icon="clock-outline"
              onPress={() => { setPickerMode('time'); setShowPicker(true); }}
              mode="outlined"
              style={{ borderRadius: bentoRadius.pill }}
            >
              {departureDate && selectedChip === 'custom' ? departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time'}
            </Chip>
          </ScrollView>
        </View>

        {showPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={departureDate || new Date()}
            mode={pickerMode}
            is24Hour={false}
            onChange={onDateChange}
          />
        )}

        {/* ─── DMRC Planner Card ─── */}
        <Animated.View
          style={[
            styles.plannerCard,
            {
              backgroundColor: isDark ? `${theme.colors.primary}12` : `${theme.colors.primary}0A`,
              borderWidth: isDark ? 1 : 1,
              borderColor: isDark ? `${theme.colors.primary}20` : `${theme.colors.primary}15`,
              opacity: cardFade,
              transform: [{ translateY: cardSlide }],
            },
          ]}
        >
          <View style={[styles.cardHeaderRow, { backgroundColor: isDark ? `${theme.colors.primary}20` : `${theme.colors.primary}1A` }]}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="subway" size={16} color={theme.colors.onPrimary} />
            </View>
            <Text style={[styles.cardHeaderTitle, { color: theme.colors.primary }]}>Delhi Metro (DMRC)</Text>
            <View style={[styles.networkBadge, { backgroundColor: isDark ? `${semantic.blue_line}20` : `${semantic.blue_line}15` }]}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: semantic.blue_line }}>11 Lines</Text>
            </View>
          </View>
          
          <View style={styles.stationsBlock}>
            <View style={styles.connectorColumn}>
              <View style={[styles.connectorDot, { backgroundColor: semantic.success }]} />
              <View style={[styles.connectorLine, { backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.2 }]} />
              <View style={[styles.connectorDot, { backgroundColor: semantic.error }]} />
            </View>

            <View style={styles.inputsColumn}>
              <Pressable style={[styles.stationInput, { backgroundColor: isDark ? `${semantic.blue_line}14` : `${semantic.blue_line}0A` }]} onPress={fromPickerDmrc.open}>
                <Ionicons name="ellipse" size={8} color={semantic.success} style={{ marginRight: 4 }} />
                <Text style={[{ flex: 1, color: fromPickerDmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: fromPickerDmrc.station ? '700' : '500' }]} numberOfLines={1}>
                  {fromPickerDmrc.station?.name ?? 'Where from?'}
                </Text>
              </Pressable>

              <Pressable style={[styles.stationInput, { backgroundColor: isDark ? `${semantic.green_line}14` : `${semantic.green_line}0A` }]} onPress={toPickerDmrc.open}>
                <Ionicons name="location" size={10} color={semantic.error} style={{ marginRight: 4 }} />
                <Text style={[{ flex: 1, color: toPickerDmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: toPickerDmrc.station ? '700' : '500' }]} numberOfLines={1}>
                  {toPickerDmrc.station?.name ?? 'Where to?'}
                </Text>
              </Pressable>
            </View>

            <Pressable style={[styles.swapBtn, { backgroundColor: theme.colors.primary }]} onPress={handleSwapDmrc}>
              <Ionicons name="swap-vertical" size={18} color={theme.colors.onPrimary} />
            </Pressable>
          </View>

          <Button
            mode="contained"
            onPress={handleFindRouteDmrc}
            disabled={!canSearchDmrc}
            icon="navigation"
            style={[styles.findButton, { opacity: canSearchDmrc ? 1 : 0.6 }]}
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
          >
            Find DMRC Route
          </Button>
        </Animated.View>

        {/* ─── NMRC Planner Card ─── */}
        <View
          style={[
            styles.plannerCard,
            {
              backgroundColor: isDark ? `${semantic.info}10` : `${semantic.info}06`,
              borderWidth: 1,
              borderColor: isDark ? `${semantic.info}20` : `${semantic.info}15`,
            },
          ]}
        >
          <View style={[styles.cardHeaderRow, { backgroundColor: isDark ? `${semantic.info}20` : `${semantic.info}1A` }]}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: semantic.info }]}>
              <Ionicons name="subway" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.cardHeaderTitle, { color: semantic.info }]}>Noida Metro (NMRC)</Text>
            <View style={[styles.networkBadge, { backgroundColor: isDark ? 'rgba(0,209,209,0.20)' : 'rgba(0,181,181,0.15)' }]}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#00D1D1' : '#00B5B5' }}>Aqua Line</Text>
            </View>
          </View>
          
          <View style={styles.stationsBlock}>
            <View style={styles.connectorColumn}>
              <View style={[styles.connectorDot, { backgroundColor: semantic.success }]} />
              <View style={[styles.connectorLine, { backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.2 }]} />
              <View style={[styles.connectorDot, { backgroundColor: semantic.error }]} />
            </View>

            <View style={styles.inputsColumn}>
              <Pressable style={[styles.stationInput, { backgroundColor: isDark ? `${semantic.blue_line}14` : `${semantic.blue_line}0A` }]} onPress={fromPickerNmrc.open}>
                <Ionicons name="ellipse" size={8} color={semantic.success} style={{ marginRight: 4 }} />
                <Text style={[{ flex: 1, color: fromPickerNmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: fromPickerNmrc.station ? '700' : '500' }]} numberOfLines={1}>
                  {fromPickerNmrc.station?.name ?? 'Where from?'}
                </Text>
              </Pressable>

              <Pressable style={[styles.stationInput, { backgroundColor: isDark ? `${semantic.green_line}14` : `${semantic.green_line}0A` }]} onPress={toPickerNmrc.open}>
                <Ionicons name="location" size={10} color={semantic.error} style={{ marginRight: 4 }} />
                <Text style={[{ flex: 1, color: toPickerNmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: toPickerNmrc.station ? '700' : '500' }]} numberOfLines={1}>
                  {toPickerNmrc.station?.name ?? 'Where to?'}
                </Text>
              </Pressable>
            </View>

            <Pressable style={[styles.swapBtn, { backgroundColor: semantic.info }]} onPress={handleSwapNmrc}>
              <Ionicons name="swap-vertical" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <Button
            mode="contained"
            onPress={handleFindRouteNmrc}
            disabled={!canSearchNmrc}
            icon="navigation"
            style={[styles.findButton, { opacity: canSearchNmrc ? 1 : 0.6 }]}
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
            buttonColor={semantic.info}
          >
            Find NMRC Route
          </Button>
        </View>

        {/* ─── Saved Routes Section ─── */}
        {savedRoutes.length > 0 && (
          <>
            <SectionHeader title="Saved Routes" />
            <View style={styles.popularGrid}>
              {savedRoutes.map((route) => (
                <Pressable
                  key={`${route.fromCode}-${route.toCode}`}
                  style={[
                    styles.popularCard,
                    {
                      backgroundColor: isDark ? `${semantic.blue_line}12` : `${semantic.blue_line}08`,
                      borderWidth: isDark ? 1 : 1,
                      borderColor: isDark ? `${semantic.blue_line}20` : `${semantic.blue_line}12`,
                    },
                  ]}
                  onPress={() => handleSavedRoute(route.fromCode, route.toCode, route.fromName, route.toName)}
                >
                  <View style={[styles.popularIcon, { backgroundColor: semantic.blue_line }]}>
                    <Ionicons name="train" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={{ fontWeight: '700', color: theme.colors.onSurface, fontSize: 13, flex: 1, flexWrap: 'wrap' }}>
                    {route.fromName} → {route.toName}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* ─── Favorite Stations Section ─── */}
        {favoriteStations.length > 0 && (
          <>
            <SectionHeader title="Favorite Stations" />
            <View style={styles.popularGrid}>
              {favoriteStations.map((station) => (
                <Pressable
                  key={station.code}
                  style={[
                    styles.popularCard,
                    {
                      backgroundColor: isDark ? `${semantic.success}12` : `${semantic.success}08`,
                      borderWidth: isDark ? 1 : 1,
                      borderColor: isDark ? `${semantic.success}20` : `${semantic.success}12`,
                    },
                  ]}
                  onPress={() => navigation.navigate('StationDetail', { stationCode: station.code, stationName: station.name })}
                >
                  <View style={[styles.popularIcon, { backgroundColor: semantic.success }]}>
                    <Ionicons name="business" size={16} color="#000000" />
                  </View>
                  <Text style={{ fontWeight: '700', color: theme.colors.onSurface, fontSize: 13 }} numberOfLines={1}>
                    {station.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <StationPicker visible={fromPickerDmrc.visible} onSelect={fromPickerDmrc.select as any} onClose={fromPickerDmrc.close} title="DMRC Departure" />
        <StationPicker visible={toPickerDmrc.visible} onSelect={toPickerDmrc.select as any} onClose={toPickerDmrc.close} title="DMRC Destination" />
        <NmrcStationPicker visible={fromPickerNmrc.visible} onSelect={fromPickerNmrc.select as any} onClose={fromPickerNmrc.close} title="NMRC Departure" />
        <NmrcStationPicker visible={toPickerNmrc.visible} onSelect={toPickerNmrc.select as any} onClose={toPickerNmrc.close} title="NMRC Destination" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.sectionGap,
  },
  greetingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: bentoRadius.badge,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  greetingText: {
    fontWeight: '700',
    fontSize: 14,
  },
  greetingSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  timeSection: {
    marginBottom: 0,
  },
  plannerCard: {
    borderRadius: bentoRadius.heroCard,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: bentoRadius.badge,
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  cardHeaderIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontWeight: '800',
    fontSize: 14,
  },
  networkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4,
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
    borderRadius: bentoRadius.button,
    gap: spacing.sm,
  },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: bentoRadius.icon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  findButton: {
    borderRadius: bentoRadius.button,
    marginTop: spacing.md,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.bentoGap,
    paddingHorizontal: spacing.base,
  },
  popularCard: {
    width: '47%',
    padding: spacing.md,
    borderRadius: bentoRadius.card,
    gap: spacing.sm,
    alignItems: 'center',
  },
  popularIcon: {
    width: 36,
    height: 36,
    borderRadius: bentoRadius.badge,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
