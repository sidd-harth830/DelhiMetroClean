/**
 * GlassCard — Frosted glass container component.
 *
 * Uses expo-blur for the backdrop blur effect and expo-linear-gradient
 * for a subtle glass overlay. Adapts to light/dark mode automatically.
 *
 * Usage:
 *   <GlassCard>
 *     <Text>Your content here</Text>
 *   </GlassCard>
 */

import React from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, type AnimatedStyle } from 'react-native-reanimated';
import { useAppTheme } from '../theme/ThemeContext';
import { bentoRadius, bentoGradients } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface GlassCardProps {
  children: React.ReactNode;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Animated style from Reanimated */
  animatedStyle?: AnimatedStyle<ViewStyle>;
  /** Blur intensity. Default: 40 (dark) / 80 (light) */
  intensity?: number;
  /** Border radius. Default: bentoRadius.card (24) */
  borderRadius?: number;
  /** Internal padding. Default: spacing.cardPadding (20) */
  padding?: number;
  /** Whether to animate in on mount. Default: true */
  animated?: boolean;
  /** Fade-in duration in ms. Default: 400 */
  enterDuration?: number;
  /** Whether to skip the blur (e.g. for performance). Default: false */
  noBlur?: boolean;
}

export function GlassCard({
  children,
  style,
  animatedStyle,
  intensity,
  borderRadius = bentoRadius.card,
  padding = spacing.cardPadding,
  animated = true,
  enterDuration = 400,
  noBlur = false,
}: GlassCardProps) {
  const { isDark, shadows } = useAppTheme();

  const resolvedIntensity = intensity ?? (isDark ? 40 : 80);
  const glassBorder = isDark
    ? bentoGradients.glassBorderDark
    : bentoGradients.glassBorderLight;
  const gradientColors = isDark
    ? [...bentoGradients.glassDark]
    : [...bentoGradients.glassLight];

  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glassBorder,
    ...shadows.medium,
  };

  const innerContent = (
    <View style={[containerStyle, style]}>
      {!noBlur && (
        <BlurView
          intensity={resolvedIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Fallback background for platforms where blur may not render */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark
              ? 'rgba(20, 20, 28, 0.65)'
              : 'rgba(255, 255, 255, 0.55)',
          },
        ]}
      />
      <View style={{ padding, position: 'relative', zIndex: 1 }}>
        {children}
      </View>
    </View>
  );

  if (animated) {
    return (
      <Animated.View
        entering={FadeIn.duration(enterDuration)}
        style={animatedStyle}
      >
        {innerContent}
      </Animated.View>
    );
  }

  return innerContent;
}
