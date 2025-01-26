import React from 'react';
import 'react-native-url-polyfill/auto';
import TabNavigator from './src/navigation/tab_navigator';
import firebase from './src/services/firebase_config';
import { registerRootComponent } from 'expo';

console.log('Firebase Initialized:', firebase.apps.length > 0);

const App = () => {
  return <TabNavigator />;
};

// Register the root component
registerRootComponent(App);

export default App;
