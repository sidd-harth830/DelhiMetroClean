/**
 * FloatingButton — Pill-shaped CTA with gradient fill.
 *
 * Matches the "Make Payment >>>" style from the reference images.
 * Uses expo-linear-gradient for the background and Reanimated
 * for spring-based press animations.
 *
 * Usage:
 *   <FloatingButton label="Search Route" onPress={handleSearch} icon="search" />
 */

import React from 'react';
import { StyleSheet, View, Pressable, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAppTheme } from '../theme/ThemeContext';
import { bentoRadius } from '../theme/colors';
import { fontFamily } from '../theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FloatingButtonProps {
  /** Button label text */
  label: string;
  /** Press handler */
  onPress: () => void;
  /** Ionicons icon name (shown on the right in a circle) */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Custom gradient colors [start, end]. Falls back to palette CTA gradient */
  gradient?: readonly string[];
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'default' | 'large';
  /** Container style override */
  style?: StyleProp<ViewStyle>;
}

export function FloatingButton({
  label,
  onPress,
  icon = 'chevron-forward',
  gradient,
  disabled = false,
  size = 'default',
  style,
}: FloatingButtonProps) {
  const { gradients, isDark, fonts } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const gradientColors = gradient
    ? [...gradient]
    : [...gradients.cta];

  const isLarge = size === 'large';
  const paddingVertical = isLarge ? 18 : 14;
  const paddingHorizontal = isLarge ? 32 : 24;
  const fontSize = isLarge ? 18 : 16;
  const iconContainerSize = isLarge ? 36 : 30;
  const iconSize = isLarge ? 18 : 16;

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
      disabled={disabled}
    >
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            paddingVertical,
            paddingLeft: paddingHorizontal,
            paddingRight: paddingHorizontal - 4,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            {
              fontSize,
              fontFamily: fonts.headingSemiBold,
              color: '#FFFFFF',
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {/* Circular icon container (like the ">>" in reference) */}
        <View
          style={[
            styles.iconCircle,
            {
              width: iconContainerSize,
              height: iconContainerSize,
              borderRadius: iconContainerSize / 2,
              backgroundColor: 'rgba(255,255,255,0.25)',
            },
          ]}
        >
          <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: bentoRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
