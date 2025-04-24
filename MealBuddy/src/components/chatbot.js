import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleChat = async () => {
    try {
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful meal planning assistant. Provide concise and informative responses related to meal planning, nutrition, recipes, and healthy eating habits. Keep your answers short and easy to understand.',
            },
            { role: 'user', content: input },
          ],
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
