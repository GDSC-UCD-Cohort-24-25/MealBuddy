import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../services/firebase_config';
import { collection, addDoc } from 'firebase/firestore';
import cleanedNutrition from '../data/cleaned_nutrition.json'; // Assuming JSON version of cleaned_nutrition.csv
import { useNavigation } from '@react-navigation/native';

const AddIngredients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
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
      
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'ingredients'), {
        name: ingredient.name,
        serving_size: `${ingredient.serving_size}g`,
        calories: ingredient.calories,
        protein: ingredient.protein,
        total_fat: ingredient.total_fat,
        water: ingredient.water,
        carbs: ingredient.carbohydrates,
      });
      
      Alert.alert('Success', `${ingredient.name} added to your fridge!`);
      setSearchQuery('');
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
      <FlatList
        data={filteredIngredients}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleAddIngredient(item)}>
            <Text>{item.name} - {item.serving_size}g</Text>
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
