import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../services/firebase_config';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import Colors from '../constants/Colors';

const RecipeSuggestions = () => {
  const [recipes, setRecipes] = useState([]);
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    const ingredientsRef = collection(db, "users", userId, "ingredients");
    
    const unsubscribe = onSnapshot(ingredientsRef, (snapshot) => {
      const ingredients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableIngredients(ingredients);
      generateRecipeSuggestions(ingredients);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateRecipeSuggestions = (ingredients) => {
    // This is a simplified version - in a real app, you'd want to use a more sophisticated
    // recipe matching algorithm or API
    const possibleRecipes = [
      {
        name: "Quick Stir Fry",
        ingredients: ["chicken", "vegetables", "rice", "soy sauce"],
        instructions: "1. Cook rice\n2. Stir fry chicken\n3. Add vegetables\n4. Season with soy sauce"
      },
      {
        name: "Simple Salad",
        ingredients: ["lettuce", "tomatoes", "cucumber", "olive oil"],
        instructions: "1. Chop vegetables\n2. Mix in bowl\n3. Drizzle with olive oil"
      },
      {
        name: "Pasta Primavera",
        ingredients: ["pasta", "vegetables", "olive oil", "garlic"],
        instructions: "1. Cook pasta\n2. Sauté vegetables\n3. Combine and season"
      }
    ];

    // Filter recipes based on available ingredients
    const matchedRecipes = possibleRecipes.filter(recipe => {
      const availableIngredientNames = ingredients.map(i => i.name.toLowerCase());
      return recipe.ingredients.every(ingredient => 
        availableIngredientNames.some(name => name.includes(ingredient))
      );
    }).slice(0, 3);

    setRecipes(matchedRecipes);
  };

  const handleUseRecipe = async (recipe) => {
    Alert.alert(
      "Use Recipe",
      "Would you like to use this recipe and remove the ingredients from your fridge?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Use Recipe",
          onPress: async () => {
            try {
              const userId = auth.currentUser.uid;
              const ingredientsToRemove = recipe.ingredients;
              
              // Remove used ingredients from fridge
              for (const ingredient of ingredientsToRemove) {
                const matchingIngredient = availableIngredients.find(
                  i => i.name.toLowerCase().includes(ingredient)
                );
                if (matchingIngredient) {
                  await deleteDoc(doc(db, "users", userId, "ingredients", matchingIngredient.id));
                }
              }
              
              Alert.alert("Success", "Ingredients have been removed from your fridge!");
            } catch (error) {
              console.error("Error removing ingredients:", error);
              Alert.alert("Error", "Failed to remove ingredients. Please try again.");
            }
          }
        }
      ]
    );
  };

  const toggleRecipe = (index) => {
    setExpandedRecipe(expandedRecipe === index ? null : index);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading recipe suggestions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipe Suggestions</Text>
      {recipes.length === 0 ? (
        <Text style={styles.noRecipes}>No recipes found with your current ingredients</Text>
      ) : (
        recipes.map((recipe, index) => (
          <View key={index} style={styles.recipeCard}>
            <TouchableOpacity
              style={styles.recipeHeader}
              onPress={() => toggleRecipe(index)}
            >
              <Text style={styles.recipeName}>{recipe.name}</Text>
              <MaterialIcons
                name={expandedRecipe === index ? "expand-less" : "expand-more"}
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
            
            {expandedRecipe === index && (
              <View style={styles.recipeDetails}>
                <Text style={styles.sectionTitle}>Ingredients:</Text>
                {recipe.ingredients.map((ingredient, i) => (
                  <Text key={i} style={styles.ingredient}>• {ingredient}</Text>
                ))}
                
                <Text style={styles.sectionTitle}>Instructions:</Text>
                <Text style={styles.instructions}>{recipe.instructions}</Text>
                
                <TouchableOpacity
                  style={styles.useButton}
                  onPress={() => handleUseRecipe(recipe)}
                >
                  <Text style={styles.useButtonText}>Use Recipe</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.primary,
  },
  recipeCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipeDetails: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  ingredient: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  useButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  useButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  noRecipes: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});

export default RecipeSuggestions; 