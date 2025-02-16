import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors'; // Import theme colors

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 18,
    color: Colors.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default styles;
