import { useState, useRef } from 'react';
import { StyleSheet, View, Animated, LayoutAnimation } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { PassengerNotification } from '../types';
import { spacing } from '../theme';

interface Props {
  notification: PassengerNotification;
}

export function NotificationCard({ notification }: Props) {
  const theme = useTheme();
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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.elevation.level2,
          borderColor: '#FFFFFF',
        },
      ]}
    >
      <TouchableRipple onPress={toggleExpand} style={styles.touchable}>
        <View style={styles.inner}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: theme.colors.secondary,
                borderColor: '#000000',
              },
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
                fontWeight: '700',
              }}
            >
              {notification.title}
            </Text>
            <Text
              variant="labelSmall"
              style={{
                color: theme.colors.outline,
                fontWeight: '600',
                letterSpacing: 0.2,
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
  container: {
    borderRadius: 0,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowColor: '#000000',
    shadowRadius: 0,
    elevation: 6,
  },
  touchable: {
    padding: spacing.base,
  },
  inner: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 0,
    borderWidth: 2,
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
