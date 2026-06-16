import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesStorage, FavoriteStation } from '../storage/favorites';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';
import { EmptyState } from '../components/EmptyState';

type Nav = NativeStackNavigationProp<any>;

export function FavoriteStationsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isDark, semantic } = useAppTheme();
  const [stations, setStations] = useState<FavoriteStation[]>([]);

  const loadStations = useCallback(() => {
    FavoritesStorage.getFavoriteStations().then(setStations);
  }, []);

  useFocusEffect(loadStations);

  const handleRemove = (code: string, name: string) => {
    Alert.alert('Remove Station', `Remove ${name} from favorites?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await FavoritesStorage.removeFavoriteStation(code);
          loadStations();
        },
      },
    ]);
  };

  const handleNavigate = (station: FavoriteStation) => {
    navigation.navigate('HomeTab', {
      screen: 'StationDetail',
      params: {
        stationCode: station.code,
        stationName: station.name,
      },
    });
  };

  if (stations.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <EmptyState title="No favorite stations yet" subtitle="Star a station from its detail page to add it here." />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.tabBarClearance }]}
    >
      {stations.map((station) => (
        <Pressable
          key={station.code}
          style={[
            styles.stationCard,
            {
              backgroundColor: isDark
                ? theme.colors.surface
                : theme.colors.surface,
              borderWidth: isDark ? 0 : 1,
              borderColor: isDark ? 'transparent' : 'rgba(0,0,0,0.06)',
            },
          ]}
          onPress={() => handleNavigate(station)}
          onLongPress={() => handleRemove(station.code, station.name)}
        >
          <View
            style={[
              styles.stationIcon,
              { backgroundColor: `${semantic.warning}20` },
            ]}
          >
            <Ionicons name="star" size={18} color={semantic.warning} />
          </View>

          <View style={styles.stationInfo}>
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurface, fontWeight: '700' }}
              numberOfLines={1}
            >
              {station.name}
            </Text>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}
            >
              {station.code}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => handleNavigate(station)}
              style={[styles.actionBtn, { backgroundColor: `${theme.colors.primary}15` }]}
            >
              <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => handleRemove(station.code, station.name)}
              style={[styles.actionBtn, { backgroundColor: `${semantic.error}15` }]}
            >
              <Ionicons name="trash-outline" size={18} color={semantic.error} />
            </Pressable>
          </View>
        </Pressable>
      ))}

      <Text
        variant="labelSmall"
        style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.md, opacity: 0.6 }}
      >
        Long press a station to remove it
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.md,
  },
  stationCard: {
    borderRadius: bentoRadius.card,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stationIcon: {
    width: 44,
    height: 44,
    borderRadius: bentoRadius.badge,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationInfo: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: bentoRadius.badge,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
