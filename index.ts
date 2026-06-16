import { registerRootComponent } from 'expo';
import { client } from './src/config/appwrite';

import App from './App';

// Ping Appwrite server on startup to verify setup
client.ping()
    .then((response) => console.log('Appwrite connection verified successfully:', response))
    .catch((error) => console.error('Appwrite verification ping failed:', error));

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
