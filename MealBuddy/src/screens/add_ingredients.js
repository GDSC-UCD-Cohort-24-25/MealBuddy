import React, { useState, useEffect } from 'react';
import {
  View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet,
  Alert, Modal, ImageBackground
} from 'react-native';
import { db, auth } from '../services/firebase_config';
import { collection, addDoc } from 'firebase/firestore';
import cleanedNutrition from '../../data/cleaned_nutrition.json';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const mealCategoryOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const AddIngredients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [gramInput, setGramInput] = useState('0');
  const [quantityInput, setQuantityInput] = useState('1');
  const [modalVisible, setModalVisible] = useState(false);
  const [mealCategoryPickerVisible, setMealCategoryPickerVisible] = useState(false);
  const [mealCategory, setMealCategory] = useState('');

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

  const proceedToMealCategory = () => {
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
    setModalVisible(false);
    setMealCategoryPickerVisible(true);
  };

  const handleAddIngredient = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Error', 'You need to be logged in to add ingredients.');
        return;
      }

      const grams = parseFloat(gramInput);
      const quantity = parseInt(quantityInput);
      const scaleFactor = (grams / 100) * quantity;
      const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

      const ingredientData = {
        name: selectedIngredient.name,
        serving_size: `${grams}g per item`,
        quantity,
        total_weight: `${grams * quantity}g`,
        calories: roundToOneDecimal(selectedIngredient.calories * scaleFactor),
        protein: roundToOneDecimal(selectedIngredient.protein * scaleFactor),
        total_fat: roundToOneDecimal(selectedIngredient.total_fat * scaleFactor),
        water: roundToOneDecimal(selectedIngredient.water * scaleFactor),
        sugar: roundToOneDecimal(selectedIngredient.sugar * scaleFactor),
        mealCategory: mealCategory || 'breakfast',
      };

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'ingredients'), ingredientData);

      Alert.alert('Success', `${selectedIngredient.name} added to your fridge!`);
      setMealCategoryPickerVisible(false);
      setSearchQuery('');
      setGramInput('0');
      setQuantityInput('1');
      setMealCategory('');
      navigation.navigate('Your Fridge');
    } catch (error) {
      console.error('Error adding ingredient:', error);
      Alert.alert('Error', 'Failed to add ingredient. Try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../../images/background.png')}
      resizeMode="cover"
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.3 }}
    >
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
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemCard} onPress={() => openModal(item)}>
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Grams and Quantity Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Grams per item:</Text>
              <TextInput
                placeholder="e.g. 100"
                value={gramInput}
                onChangeText={setGramInput}
                keyboardType="numeric"
                style={styles.fixedInput}
              />
              <Text style={styles.modalText}>Quantity:</Text>
              <TextInput
                placeholder="e.g. 1"
                value={quantityInput}
                onChangeText={setQuantityInput}
                keyboardType="numeric"
                style={styles.fixedInput}
              />
              <TouchableOpacity style={styles.addButton} onPress={proceedToMealCategory}>
                <Text style={styles.addButtonText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Scrollable Picker Modal for Meal Category */}
        <Modal visible={mealCategoryPickerVisible} transparent animationType="slide">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.modalText}>Select Meal Category</Text>
              <Picker
                selectedValue={mealCategory}
                onValueChange={(value) => setMealCategory(value)}
                style={{ backgroundColor: '#fff' }}
                itemStyle={{ fontSize: 18, color: '#000' }}
              >
                {mealCategoryOptions.map((option) => (
                  <Picker.Item label={option} value={option.toLowerCase()} key={option} />
                ))}
              </Picker>
              <TouchableOpacity
                style={styles.donePickerButton}
                onPress={() => {
                  if (!mealCategory) setMealCategory(mealCategoryOptions[0].toLowerCase());
                  handleAddIngredient();
                }}
              >
                <Text style={styles.donePickerText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMealCategoryPickerVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    marginBottom: 10, padding: 10, borderColor: '#ccc',
    backgroundColor: '#fff', borderWidth: 1, borderRadius: 10,
  },
  itemCard: {
    backgroundColor: '#fff', padding: 15, marginVertical: 5,
    borderRadius: 10, elevation: 2,
  },
  itemText: { fontSize: 16, color: '#333' },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: 'white', padding: 20, borderRadius: 10,
    width: '85%', alignItems: 'center',
  },
  modalText: { fontSize: 16, marginVertical: 5, fontWeight: '600' },
  fixedInput: {
    width: 120, height: 45, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff',
    textAlign: 'center', fontSize: 16, marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#5e2bff', paddingVertical: 12,
    paddingHorizontal: 30, borderRadius: 8, marginTop: 10,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { marginTop: 10 },
  cancelButtonText: {
    color: 'red',
    fontSize: 17,
    textAlign: 'center',
    paddingVertical: 14,          // Same height as "Done"
    width: '100%',                // Full width
    fontWeight: '600',
  },
  pickerOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pickerContainer: {
    backgroundColor: '#fff', padding: 20,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  donePickerButton: {
    backgroundColor: '#5e2bff',
    paddingVertical: 14,            // More touch-friendly
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
    width: '100%',                 // Full width for easier tapping
  },
  donePickerText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16,
  },
});

export default AddIngredients;
