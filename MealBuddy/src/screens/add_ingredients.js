import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import firebase from '../services/firebase_config';

const AddIngredients = () => {
  const [ingredient, setIngredient] = useState('');

  const handleAddIngredient = async () => {
    try {
      await firebase.firestore().collection('ingredients').add({ name: ingredient });
      console.log(`Ingredient Added: ${ingredient}`);
      setIngredient('');
    } catch (error) {
      console.error('Error adding ingredient:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter ingredient"
        value={ingredient}
        onChangeText={setIngredient}
        style={styles.input}
      />
      <Button title="Add Ingredient" onPress={handleAddIngredient} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default AddIngredients;
