import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { db } from '../services/firebase_config';
import { collection, addDoc } from 'firebase/firestore';

const AddIngredients = () => {
  const [ingredient, setIngredient] = useState('');

  const handleAddIngredient = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Error', 'You need to be logged in to add ingredients.');
        return;
      }
  
      await addDoc(collection(db, 'ingredients'), {
        name: ingredient,
        userId: auth.currentUser.uid, // Associate ingredient with the logged-in user
      });
  
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
