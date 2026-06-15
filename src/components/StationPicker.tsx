import { FlatList, Modal, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, IconButton, Searchbar, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LineBadge } from './LineBadge';
import { useDebounce, useStationSearchQuery } from '../hooks';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import type { StationSearchResult } from '../types';

interface Props {
  visible: boolean;
  onSelect: (station: { code: string; name: string }) => void;
  onClose: () => void;
  title?: string;
}

export function StationPicker({ visible, onSelect, onClose, title = 'Select Station' }: Props) {
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const debouncedQuery = useDebounce(searchText, 300);
  const { data: results, isLoading } = useStationSearchQuery(debouncedQuery);

  const handleSelect = (station: StationSearchResult) => {
    onSelect({ code: station.station_code, name: station.station_name });
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
            style={{ color: theme.colors.onSurface, fontWeight: '800' }}
          >
            {title}
          </Text>
          <IconButton icon="close" onPress={handleClose} iconColor={theme.colors.onSurface} />
        </View>

        <View style={[styles.searchbarWrapper, { borderColor: '#FFFFFF' }]}>
          <Searchbar
            placeholder="Search station..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            autoCapitalize="characters"
            style={[
              styles.searchbar,
              {
                backgroundColor: theme.colors.elevation.level2,
                borderColor: '#FFFFFF',
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
                  backgroundColor: theme.colors.elevation.level2,
                  borderColor: '#FFFFFF',
                },
              ]}
            >
              <Ionicons name="train-outline" size={28} color={theme.colors.primary} />
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, fontWeight: '700' }}
              >
                Searching stations...
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={results ?? []}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const lineColor = item.metro_lines?.[0]?.primary_color_code ?? theme.colors.primary;
              return (
                <View style={styles.resultWrapper}>
                  <TouchableRipple
                    onPress={() => handleSelect(item)}
                    rippleColor={theme.colors.primaryContainer}
                    borderless
                    style={styles.resultRipple}
                  >
                    <View
                      style={[
                        styles.resultCard,
                        {
                          backgroundColor: theme.colors.elevation.level2,
                          borderColor: '#FFFFFF',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.resultIcon,
                          {
                            backgroundColor: lineColor,
                            borderColor: '#000000',
                          },
                        ]}
                      >
                        <Ionicons name="train" size={18} color="#000000" />
                      </View>
                      <View style={styles.resultContent}>
                        <View style={styles.resultNameRow}>
                          <Text
                            variant="titleSmall"
                            style={{
                              color: theme.colors.onSurface,
                              fontWeight: '800',
                              flex: 1,
                            }}
                            numberOfLines={1}
                          >
                            {item.station_name}
                          </Text>
                          <View
                            style={[
                              styles.resultCodeBadge,
                              {
                                backgroundColor: lineColor,
                                borderColor: '#FFFFFF',
                              },
                            ]}
                          >
                            <Text
                              variant="labelSmall"
                              style={{
                                color: '#000000',
                                fontWeight: '800',
                                fontVariant: ['tabular-nums'],
                                letterSpacing: 0.3,
                              }}
                            >
                              {item.station_code}
                            </Text>
                          </View>
                        </View>
                        {!!item.metro_lines?.length && (
                          <View style={styles.badgesRow}>
                            {item.metro_lines.slice(0, 2).map((line) => (
                              <LineBadge
                                key={`${item.station_code}-${line.line_code}`}
                                name={line.line_code}
                                color={line.primary_color_code}
                                compact
                              />
                            ))}
                          </View>
                        )}
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
                        backgroundColor: theme.colors.elevation.level3,
                        borderColor: '#FFFFFF',
                      },
                    ]}
                  >
                    <Ionicons name="search-outline" size={32} color={theme.colors.primary} />
                  </View>
                  <Text
                    variant="titleSmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      fontWeight: '800',
                    }}
                  >
                    No stations found
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.outline, textAlign: 'center' }}
                  >
                    Try a different station name or code
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: spacing.base,
    paddingTop: spacing.md,
  },
  searchbarWrapper: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 2,
    borderRadius: 0,
    overflow: 'hidden',
  },
  searchbar: {
    marginHorizontal: 0,
    borderRadius: 0,
    borderWidth: 0,
  },
  list: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  resultWrapper: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  resultRipple: {
    borderRadius: 0,
  },
  resultCard: {
    borderRadius: 0,
    borderWidth: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 6,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  resultContent: {
    flex: 1,
    gap: spacing.xs,
  },
  resultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 0,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
});
