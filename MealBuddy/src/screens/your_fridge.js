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
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";

const YourFridge = () => {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedItems, setSelectedItems] = useState(new Set());

  // ✅ Fetch Ingredients (Real-time updates)
  useEffect(() => {
    const fetchIngredients = async () => {
      if (!auth.currentUser) {
        console.error("❌ No user is logged in");
        setIngredients([]);
        setFilteredIngredients([]);
        setLoading(false);
        return;
      }

      const userId = auth.currentUser.uid;
      console.log("🔍 Fetching ingredients for user:", userId);

      const ingredientsRef = collection(db, "users", userId, "ingredients");
      const q = query(ingredientsRef, orderBy("name"));

      // ✅ Real-time Firestore listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log("📥 Firestore Data Updated:", snapshot.docs.map((doc) => doc.data()));

          if (!snapshot.empty) {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setIngredients(data);
            setFilteredIngredients(data);
          } else {
            console.log("📭 No ingredients found.");
            setIngredients([]);
            setFilteredIngredients([]);
          }
          setLoading(false);
        },
        (error) => {
          console.error("🔥 Firestore error:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    };

    fetchIngredients();
  }, []);

  // ✅ Search function
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredIngredients(ingredients);
    } else {
      const filtered = ingredients.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredIngredients(filtered);
    }
  };

  // ✅ Toggle selection
  const toggleSelection = (id) => {
    setSelectedItems((prevSelected) => {
      const newSelected = new Set(prevSelected);
      newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
      console.log("✅ Selected Items Updated:", [...newSelected]);
      return newSelected;
    });
  };

  // ✅ Delete selected ingredients
  const handleDelete = async () => {
    console.log("Delete button pressed");
    if (selectedItems.size === 0) {
      Alert.alert("No selection", "Please select items to delete.");
      return;
    }

    Alert.alert("Confirm Delete", "Are you sure you want to delete selected items?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const userId = auth.currentUser.uid;
            const deletePromises = [...selectedItems].map(async (id) => {
              await deleteDoc(doc(db, "users", userId, "ingredients", id));
            });

            await Promise.all(deletePromises);
            console.log("🗑️ Deleted:", [...selectedItems]);
            setSelectedItems(new Set());
          } catch (error) {
            console.error("🔥 Error deleting ingredients:", error.message);
          }
        },
      },
    ]);
  };

  // ✅ Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔍 Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search ingredients..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* 🔄 Toggle Grid/List View */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
      >
        <Text style={styles.toggleText}>
          {viewMode === "grid" ? "Switch to List View" : "Switch to Grid View"}
        </Text>
      </TouchableOpacity>

      {/* 🗑️ Delete Button */}
      <TouchableOpacity
        style={[styles.deleteButton, selectedItems.size === 0 && styles.disabledButton]}
        onPress={handleDelete}
        disabled={selectedItems.size === 0}
      >
        <MaterialIcons name="delete" size={24} color="#fff" />
        <Text style={styles.deleteText}>Delete Selected</Text>
      </TouchableOpacity>

      {/* 📭 Show No Results Message When Search Returns Nothing */}
      {filteredIngredients.length === 0 ? (
        <Text style={styles.noResults}>No ingredients found.</Text>
      ) : (
        <FlatList
          data={filteredIngredients}
          key={viewMode}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === "grid" ? 2 : 1}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                viewMode === "grid" ? styles.card : styles.listItem,
                selectedItems.has(item.id) && styles.selectedItem, // ✅ Highlight selected
              ]}
              onPress={() => toggleSelection(item.id)}
            >
              <Text style={styles.ingredientText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

// ✅ Styles (Same as before)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  searchBar: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  toggleButton: {
    padding: 10,
    backgroundColor: "#007bff",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 5,
  },
  toggleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#dc3545",
    borderRadius: 5,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default YourFridge;
