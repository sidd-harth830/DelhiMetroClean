import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Models, ID, OAuthProvider } from 'react-native-appwrite';
import { account, databases } from '../config/appwrite';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Linking } from 'react-native';

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
      setIsLoading(true);

      if (Platform.OS === 'web') {
        const redirectUrl = window.location.origin;
        // createOAuth2Session returns a URL object in SDK. In web, we redirect the window.
        const authUrl = account.createOAuth2Session(OAuthProvider.Google, redirectUrl, redirectUrl);
        window.location.href = authUrl.toString();
        return; // Redirects page
      }

      // Mobile / Native flow
      const redirectUrl = 'com.siddharth.dmrc://auth';
      const authUrl = account.createOAuth2Token(OAuthProvider.Google, redirectUrl, redirectUrl);

      console.log('Initiating OAuth login with URL:', authUrl.toString());
      console.log('Redirect URI:', redirectUrl);

      const result = await WebBrowser.openAuthSessionAsync(authUrl.toString(), redirectUrl);

      if (result.type === 'success' && result.url) {
        console.log('OAuth login redirect URL:', result.url);
        const parsedUrl = new URL(result.url);
        let userId = parsedUrl.searchParams.get('userId');
        let secret = parsedUrl.searchParams.get('secret');

        if (!userId || !secret) {
          // Fallback parser if searchParams object is empty
          const query = result.url.split('?')[1] || '';
          const params = new URLSearchParams(query);
          userId = params.get('userId');
          secret = params.get('secret');
        }

        if (userId && secret) {
          await account.createSession(userId, secret);
          await checkSession();
        } else {
          throw new Error('Failed to retrieve authentication token from redirect.');
        }
      } else {
        // User cancelled or closed browser
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Google login failed:', error);
      setIsLoading(false);
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
