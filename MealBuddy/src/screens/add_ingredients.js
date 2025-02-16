import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../services/firebase_config';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native";


const AddIngredients = () => {
  const [ingredient, setIngredient] = useState('');
  const navigation = useNavigation();

  const handleAddIngredient = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Error', 'You need to be logged in to add ingredients.');
        return;
      }
      if (!ingredient.trim()) { // ✅ Prevents empty submission
        Alert.alert('Error', 'Ingredient cannot be empty.');
        return;
      }
  
      await addDoc(collection(db, 'ingredients'), {
        name: ingredient.trim(),
        userId: auth.currentUser.uid, // Associate ingredient with the logged-in user
      });
  
      console.log(`Ingredient Added: ${ingredient}`);
      setIngredient('');
      navigation.navigate("Your Fridge");
    } catch (error) {
      console.error('Error adding ingredient:', error.message);
      Alert.alert('Error', 'Failed to add ingredient. Try again.');
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
