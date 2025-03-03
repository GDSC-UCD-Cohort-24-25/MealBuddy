import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { db, auth } from "../services/firebase_config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";

const YourFridge = () => {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "used", or "unused"

  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, "users", userId, "ingredients");
    const q = query(ingredientsRef, orderBy("name"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIngredients(data);
      applyFilters(data, filter, searchQuery); // Apply filters when data changes
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    applyFilters(ingredients, filter, searchQuery); // Apply filters when filter or searchQuery changes
  }, [filter, searchQuery]);

  const applyFilters = (data, filter, query) => {
    let filteredData = data;

    // Apply search filter
    if (query) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply used/unused filter
    if (filter === "used") {
      filteredData = filteredData.filter((item) => item.used);
    } else if (filter === "unused") {
      filteredData = filteredData.filter((item) => !item.used);
    }

    setFilteredIngredients(filteredData);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery(""); // Clear the search query
    setFilter("all");
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Delete Ingredient",
      "Are you sure you want to delete this ingredient?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "users", auth.currentUser.uid, "ingredients", id));
            } catch (error) {
              Alert.alert("Error", "Failed to delete ingredient. Please try again.");
              console.error("Error deleting ingredient: ", error);
            }
          },
        },
      ]
    );
  };

  const handleMarkAsUsed = async (id, used) => {
    try {
      const ingredientRef = doc(db, "users", auth.currentUser.uid, "ingredients", id);
      await updateDoc(ingredientRef, { used: !used });
    } catch (error) {
      Alert.alert("Error", "Failed to update ingredient. Please try again.");
      console.error("Error updating ingredient: ", error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search ingredients..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <MaterialIcons name="close" size={24} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => handleFilterChange("all")}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "used" && styles.activeFilter]}
          onPress={() => handleFilterChange("used")}
        >
          <Text style={styles.filterText}>Used</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "unused" && styles.activeFilter]}
          onPress={() => handleFilterChange("unused")}
        >
          <Text style={styles.filterText}>Unused</Text>
        </TouchableOpacity>
      </View>
      {filteredIngredients.length === 0 ? (
        <Text style={styles.noResults}>No ingredients found.</Text>
      ) : (
        <FlatList
          data={filteredIngredients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.item, item.used && styles.usedItem]}>
              <TouchableOpacity
                onPress={() => handleMarkAsUsed(item.id, item.used)}
                style={styles.checkbox}
              >
                <MaterialIcons
                  name={item.used ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color={item.used ? "green" : "#ccc"}
                />
              </TouchableOpacity>
              <View style={styles.itemDetails}>
                <Text style={styles.ingredientText}>
                  {item.name} ({item.serving_size})
                </Text>
                <Text style={styles.nutritionText}>Calories: {item.calories}</Text>
                <Text style={styles.nutritionText}>Protein: {item.protein}g</Text>
                <Text style={styles.nutritionText}>Fat: {item.total_fat}g</Text>
                <Text style={styles.nutritionText}>Water: {item.water}ml</Text>
                <Text style={styles.nutritionText}>Sugar: {item.sugar}g</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  clearButton: {
    marginLeft: 10,
    padding: 5,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#ddd",
    alignItems: "center",
  },
  activeFilter: {
    backgroundColor: "#007bff",
  },
  filterText: {
    fontSize: 16,
    color: "#000",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  usedItem: {
    opacity: 0.6,
    backgroundColor: "#f0f0f0",
  },
  checkbox: {
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  ingredientText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nutritionText: {
    fontSize: 16,
    color: "#555",
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});

export default YourFridge;