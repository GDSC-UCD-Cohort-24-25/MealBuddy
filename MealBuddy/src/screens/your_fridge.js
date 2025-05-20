import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Image,
  RefreshControl
} from "react-native";
import { db, auth } from "../services/firebase_config";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";

const YourFridge = () => {
  // State variables
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mealFilter, setMealFilter] = useState("all");

  // Fetch ingredients from Firebase
  const fetchIngredients = useCallback(() => {
    if (!auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, "users", userId, "ingredients");
    const q = query(ingredientsRef, orderBy("name"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIngredients(data);
      applyFilters(data, searchQuery, mealFilter);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, [searchQuery, mealFilter]);

  // Initial data loading
  useEffect(() => {
    const unsubscribe = fetchIngredients();
    return () => unsubscribe && unsubscribe();
  }, [fetchIngredients]);

  // Apply both search query and meal category filters
  const applyFilters = (data, query, meal) => {
    let filtered = data;
    
    // Apply search query filter
    if (query !== "") {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply meal category filter
    if (meal !== "all") {
      filtered = filtered.filter((item) => 
        (item.mealCategory || "").toLowerCase() === meal.toLowerCase()
      );
    }
    
    setFilteredIngredients(filtered);
  };

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(ingredients, query, mealFilter);
  };

  // Handle meal category filter
  const handleMealFilter = (category) => {
    setMealFilter(category);
    applyFilters(ingredients, searchQuery, category);
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIngredients();
  }, [fetchIngredients]);

  // Handle ingredient deletion with confirmation
  const handleDelete = async (id, name) => {
    Alert.alert(
      "Delete Ingredient",
      `Are you sure you want to remove ${name} from your fridge?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "users", auth.currentUser.uid, "ingredients", id));
              Alert.alert("Success", `${name} was removed from your fridge.`);
            } catch (error) {
              console.error("Error deleting ingredient:", error);
              Alert.alert("Error", "Failed to delete ingredient. Please try again.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Render filter tabs
  const renderFilterTabs = () => {
    const tabs = [
      { id: "all", label: "All" },
      { id: "breakfast", label: "Breakfast" },
      { id: "lunch", label: "Lunch" },
      { id: "dinner", label: "Dinner" },
      { id: "snack", label: "Snack" }
    ];

    return (
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterTab,
                mealFilter === item.id && styles.activeFilterTab
              ]}
              onPress={() => handleMealFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  mealFilter === item.id && styles.activeFilterText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5e2bff" />
        <Text style={styles.loadingText}>Loading your ingredients...</Text>
      </View>
    );
  }

  // Main render
  return (
    <ImageBackground
      source={require('../../images/background.png')}
      resizeMode="cover"
      style={StyleSheet.absoluteFillObject}
      imageStyle={{ opacity: 0.3 }}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search ingredients..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        
        {renderFilterTabs()}
        
        {filteredIngredients.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="no-food" size={64} color="#ccc" />
            <Text style={styles.noResults}>No ingredients found</Text>
            <Text style={styles.noResultsSubtext}>
              {ingredients.length > 0 
                ? "Try adjusting your search or filters" 
                : "Add some ingredients to your fridge"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredIngredients}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ backgroundColor: 'transparent', paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#5e2bff"]} />
            }
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.imageAndText}>
                  <Image
                    source={{ uri: item.image_url || 'https://dummyimage.com/100x100/cccccc/000000&text=Food' }}
                    style={styles.foodImage}
                  />
                  <View style={styles.ingredientDetails}>
                    <Text style={styles.ingredientText}>{item.name}</Text>
                    <Text style={styles.servingText}>{item.serving_size} • Qty: {item.quantity || 1}</Text>
                    
                    <View style={styles.nutritionContainer}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.calories}</Text>
                        <Text style={styles.nutritionLabel}>Calories</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.protein}g</Text>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.total_fat}g</Text>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{isNaN(item.sugar) ? 0 : item.sugar}g</Text>
                        <Text style={styles.nutritionLabel}>Sugar</Text>
                      </View>
                    </View>
                    
                    {item.mealCategory && (
                      <View style={[styles.mealCategoryTag, getMealCategoryStyle(item.mealCategory)]}>
                        <Text style={styles.mealCategoryText}>
                          {capitalizeFirstLetter(item.mealCategory)}
                        </Text>
                      </View>
                    )}
                    
                    {item.tags && item.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {item.tags.map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id, item.name)}
                >
                  <MaterialIcons name="delete" size={24} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </ImageBackground>
  );
};

// Helper functions
const capitalizeFirstLetter = (string) => {
  return string && string.charAt(0).toUpperCase() + string.slice(1);
};

const getMealCategoryStyle = (category) => {
  const styles = {
    breakfast: { backgroundColor: '#ffcc00' },
    lunch: { backgroundColor: '#34c759' },
    dinner: { backgroundColor: '#5856d6' },
    snack: { backgroundColor: '#ff9500' }
  };
  
  return styles[category.toLowerCase()] || { backgroundColor: '#8e8e93' };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "transparent"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3fefb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#5e2bff',
  },
  searchBar: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterTab: {
    backgroundColor: '#5e2bff',
  },
  filterText: {
    fontSize: 14,
    color: '#555',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  item: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageAndText: {
    flexDirection: 'row',
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  ingredientDetails: {
    flex: 1,
  },
  ingredientText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  servingText: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },
  mealCategoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  mealCategoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#555',
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noResults: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default YourFridge;