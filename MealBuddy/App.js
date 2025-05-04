import React from 'react';
import 'react-native-url-polyfill/auto';
import { app } from './src/services/firebase_config';
import { registerRootComponent } from 'expo';
import AppNavigator from './src/navigation/AppNavigator';

console.log('Firebase Initialized:', app.name);

const App = () => <AppNavigator />;

registerRootComponent(App); // ✅ Use App here

export default App;
