import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const AddIngredients = () => {
  const [ingredient, setIngredient] = useState('');

  const pickImage = () => {
    launchImageLibrary({}, (response) => {
      if (response.assets) {
        console.log(response.assets[0].uri);
      }
    });
  };

  const handleAddIngredient = () => {
    console.log(`Ingredient Added: ${ingredient}`);
    // Add functionality to save to Firebase
  };

  return (
    <View>
      <TextInput
        placeholder="Enter ingredient"
        value={ingredient}
        onChangeText={setIngredient}
      />
      <Button title="Add Ingredient" onPress={handleAddIngredient} />
      <Button title="Upload Receipt" onPress={pickImage} />
    </View>
  );
};

export default AddIngredients;
