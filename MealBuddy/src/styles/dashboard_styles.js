import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../constants/Colors';

// Constants for consistent spacing, fonts, etc.
const SPACING = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 25,
  xxl: 30
};

const FONT_SIZE = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24
};

const CARD_STYLE = {
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: SPACING.md,
  marginBottom: SPACING.md,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4
};

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  // Page layout
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  
  // Header & greeting
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  greetingContainer: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  greetingText: {
    fontSize: FONT_SIZE.xxlarge,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZE.small,
    color: '#666',
    marginBottom: SPACING.xs,
  },
  loggedText: {
    fontSize: FONT_SIZE.small,
    color: '#666',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginLeft: SPACING.md,
  },
  
  // Cards
  card: {
    ...CARD_STYLE,
    marginBottom: SPACING.lg,
  },
  mealContainer: {
    ...CARD_STYLE,
    marginTop: SPACING.md,
  },
  mealOfDayCard: {
    ...CARD_STYLE,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZE.large,
    fontWeight: 'bold',
    color: Colors.text,
  },
  
  // Meal of Day section
  mealOfDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealOfDayTitle: {
    fontSize: FONT_SIZE.large,
    fontWeight: 'bold',
    color: Colors.text,
  },
  logMealButton: {
    backgroundColor: '#5e2bff',
    borderRadius: 20,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    shadowColor: '#5e2bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  logMealButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.small,
    fontWeight: '600',
  },
  mealCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: SPACING.md,
  },
  placeholderBox: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginRight: SPACING.md,
  },
  mealCardTitle: {
    fontSize: FONT_SIZE.medium,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  viewAllText: {
    color: '#5e2bff',
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.small,
    fontWeight: '500',
    textAlign: 'right',
  },
  
  // Nutrition section
  nutritionSummaryCard: {
    ...CARD_STYLE,
    padding: SPACING.lg,
  },
  nutritionSummaryContent: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  largeTrackerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.xl,
    paddingHorizontal: 0,
  },
  smallTrackerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '110%',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    paddingLeft: -10, // Add left padding to shift trackers left
    paddingRight: 0,
    overflow: 'visible',
    gap: 0, // Add spacing between items
  },
  
  // Suggested recipes section
  recipeScrollView: {
    marginVertical: SPACING.md,
  },
  recipesSectionContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: SPACING.sm,
  },
  recipesSectionTitle: {
    fontSize: FONT_SIZE.large,
    fontWeight: 'bold',
    color: Colors.text,
  },
  recipeCard: {
    width: width * 0.7,
    marginRight: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f7f7f7',
  },
  recipeContent: {
    padding: SPACING.md,
  },
  recipeTitle: {
    fontSize: FONT_SIZE.medium,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: SPACING.xs,
  },
  recipeButton: {
    backgroundColor: '#5e2bff',
    borderRadius: 20,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  recipeButtonText: {
    color: '#fff',
    fontSize: FONT_SIZE.small,
    fontWeight: '600',
  },
  
  // Meal items
  mealTitle: {
    fontSize: FONT_SIZE.large,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: SPACING.sm,
  },
  foodItem: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: '#f9f9fb',
    borderRadius: 12,
  },
  foodName: {
    fontSize: FONT_SIZE.medium,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: SPACING.xs,
  },
  nutritionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  nutritionText: {
    fontSize: FONT_SIZE.small,
    color: '#666',
    marginRight: SPACING.md,
  },
  
  // ChatBot CTA
  chatbotCTA: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: '#5e2bff',
    borderRadius: 30,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  chatbotCTAText: {
    color: '#fff',
    fontSize: FONT_SIZE.medium,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
});
