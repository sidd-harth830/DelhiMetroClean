/**
 * GradientBackground — Full-screen gradient wrapper.
 *
 * Renders a LinearGradient as the base layer for any screen,
 * using the active palette's gradient stops from ThemeContext.
 *
 * Usage:
 *   <GradientBackground>
 *     <ScrollView>...</ScrollView>
 *   </GradientBackground>
 */

import React from 'react';
import { StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../theme/ThemeContext';

interface GradientBackgroundProps {
  children: React.ReactNode;
  /** Override with custom gradient colors */
  customColors?: readonly string[];
  /** Container style override */
  style?: StyleProp<ViewStyle>;
  /** Gradient direction. Default: vertical (top → bottom) */
  direction?: 'vertical' | 'horizontal' | 'diagonal';
}

export function GradientBackground({
  children,
  customColors,
  style,
  direction = 'vertical',
}: GradientBackgroundProps) {
  const { gradients } = useAppTheme();

  const colors = customColors
    ? [...customColors]
    : [...gradients.background];

  const start = direction === 'horizontal'
    ? { x: 0, y: 0.5 }
    : direction === 'diagonal'
      ? { x: 0, y: 0 }
      : { x: 0.5, y: 0 };

  const end = direction === 'horizontal'
    ? { x: 1, y: 0.5 }
    : direction === 'diagonal'
      ? { x: 1, y: 1 }
      : { x: 0.5, y: 1 };

  return (
    <LinearGradient
      colors={colors as any}
      start={start}
      end={end}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
