import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { account } from '../config/appwrite';
import { ID } from 'react-native-appwrite';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';
import { classifyError } from '../api/errors';

export function LoginScreen() {
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { loginAnonymous, loginWithGoogle, checkSession } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await account.createEmailPasswordSession(email, password);
      } else {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
      }
      await checkSession();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    if (guestLoading) return;
    setGuestLoading(true);
    try {
      await loginAnonymous();
    } catch (error: unknown) {
      const classified = classifyError(error);
      Alert.alert(
        classified.type === 'network' ? 'No Internet' : 'Error',
        classified.message,
      );
    } finally {
      setGuestLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: unknown) {
      const classified = classifyError(error);
      Alert.alert(
        classified.type === 'network' ? 'No Internet' : 'Error',
        classified.message,
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const primaryColor = theme.colors.primary;

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ─── Decorative static background circles ─── */}
      <View style={[styles.bgCircle, { width: 140, height: 140, top: -40, left: -40, backgroundColor: `${primaryColor}06` }]} />
      <View style={[styles.bgCircle, { width: 100, height: 100, top: 60, right: -30, backgroundColor: `${primaryColor}04` }]} />
      <View style={[styles.bgCircle, { width: 80, height: 80, bottom: 120, left: 20, backgroundColor: `${primaryColor}05` }]} />

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: insets.top + spacing['3xl'], paddingBottom: insets.bottom + spacing.xl }
        ]}
      >
        {/* ─── Logo & Hero ─── */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: `${primaryColor}0A` }]}>
            <View style={[styles.logoCircle, { backgroundColor: theme.colors.primaryContainer }]}>
              <Ionicons name="train" size={32} color={theme.colors.primary} />
            </View>
          </View>
          <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {isLogin ? 'Log in to access your saved journeys.' : 'Sign up to sync your preferences across devices.'}
          </Text>
        </View>

        {/* ─── Form Card ─── */}
        <View style={[
          styles.card, 
          { 
            backgroundColor: theme.colors.surface,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1,
          }
        ]}>
          {!isLogin && (
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
              left={<TextInput.Icon icon="account" color={theme.colors.onSurfaceVariant} />}
            />
          )}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.onSurface}
            left={<TextInput.Icon icon="email" color={theme.colors.onSurfaceVariant} />}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.onSurface}
            left={<TextInput.Icon icon="lock" color={theme.colors.onSurfaceVariant} />}
          />

          <Button 
            mode="contained" 
            onPress={handleAuth} 
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            contentStyle={{ paddingVertical: 6 }}
            labelStyle={{ fontWeight: '700', fontSize: 16 }}
            icon={isLogin ? 'login' : 'account-plus'}
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </Button>

          <Button 
            mode="text" 
            onPress={() => setIsLogin(!isLogin)}
            textColor={theme.colors.primary}
            style={styles.switchButton}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </Button>
        </View>

        {/* ─── Divider ─── */}
        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: theme.colors.surfaceVariant }]} />
          <View style={[styles.orBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, fontWeight: '600' }}>OR</Text>
          </View>
          <View style={[styles.line, { backgroundColor: theme.colors.surfaceVariant }]} />
        </View>

        {/* ─── Social & Guest Buttons ─── */}
        <Button 
          mode="contained-tonal" 
          onPress={handleGoogleAuth}
          style={styles.googleButton}
          icon="google"
          loading={googleLoading}
          disabled={googleLoading || loading}
          contentStyle={{ paddingVertical: 4 }}
          labelStyle={{ fontWeight: '600' }}
        >
          Continue with Google
        </Button>

        <Button 
          mode="outlined" 
          onPress={handleGuest}
          style={[styles.guestButton, { borderColor: theme.colors.surfaceVariant }]}
          textColor={theme.colors.onSurface}
          loading={guestLoading}
          disabled={guestLoading || loading}
          contentStyle={{ paddingVertical: 4 }}
          labelStyle={{ fontWeight: '600' }}
          icon="account-arrow-right"
        >
          Continue as Guest
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '900',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    borderRadius: bentoRadius.heroCard,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.lg,
    backgroundColor: 'transparent',
  },
  button: {
    borderRadius: bentoRadius.button,
    marginTop: spacing.md,
  },
  switchButton: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  line: {
    flex: 1,
    height: 1,
  },
  orBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  googleButton: {
    borderRadius: bentoRadius.button,
    marginBottom: spacing.md,
  },
  guestButton: {
    borderRadius: bentoRadius.button,
  },
});
