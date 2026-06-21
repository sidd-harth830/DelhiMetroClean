import { FlatList, Modal, StyleSheet, View } from 'react-native';
import { useState, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, IconButton, Searchbar, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useDebounce, useNmrcStationsQuery } from '../hooks';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';
import type { NmrcStation } from '../types';

interface Props {
  visible: boolean;
  onSelect: (station: { code: string; name: string }) => void;
  onClose: () => void;
  title?: string;
}

export function NmrcStationPicker({ visible, onSelect, onClose, title = 'Select Station' }: Props) {
  const theme = useTheme();
  const { isDark, semantic } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const debouncedQuery = useDebounce(searchText, 300);
  const { data: stations, isLoading } = useNmrcStationsQuery();

  const results = useMemo(() => {
    if (!stations) return [];
    if (!debouncedQuery) return stations;
    const lowerQ = debouncedQuery.toLowerCase();
    return stations.filter(s => s.name.toLowerCase().includes(lowerQ) || s.id.toLowerCase().includes(lowerQ));
  }, [stations, debouncedQuery]);

  const handleSelect = (station: NmrcStation) => {
    onSelect({ code: station.id, name: station.name });
    setSearchText('');
  };

  const handleClose = () => {
    setSearchText('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text
            variant="headlineSmall"
            style={{
              color: theme.colors.onSurface,
              fontWeight: '700',
            }}
          >
            {title}
          </Text>
          <IconButton icon="close" onPress={handleClose} iconColor={theme.colors.onSurface} />
        </View>

        <View style={styles.searchWrapper}>
          <Searchbar
            placeholder="Search NMRC stations..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            autoCapitalize="characters"
            style={[
              styles.searchbar,
              {
                backgroundColor: isDark
                  ? theme.colors.surfaceVariant
                  : theme.colors.surface,
              },
            ]}
            inputStyle={{ color: theme.colors.onSurface }}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            elevation={0}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View
              style={[
                styles.loadingCard,
                {
                  backgroundColor: isDark
                    ? theme.colors.surfaceVariant
                    : theme.colors.surface,
                  shadowOpacity: isDark ? 0 : 0.05,
                },
              ]}
            >
              <Ionicons name="train-outline" size={28} color={semantic.aqua_line} />
              <ActivityIndicator size="small" color={semantic.aqua_line} />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}
              >
                Searching stations...
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const lineColor = semantic.aqua_line;
              const cardBg = isDark ? `${lineColor}12` : `${lineColor}08`;

              return (
                <View style={styles.resultWrapper}>
                  <TouchableRipple
                    onPress={() => handleSelect(item)}
                    rippleColor={lineColor}
                    borderless
                    style={styles.resultRipple}
                  >
                    <View
                      style={[
                        styles.resultCard,
                        {
                          backgroundColor: cardBg,
                          shadowOpacity: isDark ? 0 : 0.05,
                        },
                      ]}
                    >
                      <View style={[styles.resultAccent, { backgroundColor: lineColor }]} />
                      <View
                        style={[
                          styles.resultIcon,
                          { backgroundColor: lineColor },
                        ]}
                      >
                        <Ionicons name="train" size={18} color="#FFFFFF" />
                      </View>
                      <View style={styles.resultContent}>
                        <View style={styles.resultNameRow}>
                          <Text
                            variant="titleSmall"
                            style={{
                              color: theme.colors.onSurface,
                              fontWeight: '700',
                              flex: 1,
                            }}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <View
                            style={[
                              styles.resultCodeBadge,
                              { backgroundColor: lineColor },
                            ]}
                          >
                            <Text
                              variant="labelSmall"
                              style={{
                                color: theme.colors.onPrimary,
                                fontWeight: '700',
                                fontVariant: ['tabular-nums'],
                              }}
                            >
                              {item.id}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableRipple>
                </View>
              );
            }}
            ListEmptyComponent={
              isLoading ? null : (
                <View style={styles.emptyContainer}>
                  <View
                    style={[
                      styles.emptyIcon,
                      {
                        backgroundColor: isDark
                          ? theme.colors.surfaceVariant
                          : theme.colors.surface,
                        shadowOpacity: isDark ? 0 : 0.05,
                      },
                    ]}
                  >
                    <Ionicons name="search-outline" size={32} color={semantic.aqua_line} />
                  </View>
                  <Text
                    variant="titleSmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      fontWeight: '600',
                    }}
                  >
                    No stations found
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: spacing.base,
    paddingTop: spacing.md,
  },
  searchWrapper: { marginHorizontal: spacing.base, marginBottom: spacing.lg },
  searchbar: { borderRadius: 28 },
  list: { paddingTop: spacing.xs, paddingBottom: spacing.lg, paddingHorizontal: spacing.base },
  resultWrapper: { paddingVertical: spacing.xs },
  resultRipple: { borderRadius: bentoRadius.card },
  resultCard: {
    borderRadius: bentoRadius.card,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  resultAccent: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
    borderTopLeftRadius: bentoRadius.card, borderBottomLeftRadius: bentoRadius.card,
  },
  resultIcon: {
    width: 44, height: 44, borderRadius: bentoRadius.badge,
    justifyContent: 'center', alignItems: 'center',
  },
  resultContent: { flex: 1, gap: spacing.xs },
  resultNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resultCodeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: bentoRadius.badge },
  loadingContainer: { flex: 1, padding: spacing.lg, gap: spacing.lg, justifyContent: 'center', alignItems: 'center' },
  loadingCard: {
    borderRadius: bentoRadius.card, padding: spacing.lg, alignItems: 'center', gap: spacing.md,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowRadius: 10, elevation: 3,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['2xl'], gap: spacing.sm },
  emptyIcon: {
    width: 72, height: 72, borderRadius: bentoRadius.button, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
  },
});
