import { useState, useRef } from 'react';
import { StyleSheet, View, Animated, LayoutAnimation } from 'react-native';
import { Surface, Text, useTheme, TouchableRipple } from 'react-native-paper';
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
    <Surface style={styles.container} elevation={1}>
      <TouchableRipple onPress={toggleExpand} style={styles.touchable}>
        <View style={styles.inner}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons name="megaphone-outline" size={18} color={theme.colors.onPrimaryContainer} />
          </View>
          <View style={styles.content}>
            <Text variant="bodyMedium" numberOfLines={expanded ? 0 : 2} style={{ color: theme.colors.onSurface }}>
              {notification.title}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              {notification.date}
            </Text>
          </View>
          <View style={styles.chevronWrap}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="chevron-down" size={20} color={theme.colors.outline} />
            </Animated.View>
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
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
