import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Pressable, Alert, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ActivityIndicator, Button, Text, useTheme, Portal, Modal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useMapFamilyPrimaryQuery } from '../hooks/useMapQueries';
import { useAppTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';
import { useDI } from '../di/DIContext';
import { getApiKey, API_KEY_HEADER } from '../config/apiKeyProvider';
import { env } from '../config/env';

const MAP_FILE_NAME = 'dmrc_interactive_map.svg';
const MAP_FILE_URI = FileSystem.documentDirectory + MAP_FILE_NAME;

/**
 * Checks whether a cached file looks like a valid SVG.
 * Prevents corrupted/partial downloads or JSON error pages from being used.
 */
async function isCachedMapValid(): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(MAP_FILE_URI);
    if (!fileInfo.exists) return false;

    // Must be a reasonable size (real SVGs are usually > 10KB)
    if (fileInfo.size !== undefined && fileInfo.size < 1024) return false;

    // Read the first 200 bytes and check for SVG markers
    const head = await FileSystem.readAsStringAsync(MAP_FILE_URI, {
      encoding: FileSystem.EncodingType.UTF8,
      length: 200,
    });

    const trimmed = head.trimStart().toLowerCase();
    return trimmed.startsWith('<svg') || trimmed.startsWith('<?xml') || trimmed.startsWith('<!doctype svg');
  } catch {
    return false;
  }
}

export function MetroMapScreen() {
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { mapService } = useDI();
  
  const webviewRef = useRef<WebView>(null);
  
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [legendVisible, setLegendVisible] = useState(false);

  const { data: networkMapData } = useMapFamilyPrimaryQuery('network');

  const loadMap = useCallback(async () => {
    setError(null);
    setSvgContent(null);

    try {
      const isValid = await isCachedMapValid();
      
      if (!isValid) {
        // Delete any corrupt/invalid cached file
        await FileSystem.deleteAsync(MAP_FILE_URI, { idempotent: true });

        // Build download headers with API key
        const headers: Record<string, string> = {};
        const apiKey = getApiKey();
        if (apiKey) {
          headers[API_KEY_HEADER] = apiKey;
        }

        const interactiveMapUrl = `${env.apiBaseUrl}/dmrc/interactive-map`;
        
        const result = await FileSystem.downloadAsync(interactiveMapUrl, MAP_FILE_URI, { headers });
        if (result.status !== 200) {
          throw new Error(`Failed to download map. HTTP ${result.status}`);
        }

        // Validate the downloaded file is actually an SVG
        const downloadedValid = await isCachedMapValid();
        if (!downloadedValid) {
          await FileSystem.deleteAsync(MAP_FILE_URI, { idempotent: true });
          throw new Error('Downloaded file is not a valid SVG map. The server may be temporarily unavailable.');
        }
      }

      let content = await FileSystem.readAsStringAsync(MAP_FILE_URI, { encoding: FileSystem.EncodingType.UTF8 });
      
      // Ensure SVG has a viewBox so it fits perfectly on screen without clipping
      if (!content.includes('viewBox=')) {
        content = content.replace('<svg ', '<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" ');
      }
      
      setSvgContent(content);
    } catch (e: any) {
      console.error('[MetroMapScreen] Map load failed:', e);
      setError(e.message || 'Failed to load interactive map.');
    }
  }, [mapService]);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  const handleZoomIn = () => {
    webviewRef.current?.injectJavaScript(`
      window.zoomScale = (window.zoomScale || 1) * 1.25;
      document.querySelector('svg').style.transform = 'scale(' + window.zoomScale + ')';
      true;
    `);
  };

  const handleZoomOut = () => {
    webviewRef.current?.injectJavaScript(`
      window.zoomScale = (window.zoomScale || 1) / 1.25;
      document.querySelector('svg').style.transform = 'scale(' + window.zoomScale + ')';
      true;
    `);
  };

  const handleDownload = async () => {
    try {
      const downloadUrl = networkMapData?.pdf?.url || networkMapData?.image?.url;
      if (!downloadUrl) {
        Alert.alert('Unavailable', 'Map is not available at the moment.');
        return;
      }
      setDownloading(true);
      const isPdf = !!networkMapData?.pdf?.url;
      const ext = isPdf ? 'pdf' : 'jpg';
      const mimeType = isPdf ? 'application/pdf' : 'image/jpeg';
      
      const fileUri = (FileSystem.cacheDirectory ?? '') + `delhi-metro-map.${ext}`;
      const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType, dialogTitle: 'Delhi Metro Network Map' });
      } else {
        Alert.alert('Unavailable', 'Sharing is not available on this device.');
      }
    } catch (e) {
      console.error('[MetroMapScreen] Download failed:', e);
      Alert.alert('Error', 'Failed to share or download the map.');
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="warning-outline" size={48} color={theme.colors.error} />
        <Text variant="titleMedium" style={{ color: theme.colors.error, marginTop: spacing.md, textAlign: 'center' }}>
          {error}
        </Text>
        <Button
          mode="contained-tonal"
          onPress={loadMap}
          style={{ marginTop: spacing.lg }}
          buttonColor={theme.colors.errorContainer}
          textColor={theme.colors.onErrorContainer}
          icon="refresh"
        >
          Try Again
        </Button>
      </View>
    );
  }

  if (!svgContent) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={{ marginTop: spacing.md, color: theme.colors.onSurfaceVariant }}>
          Rendering interactive map...
        </Text>
      </View>
    );
  }

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=0.5, user-scalable=yes">
    <style>
      body, html {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: ${theme.colors.surface};
        background-image: radial-gradient(${theme.colors.onSurfaceVariant}30 1.5px, transparent 1.5px);
        background-size: 25px 25px;
        overflow: auto;
      }
      #wrapper {
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      #svg-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      svg {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain;
        transform-origin: center center;
        transition: transform 0.2s ease-out;
      }
      /* Override black text for dark mode */
      text {
        fill: ${theme.colors.onBackground} !important;
      }
      /* Hide all locate flags that appear by default in the SVG */
      .fromFlags, .toFlags, .fromFlag, .toFlag, [class*="locate"], [id*="locate"] {
        display: none !important;
      }
    </style>
  </head>
  <body>
    <div id="wrapper">
      <div id="svg-container">
        ${svgContent}
      </div>
    </div>
    <script>
      // Centering is handled by CSS flexbox on the 100vw wrapper
    </script>
  </body>
  </html>
  `;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={[styles.mapContainer, { backgroundColor: theme.colors.surface }]}>
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent, baseUrl: FileSystem.documentDirectory || '' }}
          style={styles.webview}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scalesPageToFit={true}
        />
        
        {/* Zoom controls overlay */}
        <View style={[styles.zoomControls, { bottom: insets.bottom + spacing['2xl'] + 80 }]} pointerEvents="box-none">
          <Pressable
            style={[styles.zoomBtn, { backgroundColor: isDark ? theme.colors.elevation.level4 : theme.colors.surface }]}
            onPress={handleZoomIn}
          >
            <Ionicons name="add" size={22} color={theme.colors.onSurface} />
          </Pressable>
          <Pressable
            style={[styles.zoomBtn, { backgroundColor: isDark ? theme.colors.elevation.level4 : theme.colors.surface }]}
            onPress={handleZoomOut}
          >
            <Ionicons name="remove" size={22} color={theme.colors.onSurface} />
          </Pressable>
        </View>

        {/* Legend FAB */}
        <Pressable
          style={[
            styles.fab,
            {
              top: spacing.base,
              right: spacing.base,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isDark ? theme.colors.elevation.level4 : theme.colors.surface,
            },
          ]}
          onPress={() => setLegendVisible(true)}
        >
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.onSurface} />
        </Pressable>

        {/* Download FAB */}
        <Pressable
          style={[
            styles.fab,
            {
              bottom: insets.bottom + spacing['2xl'] + 80,
              left: spacing.base,
              backgroundColor: downloading ? theme.colors.surfaceVariant : theme.colors.primary,
            },
          ]}
          onPress={handleDownload}
          disabled={downloading}
        >
          {downloading
            ? <ActivityIndicator size={26} color={theme.colors.onSurfaceVariant} />
            : <Ionicons name="download-outline" size={26} color={theme.colors.onPrimary} />
          }
        </Pressable>
      </View>

      <Portal>
        <Modal
          visible={legendVisible}
          onDismiss={() => setLegendVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)', maxHeight: '80%', padding: 0, overflow: 'hidden' }]}
        >
          <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom: spacing.md, color: theme.colors.onSurface }}>
            Map Legend
          </Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FF0000' }]} />
            <Text style={{ color: theme.colors.onSurface }}>Red Line</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
            <Text style={{ color: theme.colors.onSurface }}>Yellow Line</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#0000FF' }]} />
            <Text style={{ color: theme.colors.onSurface }}>Blue Line</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#008000' }]} />
            <Text style={{ color: theme.colors.onSurface }}>Green Line</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#EE82EE' }]} />
            <Text style={{ color: theme.colors.onSurface }}>Violet Line</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FFC0CB' }]} />
            <Text style={{ color: theme.colors.onSurface }}>Pink Line</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FF00FF' }]} />
            <Text style={{ color: theme.colors.onSurface }}>Magenta Line</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#808080' }]} />
            <Text style={{ color: theme.colors.onSurface }}>Grey Line</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
            <Text style={{ color: theme.colors.onSurface }}>Orange Line</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#00FFFF' }]} />
            <Text style={{ color: theme.colors.onSurface }}>Aqua Line</Text>
          </View>
          <View style={{ height: 1, backgroundColor: theme.colors.outlineVariant, marginVertical: spacing.md }} />
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: 'transparent', borderColor: theme.colors.onSurface, borderWidth: 2 }]} />
            <Text style={{ color: theme.colors.onSurface }}>Normal Station</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: 'transparent', borderColor: theme.colors.onSurface, borderWidth: 2, borderRadius: 4, width: 20 }]} />
            <Text style={{ color: theme.colors.onSurface }}>Interchange Station</Text>
          </View>
          <View style={styles.legendRow}>
            <Ionicons name="water" size={20} color="#00BFFF" style={{ marginRight: spacing.sm, width: 20 }} />
            <Text style={{ color: theme.colors.onSurface }}>Water Body</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={{ height: 0, width: 16, borderStyle: 'dotted', borderWidth: 2, borderColor: theme.colors.onSurface, marginRight: spacing.sm }} />
            <Text style={{ color: theme.colors.onSurface }}>Foot Over Bridge / Walkway</Text>
          </View>
          <View style={styles.legendRow}>
            <Ionicons name="car" size={20} color={theme.colors.onSurface} style={{ marginRight: spacing.sm, width: 20 }} />
            <Text style={{ color: theme.colors.onSurface }}>Parking Available</Text>
          </View>
          <Pressable
            style={[styles.closeBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => setLegendVisible(false)}
          >
            <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>Close</Text>
          </Pressable>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.sm,
  },
  mapContainer: {
    flex: 1,
    borderRadius: bentoRadius.card,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  zoomControls: {
    position: 'absolute',
    right: spacing.base,
    gap: spacing.sm,
  },
  zoomBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modal: {
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: bentoRadius.card,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  closeBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: bentoRadius.button,
    alignItems: 'center',
  },
});
