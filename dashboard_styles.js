import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.text,
  },
  mealContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  largeTrackerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    gap: 30,
  },
  smallTrackerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    gap: 15,
  },
  
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  foodItem: {
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  nutritionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  nutritionText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  


  greetingContainer: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  loggedText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  
  mealOfDayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealOfDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealOfDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  logMealButton: {
    backgroundColor: '#5e2bff',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  logMealButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mealCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  placeholderBox: {
    width: 60,
    height: 60,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginRight: 10,
  },
  mealCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  viewAllText: {
    color: '#5e2bff',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  nutritionSummaryContent: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
});
