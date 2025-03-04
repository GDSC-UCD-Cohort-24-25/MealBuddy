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
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";

const YourFridge = () => {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, "users", userId, "ingredients");
    const q = query(ingredientsRef, orderBy("name"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIngredients(data);
      setFilteredIngredients(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilteredIngredients(
      query === ""
        ? ingredients
        : ingredients.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase())
          )
    );
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "ingredients", id));
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
      <TextInput
        style={styles.searchBar}
        placeholder="Search ingredients..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {filteredIngredients.length === 0 ? (
        <Text style={styles.noResults}>No ingredients found.</Text>
      ) : (
        <FlatList
          data={filteredIngredients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.ingredientText}>{item.name} ({item.serving_size})</Text>
              <Text style={styles.nutritionText}>Calories: {item.calories}</Text>
              <Text style={styles.nutritionText}>Protein: {item.protein}g</Text>
              <Text style={styles.nutritionText}>Fat: {item.total_fat}g</Text>
              <Text style={styles.nutritionText}>Water: {item.water}ml</Text>
              <Text style={styles.nutritionText}>Sugar: {item.sugar}g</Text>
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
    backgroundColor: '#f3fefb',
  },
  searchBar: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  item: {
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
