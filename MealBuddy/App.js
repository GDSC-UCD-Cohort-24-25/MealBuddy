import React from 'react';
import 'react-native-url-polyfill/auto';
import TabNavigator from './src/navigation/tab_navigator';
import { registerRootComponent } from 'expo';
import { app } from './src/services/firebase_config';

console.log('Firebase Initialized:', app.name);

const App = () => {
  return <TabNavigator />;
};

// Register the root component
registerRootComponent(App);

export default App;
