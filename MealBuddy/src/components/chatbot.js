import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../services/firebase_config';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ingredientsRef = collection(db, "users", userId, "ingredients");
    const q = query(ingredientsRef, orderBy("name"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIngredients(data);
    });

    return () => unsubscribe();
  }, []);

  const handleChat = async () => {
    try {
      const fridgeList = ingredients.map(item => item.name).join(', ');
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
<<<<<<< Updated upstream
          messages: [{ role: 'user', content: input }],
=======
          messages: [
            {
              role: 'system',
              content: `You are a smart meal planner assistant. When the user gives you a list of ingredients they have in their fridge, reply with:
                1. Three meal ideas they could make.
                2. For each meal, include:
                  - A short, enticing title.
                  - A one-sentence description.
                  - A public image URL (if available) to show a visual preview.
                Only show these previews first.

                If the user selects or types one of the meal names, respond with a full recipe for that meal using only the ingredients they provided. If an ingredient is missing, suggest the simplest substitution or ask if it can be skipped.

                Keep all responses friendly, clear, and concise.`,
            },
            {
              role: 'user',
              content: `The user's fridge contains: ${fridgeList}`,
            },
            {
              role: 'user',
              content: input,
            },
          ],
>>>>>>> Stashed changes
        },
        {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        }
      );
      setResponse(result.data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, there was an error processing your request.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MealBuddy Chatbot</Text>
      <View style={styles.chatContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.button} onPress={handleChat}>
          <Text style={styles.buttonText}>Ask</Text>
        </TouchableOpacity>
      </View>
      {response ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
  },
  responseText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Chatbot;
