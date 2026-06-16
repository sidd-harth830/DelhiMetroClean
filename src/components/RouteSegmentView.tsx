import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { JourneyRouteSegment } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';

interface Props {
  segment: JourneyRouteSegment;
  lineColor: string;
  isLast?: boolean;
  stationCodeMap?: Map<string, string>;
  onStationPress?: (stationCode: string, stationName: string) => void;
}

export function RouteSegmentView({
  segment,
  lineColor,
  isLast,
  stationCodeMap,
  onStationPress,
}: Props) {
  const theme = useTheme();
  const { semantic, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { borderColor: lineColor },
      ]}
    >
      {/* Line header with colored pill */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: lineColor,
          },
        ]}
      >
        <View style={styles.linePill}>
          <View style={styles.linePillDot} />
          <Text variant="labelMedium" style={{ color: '#000000', fontWeight: '900', letterSpacing: 0.3 }}>
            {segment.line}
          </Text>
        </View>
        {segment.path_time ? (
          <Text
            variant="labelSmall"
            style={{
              color: '#000000',
              fontWeight: '800',
              letterSpacing: 0.2,
            }}
          >
            {segment.path_time}
          </Text>
        ) : null}
      </View>

      {/* Station list */}
      <View style={styles.stationsContainer}>
        <View style={[styles.lineBar, { backgroundColor: lineColor }]} />
        <View style={styles.stations}>
          {segment.path.map((point, index) => {
            const isBold = index === 0 || index === segment.path.length - 1;
            const code = stationCodeMap?.get(point.name.trim().toLowerCase());
            return (
              <View key={`${point.name}-${index}`} style={styles.stationRow}>
                <View
                  style={[
                    styles.stationDot,
                    {
                      borderColor: lineColor,
                      backgroundColor: isBold ? lineColor : theme.colors.surface,
                    },
                    isBold && styles.stationDotBold,
                  ]}
                />
                <Text
                  variant={isBold ? 'bodyMedium' : 'bodySmall'}
                  style={{
                    flex: 1,
                    color: isBold ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    fontWeight: isBold ? '800' : '500',
                    letterSpacing: isBold ? 0.2 : 0,
                  }}
                >
                  {point.name}
                </Text>
                {code ? (
                  <Pressable
                    onPress={() => onStationPress?.(code, point.name)}
                    hitSlop={8}
                    style={[
                      styles.infoBtn,
                      {
                        backgroundColor: lineColor,
                      },
                    ]}
                  >
                    <Ionicons name="information-circle-outline" size={16} color="#FFFFFF" />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>

      {/* Interchange indicator */}
      {!isLast && segment.station_interchange_time > 0 ? (
        <View
          style={[
            styles.interchange,
            {
              backgroundColor: semantic.interchange,
            },
          ]}
        >
          <Ionicons name="git-compare" size={16} color="#000000" />
          <Text
            variant="labelMedium"
            style={{
              color: '#000000',
              fontWeight: '900',
              letterSpacing: 0.2,
            }}
          >
            Change here ({segment.station_interchange_time} min)
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    borderLeftWidth: 0,
    paddingLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 0,
    borderRadius: bentoRadius.card,
  },
  linePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  linePillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  stationsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  lineBar: {
    width: 4,
    borderRadius: 2,
  },
  stations: {
    flex: 1,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  infoBtn: {
    width: 32,
    height: 32,
    borderRadius: bentoRadius.badge,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  stationDotBold: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 0,
  },
  interchange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: bentoRadius.button,
    borderWidth: 0,
    alignSelf: 'flex-start',
  },
});
