import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { db, auth } from '../services/firebase_config';
import { collection, addDoc } from 'firebase/firestore';
import cleanedNutrition from '../../data/cleaned_nutrition.json';
import { useNavigation } from '@react-navigation/native';

const AddIngredients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [gramInput, setGramInput] = useState('0');
  const [quantityInput, setQuantityInput] = useState('1');
  const [modalVisible, setModalVisible] = useState(false);
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

  const openModal = (ingredient) => {
    setSelectedIngredient(ingredient);
    setModalVisible(true);
  };

  const handleAddIngredient = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Error', 'You need to be logged in to add ingredients.');
        return;
      }
      if (!selectedIngredient) {
        Alert.alert('Error', 'Please select an ingredient.');
        return;
      }
      if (!gramInput.trim() || !quantityInput.trim()) {
        Alert.alert('Error', 'Please specify quantity and grams.');
        return;
      }

      const grams = parseFloat(gramInput);
      const quantity = parseInt(quantityInput);
      if (isNaN(grams) || grams <= 0 || isNaN(quantity) || quantity <= 0) {
        Alert.alert('Error', 'Please enter valid values for grams and quantity.');
        return;
      }

      const scaleFactor = (grams / 100) * quantity;
      const roundToOneDecimal = (value) => Math.round(value * 10) / 10;
      const ingredientData = {
        name: selectedIngredient.name,
        serving_size: `${grams}g per item`,
        quantity: quantity,
        total_weight: `${grams * quantity}g`,
        calories: roundToOneDecimal(selectedIngredient.calories * scaleFactor),
        protein: roundToOneDecimal(selectedIngredient.protein * scaleFactor),
        total_fat: roundToOneDecimal(selectedIngredient.total_fat * scaleFactor),
        water: roundToOneDecimal(selectedIngredient.water * scaleFactor),
        sugar: roundToOneDecimal(selectedIngredient.sugar * scaleFactor),
      };

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'ingredients'), ingredientData);

      Alert.alert('Success', `${selectedIngredient.name} added to your fridge!`);
      setModalVisible(false);
      setSearchQuery('');
      setGramInput('0');
      setQuantityInput('1');
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
          <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Enter the grams per item:</Text>
            <TextInput
              placeholder="Grams per item"
              value={gramInput}
              onChangeText={setGramInput}
              keyboardType="numeric"
              style={styles.input}
            />
            <Text style={styles.modalText}>Enter the quantity:</Text>
            <TextInput
              placeholder="Quantity"
              value={quantityInput}
              onChangeText={setQuantityInput}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button title="Add Ingredient" onPress={handleAddIngredient} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
    width: '100%',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default AddIngredients;
