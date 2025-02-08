import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text,
  },
  text: {
    fontSize: 18,
    marginBottom: 5,
    color: Colors.text,
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderColor: Colors.secondary,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  error_text: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  button_container: {
    width: '100%',
    marginBottom: 10,
  },
});
