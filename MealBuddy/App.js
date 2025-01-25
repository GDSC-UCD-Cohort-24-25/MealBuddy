import React from 'react';
import TabNavigator from './src/navigation/tab_navigator';
import firebase from './src/services/firebase_config';

console.log('Firebase Initialized:', firebase.apps.length > 0);

const App = () => {
  return <TabNavigator />;
};

export default App;
