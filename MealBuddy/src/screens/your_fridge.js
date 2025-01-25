import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import firebase from '../services/firebase_config';

const YourFridge = () => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      const snapshot = await firebase.firestore().collection('ingredients').get();
      setIngredients(snapshot.docs.map(doc => doc.data()));
    };

    fetchIngredients();
  }, []);

  return (
    <View>
      <FlatList
        data={ingredients}
        renderItem={({ item }) => <Text>{item.name}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
      {/* Add functionality to edit/delete ingredients */}
    </View>
  );
};

export default YourFridge;
