import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Appbar, Button, Text, useTheme, Chip } from 'react-native-paper';
import { usePopularRoutesQuery, useNotificationsQuery, useStationPicker, useMetroLinesQuery } from '../hooks';
import type { SelectedStation } from '../hooks/useStationPicker';
import { StationPicker } from '../components/StationPicker';
import { SectionHeader } from '../components/SectionHeader';
import { NotificationCard } from '../components/NotificationCard';
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
  const fromPicker = useStationPicker();
  const toPicker = useStationPicker();
  const popularRoutes = usePopularRoutesQuery(5);
  const notifications = useNotificationsQuery();
  const linesQuery = useMetroLinesQuery();
  const disruptedLines = (linesQuery.data ?? []).filter(
    (l) => l.status.trim().toLowerCase() !== 'normal service',
  );
  const [departureOffsetMinutes, setDepartureOffsetMinutes] = useState(0);
  const [favoriteStations, setFavoriteStations] = useState<FavoriteStation[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDepartureDate(selectedDate);
    }
  };

  useFocusEffect(
    useCallback(() => {
      FavoritesStorage.getFavoriteStations().then(setFavoriteStations);
      FavoritesStorage.getSavedRoutes().then(setSavedRoutes);
    }, [])
  );

  const canSearch = fromPicker.station && toPicker.station;

  const departureTime = useMemo(() => {
    if (!departureDate) return undefined;

    const pad = (value: number) => String(value).padStart(2, '0');
    const ms = String(departureDate.getMilliseconds()).padStart(3, '0');
    return `${departureDate.getFullYear()}-${pad(departureDate.getMonth() + 1)}-${pad(departureDate.getDate())}T${pad(departureDate.getHours())}:${pad(departureDate.getMinutes())}:${pad(departureDate.getSeconds())}.${ms}`;
  }, [departureDate]);

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

  const handleSavedRoute = (fromCode: string, toCode: string, fromName: string, toName: string) => {
    navigation.navigate('JourneyResults', {
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
          title="Delhi Metro"
          subtitle="Plan your journey"
          titleStyle={{ fontWeight: '800', fontSize: 22, letterSpacing: -0.3 }}
          subtitleStyle={{ fontWeight: '500', fontSize: 13, opacity: 0.7 }}
        />
      </Appbar.Header>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Journey Planner Card — Hero Bento Box */}
        <View
          style={[
            styles.plannerCard,
            {
              backgroundColor: isDark
                ? theme.colors.surface
                : theme.colors.surface,
              borderWidth: isDark ? 0 : 1,
              borderColor: isDark ? 'transparent' : 'rgba(0,0,0,0.06)',
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
                  { backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.2 },
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
                      ? `${semantic.blue_line}14`
                      : `${semantic.blue_line}0A`,
                  },
                ]}
                onPress={fromPicker.open}
              >
                <Text
                  variant="bodyLarge"
                  style={{
                    flex: 1,
                    color: fromPicker.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    fontWeight: fromPicker.station ? '700' : '500',
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
                      ? `${semantic.green_line}14`
                      : `${semantic.green_line}0A`,
                  },
                ]}
                onPress={toPicker.open}
              >
                <Text
                  variant="bodyLarge"
                  style={{
                    flex: 1,
                    color: toPicker.station ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    fontWeight: toPicker.station ? '700' : '500',
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
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button mode="outlined" icon="calendar" onPress={() => { setPickerMode('date'); setShowPicker(true); }} style={{ flex: 1, borderColor: isDark ? 'rgba(255,255,255,0.15)' : theme.colors.outline }}>
                {departureDate ? departureDate.toLocaleDateString() : 'Set Date'}
              </Button>
              <Button mode="outlined" icon="clock-outline" onPress={() => { setPickerMode('time'); setShowPicker(true); }} style={{ flex: 1, borderColor: isDark ? 'rgba(255,255,255,0.15)' : theme.colors.outline }}>
                {departureDate ? departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Set Time'}
              </Button>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, paddingHorizontal: 2 }}>
              <Chip
                selected={!departureDate}
                onPress={() => setDepartureDate(undefined)}
                mode="outlined"
                style={{ borderRadius: bentoRadius.pill }}
                textStyle={{ fontSize: 13 }}
              >
                Now
              </Chip>
              <Chip
                onPress={() => setDepartureDate(new Date(Date.now() + 15 * 60000))}
                mode="outlined"
                style={{ borderRadius: bentoRadius.pill }}
                textStyle={{ fontSize: 13 }}
              >
                +15m
              </Chip>
              <Chip
                onPress={() => setDepartureDate(new Date(Date.now() + 30 * 60000))}
                mode="outlined"
                style={{ borderRadius: bentoRadius.pill }}
                textStyle={{ fontSize: 13 }}
              >
                +30m
              </Chip>
              <Chip
                onPress={() => setDepartureDate(new Date(Date.now() + 60 * 60000))}
                mode="outlined"
                style={{ borderRadius: bentoRadius.pill }}
                textStyle={{ fontSize: 13 }}
              >
                +1h
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

          {/* Find Route button */}
          <Button
            mode="contained"
            onPress={handleFindRoute}
            disabled={!canSearch}
            icon="navigation"
            style={styles.findButton}
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
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
                  ? `${semantic.warning}18`
                  : `${semantic.warning}0C`,
                borderWidth: isDark ? 0 : 1,
                borderColor: isDark ? 'transparent' : `${semantic.warning}20`,
              },
            ]}
            onPress={() => navigation.getParent()?.navigate('AlertsTab' as never)}
          >
            {/* Colored left accent */}
            <View style={[styles.disruptionAccent, { backgroundColor: semantic.warning }]} />
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
                      backgroundColor: isDark
                        ? `${semantic.blue_line}12`
                        : `${semantic.blue_line}08`,
                      borderWidth: isDark ? 0 : 1,
                      borderColor: isDark ? 'transparent' : `${semantic.blue_line}20`,
                    },
                  ]}
                  onPress={() => handleSavedRoute(route.fromCode, route.toCode, route.fromName, route.toName)}
                >
                  <View
                    style={[
                      styles.popularIcon,
                      { backgroundColor: semantic.blue_line },
                    ]}
                  >
                    <Ionicons name="train" size={16} color="#FFFFFF" />
                  </View>
                  <Text
                    style={{
                      fontWeight: '700',
                      color: theme.colors.onSurface,
                      fontSize: 13,
                    }}
                    numberOfLines={1}
                  >
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
                      backgroundColor: isDark
                        ? `${semantic.success}12`
                        : `${semantic.success}08`,
                      borderWidth: isDark ? 0 : 1,
                      borderColor: isDark ? 'transparent' : `${semantic.success}20`,
                    },
                  ]}
                  onPress={() => navigation.navigate('StationDetail', { stationCode: station.code, stationName: station.name })}
                >
                  <View
                    style={[
                      styles.popularIcon,
                      { backgroundColor: semantic.success },
                    ]}
                  >
                    <Ionicons name="business" size={16} color="#000000" />
                  </View>
                  <Text
                    style={{
                      fontWeight: '700',
                      color: theme.colors.onSurface,
                      fontSize: 13,
                    }}
                    numberOfLines={1}
                  >
                    {station.name}
                  </Text>
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
    gap: spacing.sectionGap,
  },
  plannerCard: {
    borderRadius: bentoRadius.heroCard,
    padding: spacing.lg,
    gap: spacing.md,
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
  timeSection: {
    marginTop: spacing.sm,
  },
  findButton: {
    borderRadius: bentoRadius.button,
    marginTop: spacing.md,
  },
  disruptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: bentoRadius.card,
    overflow: 'hidden',
  },
  disruptionAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: bentoRadius.card,
    borderBottomLeftRadius: bentoRadius.card,
  },
  disruptionIcon: {
    width: 40,
    height: 40,
    borderRadius: bentoRadius.badge,
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
    borderRadius: spacing.sm,
  },
  disruptionChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
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
  hitsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: bentoRadius.badge,
  },
  notifList: {
    gap: spacing.sm,
  },
});
