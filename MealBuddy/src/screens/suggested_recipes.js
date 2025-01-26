import React, { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const SuggestedRecipes = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState('');
  const [loading, setLoading] = useState(false);

  const getRecipeSuggestions = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Suggest recipes with: ${ingredients}` }],
        },
        {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        }
      );
      setRecipes(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error fetching recipes:', error.message);
      setRecipes('Failed to fetch recipes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter ingredients"
        value={ingredients}
        onChangeText={setIngredients}
        style={styles.input}
      />
      <Button title="Get Recipes" onPress={getRecipeSuggestions} />
      {loading ? <ActivityIndicator size="large" color="#007bff" /> : <Text>{recipes}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default SuggestedRecipes;
