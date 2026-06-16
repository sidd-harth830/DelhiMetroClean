import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { account } from '../config/appwrite';
import { ID } from 'react-native-appwrite';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme';
import { bentoRadius } from '../theme/colors';

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
        // Login immediately after register
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
    try {
      await loginAnonymous();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to continue as guest');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google login failed');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: insets.top + spacing['2xl'], paddingBottom: insets.bottom + spacing.xl }
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.logoPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={{ fontSize: 32, color: theme.colors.primary }}>🚇</Text>
          </View>
          <Text variant="displaySmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            {isLogin ? 'Log in to access your saved journeys.' : 'Sign up to sync your preferences.'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
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
          />

          <Button 
            mode="contained" 
            onPress={handleAuth} 
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
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

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: theme.colors.surfaceVariant }]} />
          <Text style={{ color: theme.colors.onSurfaceVariant, paddingHorizontal: 16 }}>OR</Text>
          <View style={[styles.line, { backgroundColor: theme.colors.surfaceVariant }]} />
        </View>

        <Button 
          mode="contained-tonal" 
          onPress={handleGoogleAuth}
          style={styles.googleButton}
          icon="google"
        >
          Continue with Google
        </Button>

        <Button 
          mode="outlined" 
          onPress={handleGuest}
          style={[styles.guestButton, { borderColor: theme.colors.surfaceVariant }]}
          textColor={theme.colors.onSurface}
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
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: bentoRadius.icon,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  card: {
    borderRadius: bentoRadius.card,
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
    paddingVertical: spacing.xs,
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
  googleButton: {
    borderRadius: bentoRadius.button,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  guestButton: {
    borderRadius: bentoRadius.button,
    paddingVertical: spacing.xs,
  },
});
