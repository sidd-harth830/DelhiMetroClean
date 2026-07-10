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
import { GlassCard } from '../components/GlassCard';
import { FloatingButton } from '../components/FloatingButton';
import { GradientBackground } from '../components/GradientBackground';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../theme/ThemeContext';
import type { HomeStackParamList } from '../navigation/types';
import { spacing, fontFamily } from '../theme';
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
  const { semantic, isDark, shadows, fonts, gradients } = useAppTheme();

  const greeting = useMemo(() => getGreeting(), []);

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
      network: 'dmrc',
      fromCode,
      toCode,
      fromName,
      toName,
    });
  };

  // ─── NMRC accent color (Aqua) ───
  const nmrcAccent = isDark ? '#00D1D1' : '#0D9488';
  const nmrcAccentBg = isDark ? 'rgba(0,209,209,0.08)' : 'rgba(13,148,136,0.05)';
  const nmrcAccentBorder = isDark ? 'rgba(0,209,209,0.18)' : 'rgba(13,148,136,0.12)';
  const nmrcBadgeBg = isDark ? 'rgba(0,209,209,0.15)' : 'rgba(13,148,136,0.10)';

  return (
    <GradientBackground>
      {/* ─── Header ─── */}
      <Appbar.Header
        elevated={false}
        style={{ backgroundColor: 'transparent', borderBottomWidth: 0 }}
      >
        <Appbar.Content
          title="Metro Planner"
          titleStyle={{
            fontFamily: fonts.heading,
            fontWeight: '800',
            fontSize: 24,
            letterSpacing: -0.5,
          }}
        />
      </Appbar.Header>

      {/* ─── Greeting banner ─── */}
      <GlassCard
        borderRadius={bentoRadius.large}
        padding={spacing.md}
        animated={false}
        style={{ marginHorizontal: spacing.screenPadding, marginBottom: spacing.sm }}
      >
        <View style={styles.greetingInner}>
          <Ionicons name={greeting.icon as any} size={18} color={theme.colors.primary} />
          <Text style={[styles.greetingText, { color: theme.colors.primary, fontFamily: fonts.headingSemiBold }]}>
            {greeting.text}
          </Text>
          <Text style={[styles.greetingSubtext, { color: theme.colors.onSurfaceVariant, fontFamily: fonts.body }]}>
            Delhi & Noida Metro
          </Text>
        </View>
      </GlassCard>
      
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
              textStyle={{ fontSize: 13, color: selectedChip === 'now' ? chipTextActive : theme.colors.onSurfaceVariant, fontWeight: selectedChip === 'now' ? '700' : '500', fontFamily: fonts.bodyMedium }}
            >
              Now
            </Chip>
            <Chip
              selected={selectedChip === '15m'}
              showSelectedCheck={false}
              onPress={() => { setDepartureDate(new Date(Date.now() + 15 * 60000)); setSelectedChip('15m'); }}
              mode="outlined"
              style={{ borderRadius: bentoRadius.pill, backgroundColor: selectedChip === '15m' ? chipBgActive : 'transparent', borderColor: selectedChip === '15m' ? chipBgActive : theme.colors.outline }}
              textStyle={{ fontSize: 13, color: selectedChip === '15m' ? chipTextActive : theme.colors.onSurfaceVariant, fontWeight: selectedChip === '15m' ? '700' : '500', fontFamily: fonts.bodyMedium }}
            >
              +15m
            </Chip>
            <Chip
              selected={selectedChip === '30m'}
              showSelectedCheck={false}
              onPress={() => { setDepartureDate(new Date(Date.now() + 30 * 60000)); setSelectedChip('30m'); }}
              mode="outlined"
              style={{ borderRadius: bentoRadius.pill, backgroundColor: selectedChip === '30m' ? chipBgActive : 'transparent', borderColor: selectedChip === '30m' ? chipBgActive : theme.colors.outline }}
              textStyle={{ fontSize: 13, color: selectedChip === '30m' ? chipTextActive : theme.colors.onSurfaceVariant, fontWeight: selectedChip === '30m' ? '700' : '500', fontFamily: fonts.bodyMedium }}
            >
              +30m
            </Chip>

            <Chip
              icon="calendar"
              onPress={() => { setPickerMode('date'); setShowPicker(true); }}
              mode="outlined"
              style={{ borderRadius: bentoRadius.pill, backgroundColor: selectedChip === 'custom' && pickerMode === 'date' ? theme.colors.primaryContainer : 'transparent' }}
              textStyle={{ fontFamily: fonts.bodyMedium }}
            >
              {departureDate && selectedChip === 'custom' ? departureDate.toLocaleDateString() : 'Date'}
            </Chip>
            <Chip
              icon="clock-outline"
              onPress={() => { setPickerMode('time'); setShowPicker(true); }}
              mode="outlined"
              style={{ borderRadius: bentoRadius.pill }}
              textStyle={{ fontFamily: fonts.bodyMedium }}
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

        {/* ─── DMRC Planner Card (Glass) ─── */}
        <GlassCard borderRadius={bentoRadius.heroCard} padding={spacing.cardPadding}>
          <View style={[styles.cardHeaderRow, { backgroundColor: isDark ? `${theme.colors.primary}15` : `${theme.colors.primary}0C` }]}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="subway" size={16} color={theme.colors.onPrimary} />
            </View>
            <Text style={[styles.cardHeaderTitle, { color: theme.colors.primary, fontFamily: fonts.heading }]}>Delhi Metro (DMRC)</Text>
          </View>
          
          <View style={styles.stationsBlock}>
            <View style={styles.connectorColumn}>
              <View style={[styles.connectorDot, { backgroundColor: semantic.success }]} />
              <View style={[styles.connectorLine, { backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.2 }]} />
              <View style={[styles.connectorDot, { backgroundColor: semantic.error }]} />
            </View>

            <View style={styles.inputsColumn}>
              <Pressable
                style={[styles.stationInput, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                }]}
                onPress={fromPickerDmrc.open}
              >
                <View style={[styles.inputDot, { backgroundColor: semantic.success }]} />
                <Text style={[{ flex: 1, color: fromPickerDmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: fromPickerDmrc.station ? '700' : '500', fontFamily: fromPickerDmrc.station ? fonts.bodySemiBold : fonts.body }]} numberOfLines={1}>
                  {fromPickerDmrc.station?.name ?? 'Where from?'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.stationInput, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                }]}
                onPress={toPickerDmrc.open}
              >
                <View style={[styles.inputDot, { backgroundColor: semantic.error }]} />
                <Text style={[{ flex: 1, color: toPickerDmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: toPickerDmrc.station ? '700' : '500', fontFamily: toPickerDmrc.station ? fonts.bodySemiBold : fonts.body }]} numberOfLines={1}>
                  {toPickerDmrc.station?.name ?? 'Where to?'}
                </Text>
              </Pressable>
            </View>

            <Pressable style={[styles.swapBtn, { backgroundColor: theme.colors.primary, ...shadows.soft }]} onPress={handleSwapDmrc}>
              <Ionicons name="swap-vertical" size={18} color={theme.colors.onPrimary} />
            </Pressable>
          </View>

          <FloatingButton
            label="Find DMRC Route"
            onPress={handleFindRouteDmrc}
            disabled={!canSearchDmrc}
            icon="navigate"
            style={{ marginTop: spacing.md }}
          />
        </GlassCard>

        {/* ─── NMRC Planner Card (Glass) ─── */}
        <GlassCard borderRadius={bentoRadius.heroCard} padding={spacing.cardPadding}>
          <View style={[styles.cardHeaderRow, { backgroundColor: isDark ? 'rgba(0,209,209,0.12)' : 'rgba(13,148,136,0.08)' }]}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: nmrcAccent }]}>
              <Ionicons name="subway" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.cardHeaderTitle, { color: nmrcAccent, fontFamily: fonts.heading }]}>Noida Metro (NMRC)</Text>
            <View style={[styles.networkBadge, { backgroundColor: nmrcBadgeBg }]}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: nmrcAccent, fontFamily: fonts.bodySemiBold }}>Aqua Line</Text>
            </View>
          </View>
          
          <View style={styles.stationsBlock}>
            <View style={styles.connectorColumn}>
              <View style={[styles.connectorDot, { backgroundColor: semantic.success }]} />
              <View style={[styles.connectorLine, { backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.2 }]} />
              <View style={[styles.connectorDot, { backgroundColor: semantic.error }]} />
            </View>

            <View style={styles.inputsColumn}>
              <Pressable
                style={[styles.stationInput, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                }]}
                onPress={fromPickerNmrc.open}
              >
                <View style={[styles.inputDot, { backgroundColor: semantic.success }]} />
                <Text style={[{ flex: 1, color: fromPickerNmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: fromPickerNmrc.station ? '700' : '500', fontFamily: fromPickerNmrc.station ? fonts.bodySemiBold : fonts.body }]} numberOfLines={1}>
                  {fromPickerNmrc.station?.name ?? 'Where from?'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.stationInput, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                }]}
                onPress={toPickerNmrc.open}
              >
                <View style={[styles.inputDot, { backgroundColor: semantic.error }]} />
                <Text style={[{ flex: 1, color: toPickerNmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: toPickerNmrc.station ? '700' : '500', fontFamily: toPickerNmrc.station ? fonts.bodySemiBold : fonts.body }]} numberOfLines={1}>
                  {toPickerNmrc.station?.name ?? 'Where to?'}
                </Text>
              </Pressable>
            </View>

            <Pressable style={[styles.swapBtn, { backgroundColor: nmrcAccent, ...shadows.soft }]} onPress={handleSwapNmrc}>
              <Ionicons name="swap-vertical" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <FloatingButton
            label="Find NMRC Route"
            onPress={handleFindRouteNmrc}
            disabled={!canSearchNmrc}
            icon="navigate"
            gradient={[nmrcAccent, isDark ? '#38BDF8' : '#0284C7']}
            style={{ marginTop: spacing.md }}
          />
        </GlassCard>

        {/* ─── Saved Routes Section ─── */}
        {savedRoutes.length > 0 && (
          <>
            <SectionHeader title="Saved Routes" />
            <View style={styles.popularGrid}>
              {savedRoutes.map((route) => (
                <Pressable
                  key={`${route.fromCode}-${route.toCode}`}
                  onPress={() => handleSavedRoute(route.fromCode, route.toCode, route.fromName, route.toName)}
                >
                  <GlassCard
                    borderRadius={bentoRadius.card}
                    padding={spacing.md}
                    animated={false}
                    style={{ width: '100%' }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <View style={[styles.popularIcon, { backgroundColor: isDark ? `${semantic.blue_line}20` : `${semantic.blue_line}12` }]}>
                        <Ionicons name="train" size={16} color={semantic.blue_line} />
                      </View>
                      <Text style={{ fontWeight: '700', color: theme.colors.onSurface, fontSize: 13, flex: 1, flexWrap: 'wrap', fontFamily: fonts.bodySemiBold }}>
                        {route.fromName} → {route.toName}
                      </Text>
                    </View>
                  </GlassCard>
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
                  onPress={() => navigation.navigate('StationDetail', { stationCode: station.code, stationName: station.name })}
                >
                  <GlassCard
                    borderRadius={bentoRadius.card}
                    padding={spacing.md}
                    animated={false}
                    style={{ width: '100%' }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <View style={[styles.popularIcon, { backgroundColor: isDark ? `${semantic.warning}20` : `${semantic.warning}12` }]}>
                        <Ionicons name="star" size={16} color={semantic.warning} />
                      </View>
                      <Text style={{ fontWeight: '700', color: theme.colors.onSurface, fontSize: 13, fontFamily: fonts.bodySemiBold }} numberOfLines={1}>
                        {station.name}
                      </Text>
                    </View>
                  </GlassCard>
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.screenPadding,
    gap: spacing.heroGap,
  },
  greetingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  greetingText: {
    fontWeight: '700',
    fontSize: 15,
  },
  greetingSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  timeSection: {
    marginBottom: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: bentoRadius.badge,
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: spacing.sm,
  },
  cardHeaderIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontWeight: '800',
    fontSize: 15,
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
  inputDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: bentoRadius.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.bentoGap,
  },
  popularIcon: {
    width: 36,
    height: 36,
    borderRadius: bentoRadius.badge,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
