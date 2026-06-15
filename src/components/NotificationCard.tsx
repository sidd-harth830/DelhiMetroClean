import { useState, useRef } from 'react';
import { StyleSheet, View, Animated, LayoutAnimation } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { PassengerNotification } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

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

  const cardBg = isDark ? `${semantic.info}12` : `${semantic.info}08`;

  return (
    <View style={styles.wrapper}>
      <TouchableRipple
        onPress={toggleExpand}
        rippleColor={theme.colors.primary}
        borderless
        style={styles.ripple}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: cardBg,
            },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: semantic.info,
              },
            ]}
          >
            <Ionicons name="megaphone-outline" size={18} color="#FFFFFF" />
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
              <Ionicons name="chevron-down" size={20} color={theme.colors.primary} />
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
    borderRadius: 18,
  },
  container: {
    borderRadius: 18,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
