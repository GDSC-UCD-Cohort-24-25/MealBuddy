import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { signUp, signIn } from '../services/auth_service';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => signUp(email, password);
  const handleSignIn = () => signIn(email, password);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <View style={styles.buttonContainer}>
          <Button title="Sign Up" onPress={handleSignUp} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Sign In" onPress={handleSignIn} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15, // Add more space between inputs
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginBottom: 20, // Add space between buttons
    width: '100%',
  },
});

export default Settings;
