import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { signUp, signIn } from '../services/auth_service';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => signUp(email, password);
  const handleSignIn = () => signIn(email, password);

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  );
};

export default Settings;
