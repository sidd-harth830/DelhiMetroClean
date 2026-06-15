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

  return (
    <View style={styles.wrapper}>
      <TouchableRipple
        onPress={onPress}
        disabled={!onPress}
        rippleColor={theme.colors.primaryContainer}
        borderless
        style={styles.ripple}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.elevation.level2,
              borderColor: '#FFFFFF',
            },
          ]}
        >
          {/* Left accent tab */}
          <View
            style={[
              styles.accentTab,
              { backgroundColor: primaryLineColor },
            ]}
          />

          {/* Main content */}
          <View style={styles.container}>
            {/* Line icon */}
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: primaryLineColor,
                  borderColor: '#000000',
                },
              ]}
            >
              {station.interchange ? (
                <Ionicons name="git-compare" size={18} color="#000000" />
              ) : (
                <Ionicons name="train" size={18} color="#000000" />
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.nameRow}>
                <Text
                  variant="titleSmall"
                  style={{
                    color: theme.colors.onSurface,
                    fontWeight: '800',
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
                      letterSpacing: 0.5,
                    }}
                  >
                    {station.station_code}
                  </Text>
                </View>
              </View>

              {!!station.metro_lines?.length && (
                <View style={styles.badgesRow}>
                  {station.metro_lines.map((line) => (
                    <LineBadge
                      key={`${station.station_code}-${line.line_code}`}
                      name={line.line_code}
                      color={line.primary_color_code}
                      compact
                    />
                  ))}
                  {station.interchange && (
                    <View
                      style={[
                        styles.interchangeTag,
                        { backgroundColor: semantic.interchange, borderColor: '#FFFFFF' },
                      ]}
                    >
                      <Ionicons name="git-compare" size={10} color="#000000" />
                      <Text
                        variant="labelSmall"
                        style={{
                          color: '#000000',
                          fontWeight: '800',
                          fontSize: 10,
                          letterSpacing: 0.3,
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
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
            ) : null}
          </View>
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
    borderRadius: 0,
  },
  card: {
    borderRadius: 0,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 8,
    flexDirection: 'row',
  },
  accentTab: {
    width: 6,
    alignSelf: 'stretch',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 0,
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
  interchangeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 2,
  },
});
