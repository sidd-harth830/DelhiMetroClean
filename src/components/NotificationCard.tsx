import { useState, useRef } from 'react';
import { StyleSheet, View, Animated, LayoutAnimation } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { PassengerNotification } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';

interface Props {
  notification: PassengerNotification;
}

export function NotificationCard({ notification }: Props) {
  const theme = useTheme();
  const { isDark, semantic } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const cardBg = isDark ? `${semantic.pink_line}14` : `${semantic.pink_line}0A`;

  return (
    <View style={styles.wrapper}>
      <TouchableRipple
        onPress={toggleExpand}
        rippleColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
        borderless
        style={styles.ripple}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: cardBg,
              borderWidth: isDark ? 0 : 1,
              borderColor: isDark ? 'transparent' : 'rgba(0,0,0,0.06)',
            },
          ]}
        >
          {/* Colored left accent */}
          <View style={[styles.accentStrip, { backgroundColor: semantic.pink_line }]} />

          <View
            style={[
              styles.iconWrap,
              { backgroundColor: semantic.pink_line },
            ]}
          >
            <Ionicons name="megaphone-outline" size={18} color="#000000" />
          </View>
          <View style={styles.content}>
            <Text
              variant="bodyMedium"
              numberOfLines={expanded ? 0 : 2}
              style={{
                color: theme.colors.onSurface,
                fontWeight: '600',
              }}
            >
              {notification.title}
            </Text>
            <Text
              variant="labelSmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                fontWeight: '500',
                marginTop: spacing.xs,
              }}
            >
              {notification.date}
            </Text>
          </View>
          <View style={styles.chevronWrap}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="chevron-down" size={20} color={semantic.pink_line} />
            </Animated.View>
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
    borderRadius: bentoRadius.card,
  },
  container: {
    borderRadius: bentoRadius.card,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  accentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: bentoRadius.card,
    borderBottomLeftRadius: bentoRadius.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: bentoRadius.badge,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  chevronWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
});
