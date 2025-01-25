import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';

const SuggestedRecipes = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState('');

  const getRecipeSuggestions = async () => {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Suggest recipes with: ${ingredients}` }],
      },
      {
        headers: { Authorization: `Bearer YOUR_OPENAI_API_KEY` },
      }
    );
    setRecipes(response.data.choices[0].message.content);
  };

  return (
    <View>
      <TextInput
        placeholder="Enter ingredients"
        value={ingredients}
        onChangeText={setIngredients}
      />
      <Button title="Get Recipes" onPress={getRecipeSuggestions} />
      <Text>{recipes}</Text>
    </View>
  );
};

export default SuggestedRecipes;
