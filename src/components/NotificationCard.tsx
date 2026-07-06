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
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.8 },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
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

  const expandedBg = isDark ? `${theme.colors.elevation.level1}` : `${theme.colors.surfaceVariant}`;

  return (
    <View style={styles.wrapper}>
      <TouchableRipple
        onPress={toggleExpand}
        rippleColor={isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}
        borderless
        style={styles.ripple}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            },
          ]}
        >
          <View style={[styles.accentStrip, { backgroundColor: semantic.pink_line }]} />

          <View style={styles.headerRow}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: semantic.pink_line },
              ]}
            >
              <Ionicons name="megaphone" size={18} color="#000000" />
            </View>
            
            <View style={styles.headerTextWrap}>
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
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

          <View style={[
            styles.contentBox,
            expanded && [styles.contentBoxExpanded, { backgroundColor: expandedBg }]
          ]}>
            <Text
              variant="bodyMedium"
              numberOfLines={expanded ? 0 : 2}
              style={[
                styles.messageText,
                {
                  color: theme.colors.onSurface,
                  lineHeight: 22,
                },
                expanded && styles.messageTextExpanded
              ]}
            >
              {notification.title}
            </Text>
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
    gap: spacing.sm,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  chevronWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  contentBox: {
    paddingLeft: 36 + spacing.md, // icon width + gap
    paddingRight: spacing.sm,
  },
  contentBoxExpanded: {
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: bentoRadius.small,
  },
  messageText: {
    fontWeight: '500',
  },
  messageTextExpanded: {
    fontWeight: '400',
  },
});
