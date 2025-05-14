import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { db, auth } from '../services/firebase_config';
import { collection, addDoc } from 'firebase/firestore';
import cleanedNutrition from '../../data/classified_nutrition_final.json';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import axios from 'axios';

const NUTRITIONIX_APP_ID = 'b3411a25'; 
const NUTRITIONIX_API_KEY = 'a66f076457c5e4f03ddec204f5254b2b';

const fetchNutritionixData = async (query) => {
  try {
    const response = await axios.post(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      { query },
      {
        headers: {
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.foods?.length > 0) {
      const food = response.data.foods[0];
      const gramsPerItem = food.serving_qty > 0
        ? food.serving_weight_grams / food.serving_qty
        : food.serving_weight_grams;
      return {
        name: food.food_name,
        calories: food.nf_calories || 0,
        protein: food.nf_protein || 0,
        total_fat: food.nf_total_fat || 0,
        water: 0,
        sugar: food.nf_sugars || 0,
        food_group: "Unknown",
        image_url: food.photo?.thumb || '',
        source: "nutritionix", 
        serving_qty: food.serving_qty,
        serving_unit: food.serving_unit,
        serving_weight_grams: food.serving_weight_grams,
        grams_per_item: gramsPerItem, 
      };
    }

    return null;
  } catch (error) {
    console.error("Nutritionix API error:", error);
    return null;
  }
};


// MAPPING: USDA API Food Group -> User Friendly Food Groups
const tagMap = {
  "Beef Products": "protein",
  "Poultry Products": "protein",
  "Lamb, Veal, and Game Products": "protein",
  "Pork Products": "protein",
  "Finfish and Shellfish Products": "protein",
  "Legumes and Legume Products": "protein",
  "Dairy and Egg Products": "dairy",
  "Vegetables and Vegetable Products": "vegetables",
  "Fruits and Fruit Juices": "fruits",
  "Cereal Grains and Pasta": "grains",
  "Breakfast Cereals": "grains",
  "Baked Products": "grains",
  "Fast Foods": "fat, oil, salt, sugar",
  "Restaurant Foods": "fat, oil, salt, sugar",
  "Snacks": "fat, oil, salt, sugar",
  "Sweets": "fat, oil, salt, sugar",
  "Fats and Oils": "fat, oil, salt, sugar",
  "Soups, Sauces, and Gravies": "other",
  "Sausages and Luncheon Meats": "other",
  "Beverages": "other",
  "Baby Foods": "other",
  "Nut and Seed Products": "other",
  "Meals, Entrees, and Side Dishes": "other",
  "Spices and Herbs": "other",
  "American Indian/Alaska Native Foods": "other"
};


const AddIngredients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [gramInput, setGramInput] = useState('0');
  const [quantityInput, setQuantityInput] = useState('1');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const getTagFromFoodGroup = (group) => tagMap[group] || "other";
  //const [imageMap, setImageMap] = useState({});

  
  const IngredientItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.card} onPress={() => {
        if (item.source === 'nutritionix') {
          handleAddNutritionixIngredient(item); // ← auto-add if from Nutritionix
        } else {
          openModal(item); // ← still open modal for local dataset
        }
      }}>
        <Image
          source={{ uri: item.image_url || 'https://dummyimage.com/100x100/cccccc/000000&text=Food' }}
          style={styles.foodImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemTag}>🏷️ {getTagFromFoodGroup(item.food_group)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddNutritionixIngredient = async (ingredient) => {
    try {
      const round = (v) => Math.round(v * 10) / 10;
      const grams = ingredient.grams_per_item || ingredient.serving_weight_grams;
  
      const ingredientData = {
        name: ingredient.name,
        serving_size: `${Math.round(grams)}g per item`, // ✅ consistent label
        quantity: 1,
        total_weight: `${Math.round(grams)}g`,
        calories: round(ingredient.calories),
        protein: round(ingredient.protein),
        total_fat: round(ingredient.total_fat),
        water: round(ingredient.water),
        sugar: round(ingredient.sugar),
        food_group: ingredient.food_group || "Unknown",
        tags: [getTagFromFoodGroup(ingredient.food_group)],
        image_url: ingredient.image_url || 'https://dummyimage.com/100x100/cccccc/000000&text=Food',
      };
  
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'ingredients'), ingredientData);
  
      Alert.alert('Success', `${ingredient.name} added to your fridge!`);
      setSearchQuery('');
      setFilteredIngredients([]);
      navigation.navigate('Your Fridge');
    } catch (error) {
      console.error('Auto-add error:', error);
      Alert.alert('Error', 'Could not add this item automatically.');
    }
  };


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
        food_group: selectedIngredient.food_group || "Unknown",
        tags: [getTagFromFoodGroup(selectedIngredient.food_group)],
        image_url: selectedIngredient.image_url || 'https://dummyimage.com/100x100/cccccc/000000&text=Food',
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
  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setFilteredIngredients([]);
      return;
    }
  
    // Only call Nutritionix if there are no local results shown
    if (filteredIngredients.length === 0) {
      const result = await fetchNutritionixData(searchQuery);
      if (result) {
        setFilteredIngredients([result]);
      } else {
        setFilteredIngredients([]);
        Alert.alert("Not Found", "Nutritionix API could not find this item.");
      }
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredIngredients([]);
      return;
    }
  
    const filtered = cleanedNutrition.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredIngredients(filtered);
  }, [searchQuery]);
  

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for an ingredient"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch} // ← Pressing Enter triggers this
        style={styles.input}
      />
      <FlatList
        data={filteredIngredients}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <IngredientItem item={item} />}

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
              style={styles.fixedInput}
            />
            <Text style={styles.modalText}>Enter the quantity:</Text>
            <TextInput
              placeholder="Quantity"
              value={quantityInput}
              onChangeText={setQuantityInput}
              keyboardType="numeric"
              style={styles.fixedInput}
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
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f3fefb', // Updated background color
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderColor: '#ccc',
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 10,
    // width: '80%',
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

  fixedInput: {
    width: 120, // Fixed width for consistency
    height: 45, // Fixed height for uniformity
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    textAlign: 'center', // Ensures proper number input alignment
    fontSize: 16,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemTag: {
    fontSize: 14,
    color: '#888',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  }
  

});

export default AddIngredients;
