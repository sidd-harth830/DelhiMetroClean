import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Models, ID, OAuthProvider } from 'react-native-appwrite';
import { account, databases } from '../config/appwrite';
import * as WebBrowser from 'expo-web-browser';

// Polyfill for OAuth flow
WebBrowser.maybeCompleteAuthSession();

export interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  loginAnonymous: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      const currentAccount = await account.get();
      setUser(currentAccount);
    } catch (error) {
      // Not logged in or session expired
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const loginAnonymous = async () => {
    try {
      setIsLoading(true);
      await account.createAnonymousSession();
      await checkSession();
    } catch (error) {
      console.error('Anonymous login failed', error);
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      // In Expo, we often use Linking for deep links. But the Appwrite React Native SDK handles this 
      // if properly configured. For now we use the OAuth2Session method.
      // A full deep link setup might require scheme config in app.json.
      const deepLink = new URL('com.siddharth.dmrc://auth');
      await account.createOAuth2Session(OAuthProvider.Google, deepLink.toString(), deepLink.toString());
      await checkSession();
    } catch (error) {
      console.error('Google login failed', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginAnonymous,
        loginWithGoogle,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
