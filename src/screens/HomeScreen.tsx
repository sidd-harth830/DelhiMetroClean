import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { semantic, isDark } = useAppTheme();
  
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
      FavoritesStorage.getFavoriteStations().then(setFavoriteStations);
      FavoritesStorage.getSavedRoutes().then(setSavedRoutes);
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
      <Appbar.Header
        elevated={false}
        style={{
          backgroundColor: theme.colors.background,
          borderBottomWidth: 0,
        }}
      >
        <Appbar.Content
          title="Metro Planner"
          subtitle="Delhi & Noida Metro"
          titleStyle={{ fontWeight: '800', fontSize: 22, letterSpacing: -0.3 }}
          subtitleStyle={{ fontWeight: '500', fontSize: 13, opacity: 0.7 }}
        />
      </Appbar.Header>
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* DMRC Planner Card */}
        <View
          style={[
            styles.plannerCard,
            {
              backgroundColor: isDark ? `${theme.colors.primary}12` : `${theme.colors.primary}0A`,
              borderWidth: isDark ? 0 : 1,
              borderColor: isDark ? 'transparent' : `${theme.colors.primary}20`,
            },
          ]}
        >
          <View style={[styles.cardHeaderRow, { backgroundColor: isDark ? `${theme.colors.primary}20` : `${theme.colors.primary}1A` }]}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="subway" size={16} color={theme.colors.onPrimary} />
            </View>
            <Text style={[styles.cardHeaderTitle, { color: theme.colors.primary }]}>Delhi Metro (DMRC)</Text>
          </View>
          
          <View style={styles.stationsBlock}>
            <View style={styles.connectorColumn}>
              <View style={[styles.connectorDot, { backgroundColor: semantic.success }]} />
              <View style={[styles.connectorLine, { backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.2 }]} />
              <View style={[styles.connectorDot, { backgroundColor: semantic.error }]} />
            </View>

            <View style={styles.inputsColumn}>
              <Pressable style={[styles.stationInput, { backgroundColor: isDark ? `${semantic.blue_line}14` : `${semantic.blue_line}0A` }]} onPress={fromPickerDmrc.open}>
                <Text style={[{ flex: 1, color: fromPickerDmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: fromPickerDmrc.station ? '700' : '500' }]} numberOfLines={1}>
                  {fromPickerDmrc.station?.name ?? 'Where from?'}
                </Text>
              </Pressable>

              <Pressable style={[styles.stationInput, { backgroundColor: isDark ? `${semantic.green_line}14` : `${semantic.green_line}0A` }]} onPress={toPickerDmrc.open}>
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
        </View>

        {/* NMRC Planner Card */}
        <View
          style={[
            styles.plannerCard,
            {
              backgroundColor: isDark ? `${semantic.aqua_line}12` : `${semantic.aqua_line}0A`,
              borderWidth: isDark ? 0 : 1,
              borderColor: isDark ? 'transparent' : `${semantic.aqua_line}20`,
            },
          ]}
        >
          <View style={[styles.cardHeaderRow, { backgroundColor: isDark ? `${semantic.aqua_line}20` : `${semantic.aqua_line}1A` }]}>
            <View style={[styles.cardHeaderIcon, { backgroundColor: semantic.aqua_line }]}>
              <Ionicons name="subway" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.cardHeaderTitle, { color: semantic.aqua_line }]}>Noida Metro (NMRC)</Text>
          </View>
          
          <View style={styles.stationsBlock}>
            <View style={styles.connectorColumn}>
              <View style={[styles.connectorDot, { backgroundColor: semantic.success }]} />
              <View style={[styles.connectorLine, { backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.2 }]} />
              <View style={[styles.connectorDot, { backgroundColor: semantic.error }]} />
            </View>

            <View style={styles.inputsColumn}>
              <Pressable style={[styles.stationInput, { backgroundColor: isDark ? `${semantic.blue_line}14` : `${semantic.blue_line}0A` }]} onPress={fromPickerNmrc.open}>
                <Text style={[{ flex: 1, color: fromPickerNmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: fromPickerNmrc.station ? '700' : '500' }]} numberOfLines={1}>
                  {fromPickerNmrc.station?.name ?? 'Where from?'}
                </Text>
              </Pressable>

              <Pressable style={[styles.stationInput, { backgroundColor: isDark ? `${semantic.green_line}14` : `${semantic.green_line}0A` }]} onPress={toPickerNmrc.open}>
                <Text style={[{ flex: 1, color: toPickerNmrc.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontWeight: toPickerNmrc.station ? '700' : '500' }]} numberOfLines={1}>
                  {toPickerNmrc.station?.name ?? 'Where to?'}
                </Text>
              </Pressable>
            </View>

            <Pressable style={[styles.swapBtn, { backgroundColor: semantic.aqua_line }]} onPress={handleSwapNmrc}>
              <Ionicons name="swap-vertical" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <Button
            mode="contained"
            onPress={handleFindRouteNmrc}
            disabled={!canSearchNmrc}
            icon="navigation"
            style={[styles.findButton, { opacity: canSearchNmrc ? 1 : 0.6 }]}
            buttonColor={semantic.aqua_line}
            textColor="#FFFFFF"
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
          >
            Find NMRC Route
          </Button>
        </View>

        {/* Saved Routes Section */}
        {savedRoutes.length > 0 && (
          <>
            <SectionHeader title="Saved Routes" />
            <View style={styles.popularGrid}>
              {savedRoutes.map((route, index) => (
                <Pressable
                  key={`${route.fromCode}-${route.toCode}`}
                  style={[
                    styles.popularCard,
                    {
                      backgroundColor: isDark ? `${semantic.blue_line}12` : `${semantic.blue_line}08`,
                      borderWidth: isDark ? 0 : 1,
                      borderColor: isDark ? 'transparent' : `${semantic.blue_line}20`,
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

        {/* Favorite Stations Section */}
        {favoriteStations.length > 0 && (
          <>
            <SectionHeader title="Favorite Stations" />
            <View style={styles.popularGrid}>
              {favoriteStations.map((station, index) => (
                <Pressable
                  key={station.code}
                  style={[
                    styles.popularCard,
                    {
                      backgroundColor: isDark ? `${semantic.success}12` : `${semantic.success}08`,
                      borderWidth: isDark ? 0 : 1,
                      borderColor: isDark ? 'transparent' : `${semantic.success}20`,
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
