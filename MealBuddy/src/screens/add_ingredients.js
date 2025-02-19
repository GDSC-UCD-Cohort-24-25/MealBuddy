import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../services/firebase_config';
import { collection, addDoc } from 'firebase/firestore';
import cleanedNutrition from '../../data/cleaned_nutrition.json';
import { useNavigation } from '@react-navigation/native';

const AddIngredients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [gramInput, setGramInput] = useState('100'); // Default to 100g
  const navigation = useNavigation();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredIngredients([]);
    } else {
      const filtered = cleanedNutrition.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredIngredients(filtered);
    }
  }, [searchQuery]);

  const handleAddIngredient = async (ingredient) => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Error', 'You need to be logged in to add ingredients.');
        return;
      }
      if (!searchQuery.trim()) {
        Alert.alert('Error', 'Ingredient name cannot be empty.');
        return;
      }
      if (!gramInput.trim()) {
        Alert.alert('Error', 'Please specify quantity in grams.');
        return;
      }

      const grams = parseFloat(gramInput);
      if (isNaN(grams) || grams <= 0) {
        Alert.alert('Error', 'Please enter a valid gram amount.');
        return;
      }

      const scaleFactor = grams / 100; // Scaling based on 100g serving size

      const ingredientData = {
        name: ingredient.name,
        serving_size: `${grams}g`,
        calories: Math.round(ingredient.calories * scaleFactor),
        protein: Math.round(ingredient.protein * scaleFactor * 10) / 10,
        total_fat: Math.round(ingredient.total_fat * scaleFactor * 10) / 10,
        water: Math.round(ingredient.water * scaleFactor * 10) / 10,
        carbs: Math.round(ingredient.carbohydrates * scaleFactor * 10) / 10,
      };

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'ingredients'), ingredientData);

      Alert.alert('Success', `${ingredient.name} added to your fridge!`);
      setSearchQuery('');
      setGramInput('100'); // Reset input
      navigation.navigate('Your Fridge');
    } catch (error) {
      console.error('Error adding ingredient:', error);
      Alert.alert('Error', 'Failed to add ingredient. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for an ingredient"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
      />
      <TextInput
        placeholder="Enter grams (g)"
        value={gramInput}
        onChangeText={setGramInput}
        keyboardType="numeric"
        style={styles.input}
      />
      <FlatList
        data={filteredIngredients}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleAddIngredient(item)}>
            <Text>{item.name} - 100g (default)</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    marginBottom: 10,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default AddIngredients;
