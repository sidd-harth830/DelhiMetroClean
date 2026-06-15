/**
 * Material 3 color schemes for Delhi Metro.
 *
 * Dark palette: deep true-blacks with cool-blue tonal surfaces
 * like Metrolist — moody, layered, premium feel.
 */

export const lightScheme = {
  primary: 'rgb(0, 95, 175)',
  onPrimary: 'rgb(255, 255, 255)',
  primaryContainer: 'rgb(212, 227, 255)',
  onPrimaryContainer: 'rgb(0, 28, 58)',
  secondary: 'rgb(84, 95, 113)',
  onSecondary: 'rgb(255, 255, 255)',
  secondaryContainer: 'rgb(216, 227, 248)',
  onSecondaryContainer: 'rgb(17, 28, 43)',
  tertiary: 'rgb(110, 86, 118)',
  onTertiary: 'rgb(255, 255, 255)',
  tertiaryContainer: 'rgb(248, 216, 255)',
  onTertiaryContainer: 'rgb(39, 19, 47)',
  error: 'rgb(186, 26, 26)',
  onError: 'rgb(255, 255, 255)',
  errorContainer: 'rgb(255, 218, 214)',
  onErrorContainer: 'rgb(65, 0, 2)',
  background: 'rgb(253, 252, 255)',
  onBackground: 'rgb(26, 28, 30)',
  surface: 'rgb(253, 252, 255)',
  onSurface: 'rgb(26, 28, 30)',
  surfaceVariant: 'rgb(224, 226, 236)',
  onSurfaceVariant: 'rgb(67, 71, 78)',
  outline: 'rgb(116, 119, 127)',
  outlineVariant: 'rgb(196, 198, 208)',
  inverseSurface: 'rgb(47, 48, 51)',
  inverseOnSurface: 'rgb(241, 240, 244)',
  inversePrimary: 'rgb(165, 200, 255)',
  elevation: {
    level0: 'transparent',
    level1: 'rgb(240, 244, 251)',
    level2: 'rgb(233, 239, 249)',
    level3: 'rgb(225, 235, 247)',
    level4: 'rgb(223, 233, 246)',
    level5: 'rgb(218, 230, 245)',
  },
  surfaceDisabled: 'rgba(26, 28, 30, 0.12)',
  onSurfaceDisabled: 'rgba(26, 28, 30, 0.38)',
  backdrop: 'rgba(45, 49, 56, 0.4)',

  // App-specific semantic tokens
  success: 'rgb(27, 109, 48)',
  successContainer: 'rgb(163, 246, 169)',
  warning: 'rgb(123, 88, 0)',
  warningContainer: 'rgb(255, 222, 161)',
  interchange: 'rgb(139, 80, 0)',
};

export const darkScheme = {
  // Neo-Brutalist: Volt Lime primary
  primary: '#CCFF00',
  onPrimary: '#000000',
  primaryContainer: '#A3E635',
  onPrimaryContainer: '#000000',
  // Neo-Brutalist: Cyber Cyan secondary
  secondary: '#22D3EE',
  onSecondary: '#000000',
  secondaryContainer: '#A7F3D0',
  onSecondaryContainer: '#000000',
  // Neo-Brutalist: Soft Coral tertiary
  tertiary: '#F87171',
  onTertiary: '#000000',
  tertiaryContainer: '#FCA5A5',
  onTertiaryContainer: '#000000',
  // Neon error
  error: '#FF5555',
  onError: '#000000',
  errorContainer: '#FF8888',
  onErrorContainer: '#000000',
  // Pitch-black backgrounds
  background: '#000000',
  onBackground: '#FFFFFF',
  surface: '#000000',
  onSurface: '#FFFFFF',
  // Dark gray for secondary text
  surfaceVariant: '#1A1A1A',
  onSurfaceVariant: '#E0E0E0',
  // Stark outline for hard edges
  outline: '#FFFFFF',
  outlineVariant: '#404040',
  inverseSurface: '#FFFFFF',
  inverseOnSurface: '#000000',
  inversePrimary: '#000000',
  elevation: {
    level0: 'transparent',
    level1: '#0A0A0A',
    level2: '#1A1A1A',
    level3: '#2A2A2A',
    level4: '#3A3A3A',
    level5: '#4A4A4A',
  },
  surfaceDisabled: 'rgba(255, 255, 255, 0.12)',
  onSurfaceDisabled: 'rgba(255, 255, 255, 0.38)',
  backdrop: 'rgba(0, 0, 0, 0.8)',

  // App-specific semantic tokens (all high-voltage neons)
  success: '#CCFF00',
  successContainer: '#A3E635',
  warning: '#FF8F00',
  warningContainer: '#FFB946',
  interchange: '#FBCFE8',
};
