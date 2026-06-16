import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Linking, Alert } from 'react-native';
import { Text, Button, ProgressBar, useTheme } from 'react-native-paper';
import * as Updates from 'expo-updates';
import { databases } from '../config/appwrite';
import { Query } from 'react-native-appwrite';
import appConfig from '../../app.json';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';

export function AppUpdateDialog() {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [updateType, setUpdateType] = useState<'none' | 'ota' | 'apk'>('none');
  const [newVersion, setNewVersion] = useState('');
  const [apkUrl, setApkUrl] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);
  
  const [isDownloading, setIsDownloading] = useState(false);
  
  const updatesInfo = Updates.useUpdates() as any;
  const downloadedBytes: number = updatesInfo?.downloadedBytes ?? 0;
  const totalBytes: number = updatesInfo?.totalBytes ?? 0;

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // 1. Check for OTA Updates
      if (!__DEV__) {
        const otaUpdate = await Updates.checkForUpdateAsync();
        if (otaUpdate.isAvailable) {
          setUpdateType('ota');
          setNewVersion('Minor Update');
          setVisible(true);
          return;
        }
      }

      // 2. Check for Appwrite APK Releases
      const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
      const collectionId = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID;

      if (databaseId && collectionId) {
        const response = await databases.listDocuments(
          databaseId,
          collectionId,
          [
            Query.orderDesc('releaseDate'),
            Query.equal('status', 'released'),
            Query.limit(1)
          ]
        );

        if (response.documents.length > 0) {
          const latestRelease = response.documents[0];
          const currentVersion = appConfig.expo.version;

          if (isVersionGreater(latestRelease.versionNumber, currentVersion)) {
            setUpdateType('apk');
            setNewVersion(latestRelease.versionNumber);
            setApkUrl(latestRelease.apkUrl);
            setIsMandatory(latestRelease.isMandatory || false);
            setVisible(true);
          }
        }
      }
    } catch (error: any) {
      if (error?.message?.includes('Collection with the requested ID')) {
        console.warn('Update check: Appwrite releases collection not found in database.');
      } else {
        console.warn('Update check failed:', error?.message || error);
      }
    }
  };

  const isVersionGreater = (v1: string, v2: string) => {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return true;
      if (num1 < num2) return false;
    }
    return false;
  };

  const handleUpdate = async () => {
    if (updateType === 'ota') {
      try {
        setIsDownloading(true);
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } catch (error) {
        Alert.alert('Error', 'Failed to download OTA update');
        setIsDownloading(false);
      }
    } else if (updateType === 'apk') {
      if (apkUrl) {
        Linking.openURL(apkUrl);
        if (!isMandatory) {
          setVisible(false);
        }
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            {updateType === 'ota' ? 'Patch Available' : 'New Version Available'}
          </Text>
          
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: spacing.md }}>
            {updateType === 'ota' 
              ? 'A patch with bug fixes, UI improvements, and settings updates is ready to install. No reinstall needed.' 
              : `Version ${newVersion} is available with new features and improvements. Please download and install the latest version.`}
          </Text>

          {isDownloading && updateType === 'ota' ? (
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={totalBytes > 0 ? downloadedBytes / totalBytes : 0} 
                color={theme.colors.primary} 
                style={styles.progressBar}
              />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                Downloading... {(downloadedBytes / 1048576).toFixed(2)} MB
              </Text>
            </View>
          ) : (
            <View style={styles.actions}>
              {!isMandatory && (
                <Button 
                  mode="text" 
                  onPress={() => setVisible(false)} 
                  textColor={theme.colors.onSurfaceVariant}
                >
                  Later
                </Button>
              )}
              <Button 
                mode="contained" 
                onPress={handleUpdate}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
                style={{ borderRadius: bentoRadius.button, marginLeft: spacing.sm }}
              >
                {updateType === 'ota' ? 'Install Patch' : 'Download Update'}
              </Button>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    borderRadius: bentoRadius.card,
    padding: spacing.xl,
  },
  title: {
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  progressContainer: {
    marginVertical: spacing.lg,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
});
