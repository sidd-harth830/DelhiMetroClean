import { StyleSheet, View } from 'react-native';
import { TouchableRipple, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LineBadge } from './LineBadge';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import type { StationLineBadge } from '../types';

interface StationLike {
  station_name: string;
  station_code: string;
  interchange?: boolean;
  metro_lines?: StationLineBadge[];
}

interface Props {
  station: StationLike;
  onPress?: () => void;
  showChevron?: boolean;
}

export function StationCard({ station, onPress, showChevron = true }: Props) {
  const theme = useTheme();
  const { isDark, semantic } = useAppTheme();

  const primaryLineColor = station.metro_lines?.[0]?.primary_color_code ?? theme.colors.primary;
  const cardBgColor = isDark
    ? `${primaryLineColor}15`
    : `${primaryLineColor}10`;

  return (
    <View style={styles.wrapper}>
      <TouchableRipple
        onPress={onPress}
        disabled={!onPress}
        rippleColor={theme.colors.primary}
        borderless
        style={styles.ripple}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: cardBgColor,
            },
          ]}
        >
          {/* Icon container with line color */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: primaryLineColor,
              },
            ]}
          >
            {station.interchange ? (
              <Ionicons name="git-compare" size={18} color="#FFFFFF" />
            ) : (
              <Ionicons name="train" size={18} color="#FFFFFF" />
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.nameRow}>
              <Text
                variant="titleSmall"
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: '600',
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {station.station_name}
              </Text>
              <View
                style={[
                  styles.codeBadge,
                  {
                    backgroundColor: primaryLineColor,
                  },
                ]}
              >
                <Text
                  variant="labelSmall"
                  style={{
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {station.station_code}
                </Text>
              </View>
            </View>

            {!!station.metro_lines?.length && (
              <View style={styles.badgesRow}>
                {station.metro_lines.slice(0, 2).map((line) => (
                  <LineBadge
                    key={`${station.station_code}-${line.line_code}`}
                    name={line.line_code}
                    color={line.primary_color_code}
                    compact
                  />
                ))}
                {station.interchange && (
                  <View style={[styles.interchangeTag]}>
                    <Ionicons name="git-compare" size={10} color={theme.colors.primary} />
                    <Text
                      variant="labelSmall"
                      style={{
                        color: theme.colors.primary,
                        fontWeight: '700',
                        fontSize: 10,
                      }}
                    >
                      Interchange
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {showChevron && onPress ? (
            <Ionicons name="chevron-forward" size={16} color={theme.colors.onSurfaceVariant} />
          ) : null}
        </View>
      </TouchableRipple>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  ripple: {
    borderRadius: 24,
  },
  card: {
    borderRadius: 24,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  interchangeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
