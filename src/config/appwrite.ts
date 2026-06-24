import { Client, Account, Databases, OAuthProvider } from 'react-native-appwrite';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '6a2ce46a003230dcf661';

export const client = new Client()
    .setProject(projectId)
    .setEndpoint(endpoint);

if (Platform.OS !== 'web') {
    client.setPlatform('com.siddharth.dmrc');
}

export const appwriteClient = client;

export const account = new Account(client);
export const databases = new Databases(client);
export { OAuthProvider };
